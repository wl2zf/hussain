"""
Tashfeer (تشفير) — a local, zero-configuration encryption web app.

Run:
    pip install flask cryptography
    python app.py
Then open http://localhost:5000

Seven algorithms, all server-side via the `cryptography` library:
AES-256-GCM, RSA-2048 (hybrid), ChaCha20-Poly1305, Triple-DES,
Camellia-256, AES-256-CBC+HMAC (encrypt-then-MAC), and Fernet.

All password-based algorithms stretch the user's password to the exact key
length they need with PBKDF2-HMAC-SHA256 (100,000 iterations, random 16-byte
salt per operation), so even a 3-character password works.
"""

import os
import sys
import base64
import importlib.util
import subprocess


# --------------------------------------------------------------------------- #
# First-run convenience: auto-install dependencies (no-op if already present)
# --------------------------------------------------------------------------- #
def ensure_dependencies():
    required = {"flask": "flask", "cryptography": "cryptography"}
    missing = [spec for mod, spec in required.items()
               if importlib.util.find_spec(mod) is None]
    if not missing:
        return
    print("[Tashfeer] Installing required packages:", ", ".join(missing))
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
        importlib.invalidate_caches()
    except Exception as exc:  # noqa: BLE001
        sys.exit(
            "\n[Tashfeer] Could not auto-install dependencies.\n"
            "Please run once:  pip install flask cryptography\n"
            f"Details: {exc}\n"
        )


ensure_dependencies()

from flask import Flask, request, jsonify, render_template, send_file

from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
try:
    # Newer cryptography moved these "legacy" ciphers to a decrepit module.
    from cryptography.hazmat.decrepit.ciphers.algorithms import TripleDES, Camellia
except ImportError:  # older versions still expose them on `algorithms`
    from cryptography.hazmat.primitives.ciphers.algorithms import TripleDES, Camellia
from cryptography.hazmat.primitives import hashes, hmac, serialization
from cryptography.hazmat.primitives import padding as sym_padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import padding as rsa_padding
from cryptography.fernet import Fernet


# --------------------------------------------------------------------------- #
# App + folders
# --------------------------------------------------------------------------- #
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = Flask(__name__)

ITERATIONS = 100_000


def derive(password: str, salt: bytes, length: int) -> bytes:
    """Stretch a password to `length` bytes with PBKDF2-HMAC-SHA256."""
    return PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=length, salt=salt, iterations=ITERATIONS
    ).derive(password.encode("utf-8"))


b64e = base64.b64encode
b64d = base64.b64decode


# --------------------------------------------------------------------------- #
# 1) AES-256-GCM     out: salt[16] + nonce[12] + ct(+tag)
# --------------------------------------------------------------------------- #
def aes_encrypt(data, pw):
    salt, nonce = os.urandom(16), os.urandom(12)
    ct = AESGCM(derive(pw, salt, 32)).encrypt(nonce, data, None)
    return b64e(salt + nonce + ct)


def aes_decrypt(token, pw):
    raw = b64d(token); salt, nonce, ct = raw[:16], raw[16:28], raw[28:]
    return AESGCM(derive(pw, salt, 32)).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# 2) ChaCha20-Poly1305   out: salt[16] + nonce[12] + ct(+tag)
# --------------------------------------------------------------------------- #
def chacha_encrypt(data, pw):
    salt, nonce = os.urandom(16), os.urandom(12)
    ct = ChaCha20Poly1305(derive(pw, salt, 32)).encrypt(nonce, data, None)
    return b64e(salt + nonce + ct)


def chacha_decrypt(token, pw):
    raw = b64d(token); salt, nonce, ct = raw[:16], raw[16:28], raw[28:]
    return ChaCha20Poly1305(derive(pw, salt, 32)).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# 3) Triple-DES (CBC, IV[8], PKCS7/64, 24-byte key)   out: salt[16]+iv[8]+ct
# --------------------------------------------------------------------------- #
def tdes_encrypt(data, pw):
    salt, iv = os.urandom(16), os.urandom(8)
    key = derive(pw, salt, 24)
    padder = sym_padding.PKCS7(64).padder()
    padded = padder.update(data) + padder.finalize()
    enc = Cipher(TripleDES(key), modes.CBC(iv)).encryptor()
    return b64e(salt + iv + enc.update(padded) + enc.finalize())


def tdes_decrypt(token, pw):
    raw = b64d(token); salt, iv, ct = raw[:16], raw[16:24], raw[24:]
    dec = Cipher(TripleDES(derive(pw, salt, 24)), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    unp = sym_padding.PKCS7(64).unpadder()
    return unp.update(padded) + unp.finalize()


# --------------------------------------------------------------------------- #
# 4) Camellia-256 (CBC, IV[16], PKCS7/128, 32-byte key)  out: salt[16]+iv[16]+ct
# --------------------------------------------------------------------------- #
def camellia_encrypt(data, pw):
    salt, iv = os.urandom(16), os.urandom(16)
    key = derive(pw, salt, 32)
    padder = sym_padding.PKCS7(128).padder()
    padded = padder.update(data) + padder.finalize()
    enc = Cipher(Camellia(key), modes.CBC(iv)).encryptor()
    return b64e(salt + iv + enc.update(padded) + enc.finalize())


def camellia_decrypt(token, pw):
    raw = b64d(token); salt, iv, ct = raw[:16], raw[16:32], raw[32:]
    dec = Cipher(Camellia(derive(pw, salt, 32)), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    unp = sym_padding.PKCS7(128).unpadder()
    return unp.update(padded) + unp.finalize()


# --------------------------------------------------------------------------- #
# 5) AES-256-CBC + HMAC-SHA256 (Encrypt-then-MAC)
#    keys: 64 bytes -> enc[32] + mac[32]   out: salt[16]+iv[16]+hmac[32]+ct
# --------------------------------------------------------------------------- #
def aescbc_encrypt(data, pw):
    salt, iv = os.urandom(16), os.urandom(16)
    keys = derive(pw, salt, 64)
    enc_key, mac_key = keys[:32], keys[32:]
    padder = sym_padding.PKCS7(128).padder()
    padded = padder.update(data) + padder.finalize()
    enc = Cipher(algorithms.AES(enc_key), modes.CBC(iv)).encryptor()
    ct = enc.update(padded) + enc.finalize()
    h = hmac.HMAC(mac_key, hashes.SHA256()); h.update(iv + ct)
    return b64e(salt + iv + h.finalize() + ct)


def aescbc_decrypt(token, pw):
    raw = b64d(token); salt, iv, tag, ct = raw[:16], raw[16:32], raw[32:64], raw[64:]
    keys = derive(pw, salt, 64)
    enc_key, mac_key = keys[:32], keys[32:]
    h = hmac.HMAC(mac_key, hashes.SHA256()); h.update(iv + ct)
    h.verify(tag)  # raises InvalidSignature on wrong password / tampering
    dec = Cipher(algorithms.AES(enc_key), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    unp = sym_padding.PKCS7(128).unpadder()
    return unp.update(padded) + unp.finalize()


# --------------------------------------------------------------------------- #
# 6) Fernet (32-byte key -> urlsafe b64 Fernet key)   out: salt[16] + token
# --------------------------------------------------------------------------- #
def fernet_encrypt(data, pw):
    salt = os.urandom(16)
    key = base64.urlsafe_b64encode(derive(pw, salt, 32))
    token = Fernet(key).encrypt(data)
    return b64e(salt + token)


def fernet_decrypt(token, pw):
    raw = b64d(token); salt, ftoken = raw[:16], raw[16:]
    key = base64.urlsafe_b64encode(derive(pw, salt, 32))
    return Fernet(key).decrypt(ftoken)


# --------------------------------------------------------------------------- #
# 7) RSA-2048 — hybrid: AES-256-GCM encrypts data, RSA-OAEP wraps the AES key
#    out: 2-byte enc_key_len + enc_aes_key + nonce[12] + ct
# --------------------------------------------------------------------------- #
def generate_rsa_keys():
    priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pub_pem = priv.public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode()
    priv_pem = priv.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption()
    ).decode()
    return pub_pem, priv_pem


def _oaep():
    return rsa_padding.OAEP(
        mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(), label=None,
    )


def rsa_encrypt(data, public_key_pem):
    aes_key, nonce = os.urandom(32), os.urandom(12)
    ct = AESGCM(aes_key).encrypt(nonce, data, None)
    pub = serialization.load_pem_public_key(public_key_pem.encode())
    enc_key = pub.encrypt(aes_key, _oaep())
    return b64e(len(enc_key).to_bytes(2, "big") + enc_key + nonce + ct)


def rsa_decrypt(token, private_key_pem):
    raw = b64d(token)
    klen = int.from_bytes(raw[:2], "big")
    enc_key, nonce, ct = raw[2:2 + klen], raw[2 + klen:2 + klen + 12], raw[2 + klen + 12:]
    priv = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    aes_key = priv.decrypt(enc_key, _oaep())
    return AESGCM(aes_key).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# Dispatch
# --------------------------------------------------------------------------- #
ENCRYPTORS = {
    "aes": aes_encrypt, "chacha": chacha_encrypt, "3des": tdes_encrypt,
    "camellia": camellia_encrypt, "aescbc": aescbc_encrypt, "fernet": fernet_encrypt,
}
DECRYPTORS = {
    "aes": aes_decrypt, "chacha": chacha_decrypt, "3des": tdes_decrypt,
    "camellia": camellia_decrypt, "aescbc": aescbc_decrypt, "fernet": fernet_decrypt,
}


def _read_input():
    """Return (data: bytes, is_file: bool, filename: str|None)."""
    mode = request.form.get("mode", "text")
    if mode == "text":
        text = request.form.get("text_input", "")
        if not text:
            raise ValueError("No text provided")
        return text.encode("utf-8"), False, None
    f = request.files.get("file_input")
    if not f or f.filename == "":
        raise ValueError("No file provided")
    return f.read(), True, os.path.basename(f.filename)


def _key_material(algorithm, for_encrypt):
    if algorithm == "rsa":
        field = "public_key" if for_encrypt else "private_key"
        value = (request.form.get(field) or "").strip()
        if not value:
            raise ValueError(("Public" if for_encrypt else "Private") + " key required")
        return value
    password = request.form.get("password", "")
    if not password:
        raise ValueError("Password required")
    return password


# --------------------------------------------------------------------------- #
# Routes
# --------------------------------------------------------------------------- #
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate-rsa-keys", methods=["POST"])
def generate_keys_route():
    try:
        pub, priv = generate_rsa_keys()
        return jsonify({"success": True, "public_key": pub, "private_key": priv})
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 400


def _run(operation):
    for_encrypt = operation == "encrypt"
    algorithm = (request.form.get("algorithm") or "aes").strip()
    data, is_file, filename = _read_input()
    key = _key_material(algorithm, for_encrypt)

    if algorithm == "rsa":
        fn = rsa_encrypt if for_encrypt else rsa_decrypt
    else:
        table = ENCRYPTORS if for_encrypt else DECRYPTORS
        if algorithm not in table:
            raise ValueError("Unknown algorithm")
        fn = table[algorithm]

    result = fn(data, key)  # encrypt -> base64 bytes; decrypt -> raw bytes

    if is_file:
        if for_encrypt:
            out_name = filename + ".tashfeer"
        elif filename.endswith(".tashfeer"):
            out_name = filename[: -len(".tashfeer")]
        else:
            out_name = "decrypted_" + filename
        out_path = os.path.join(OUTPUT_DIR, out_name)
        with open(out_path, "wb") as fh:
            fh.write(result)
        return send_file(out_path, as_attachment=True, download_name=out_name,
                         mimetype="application/octet-stream" if for_encrypt else None)

    if for_encrypt:
        return jsonify({"success": True, "result": result.decode(), "algorithm": algorithm})
    try:
        text = result.decode("utf-8")
    except UnicodeDecodeError:
        text = b64e(result).decode()
    return jsonify({"success": True, "result": text, "algorithm": algorithm})


@app.route("/encrypt", methods=["POST"])
def encrypt_route():
    try:
        return _run("encrypt")
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/decrypt", methods=["POST"])
def decrypt_route():
    try:
        return _run("decrypt")
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception:  # noqa: BLE001 — wrong key/password, tampered, corrupt
        return jsonify({"success": False,
                        "error": "Decryption failed — wrong key/password or corrupted data"}), 400


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #
def _open_browser():
    import webbrowser
    try:
        webbrowser.open("http://localhost:5000")
    except Exception:  # noqa: BLE001
        pass


if __name__ == "__main__":
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    import threading
    threading.Timer(1.2, _open_browser).start()
    print("Tashfeer running at http://localhost:5000")
    app.run(debug=False, port=5000)
