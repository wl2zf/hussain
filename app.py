"""
Tashfeer (تشفير) — a clean, zero-configuration encryption tool.

Run it with a single command:

    python app.py

…then open http://localhost:5000 in your browser.

Everything (Flask server + all cryptography) lives in this one file. The four
supported algorithms are AES-256-GCM, RSA-2048, ChaCha20-Poly1305 and
Triple-DES. On first run the required packages are installed automatically so
the app works immediately on a fresh machine.
"""

import os
import sys
import base64
import importlib.util
import subprocess


# --------------------------------------------------------------------------- #
# First-run convenience: auto-install dependencies
# --------------------------------------------------------------------------- #
def ensure_dependencies():
    """Install Flask + cryptography on first run (fast no-op if present).

    Lets the app start with one command (or VS Code's ▶ Run button) on a fresh
    machine that only has Python installed — no manual `pip install` needed.
    """
    required = {"flask": "flask==3.0.0", "cryptography": "cryptography==42.0.0"}
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
            "Please run once:  pip install -r requirements.txt\n"
            f"Details: {exc}\n"
        )


ensure_dependencies()

from flask import Flask, request, jsonify, render_template, send_file

from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives import padding as sym_padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import padding as rsa_padding


# --------------------------------------------------------------------------- #
# App + folders
# --------------------------------------------------------------------------- #
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
# Create folders at import time so routes work under any runner (incl. tests).
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = Flask(__name__)

PBKDF2_ITERATIONS = 100_000


def _kdf(salt: bytes, length: int) -> PBKDF2HMAC:
    return PBKDF2HMAC(
        algorithm=hashes.SHA256(), length=length, salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )


# --------------------------------------------------------------------------- #
# AES-256-GCM
# --------------------------------------------------------------------------- #
def aes_encrypt(data: bytes, password: str) -> bytes:
    salt = os.urandom(16)
    key = _kdf(salt, 32).derive(password.encode())
    nonce = os.urandom(12)
    ct = AESGCM(key).encrypt(nonce, data, None)
    return base64.b64encode(salt + nonce + ct)


def aes_decrypt(token: bytes, password: str) -> bytes:
    raw = base64.b64decode(token)
    salt, nonce, ct = raw[:16], raw[16:28], raw[28:]
    key = _kdf(salt, 32).derive(password.encode())
    return AESGCM(key).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# ChaCha20-Poly1305
# --------------------------------------------------------------------------- #
def chacha_encrypt(data: bytes, password: str) -> bytes:
    salt = os.urandom(16)
    key = _kdf(salt, 32).derive(password.encode())
    nonce = os.urandom(12)
    ct = ChaCha20Poly1305(key).encrypt(nonce, data, None)
    return base64.b64encode(salt + nonce + ct)


def chacha_decrypt(token: bytes, password: str) -> bytes:
    raw = base64.b64decode(token)
    salt, nonce, ct = raw[:16], raw[16:28], raw[28:]
    key = _kdf(salt, 32).derive(password.encode())
    return ChaCha20Poly1305(key).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# Triple-DES (CBC + PKCS7), 24-byte key
# --------------------------------------------------------------------------- #
def tdes_encrypt(data: bytes, password: str) -> bytes:
    salt = os.urandom(16)
    key = _kdf(salt, 24).derive(password.encode())  # exactly 24 bytes
    iv = os.urandom(8)
    padder = sym_padding.PKCS7(64).padder()
    padded = padder.update(data) + padder.finalize()
    enc = Cipher(algorithms.TripleDES(key), modes.CBC(iv)).encryptor()
    ct = enc.update(padded) + enc.finalize()
    return base64.b64encode(salt + iv + ct)


def tdes_decrypt(token: bytes, password: str) -> bytes:
    raw = base64.b64decode(token)
    salt, iv, ct = raw[:16], raw[16:24], raw[24:]
    key = _kdf(salt, 24).derive(password.encode())
    dec = Cipher(algorithms.TripleDES(key), modes.CBC(iv)).decryptor()
    padded = dec.update(ct) + dec.finalize()
    unpadder = sym_padding.PKCS7(64).unpadder()
    return unpadder.update(padded) + unpadder.finalize()


# --------------------------------------------------------------------------- #
# RSA-2048 — hybrid (RSA-OAEP wraps a random AES-256-GCM key) for any size
# --------------------------------------------------------------------------- #
def generate_rsa_keys():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pub_pem = private_key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    priv_pem = private_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ).decode()
    return pub_pem, priv_pem


def _oaep():
    return rsa_padding.OAEP(
        mgf=rsa_padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(), label=None,
    )


def rsa_encrypt(data: bytes, public_key_pem: str) -> bytes:
    aes_key = os.urandom(32)
    nonce = os.urandom(12)
    ct = AESGCM(aes_key).encrypt(nonce, data, None)
    pub_key = serialization.load_pem_public_key(public_key_pem.encode())
    enc_aes_key = pub_key.encrypt(aes_key, _oaep())
    # Format: [2 bytes enc_key_len][enc_aes_key][nonce(12)][ciphertext]
    enc_key_len = len(enc_aes_key).to_bytes(2, "big")
    return base64.b64encode(enc_key_len + enc_aes_key + nonce + ct)


def rsa_decrypt(token: bytes, private_key_pem: str) -> bytes:
    raw = base64.b64decode(token)
    enc_key_len = int.from_bytes(raw[:2], "big")
    enc_aes_key = raw[2:2 + enc_key_len]
    nonce = raw[2 + enc_key_len:2 + enc_key_len + 12]
    ct = raw[2 + enc_key_len + 12:]
    priv_key = serialization.load_pem_private_key(private_key_pem.encode(), password=None)
    aes_key = priv_key.decrypt(enc_aes_key, _oaep())
    return AESGCM(aes_key).decrypt(nonce, ct, None)


# --------------------------------------------------------------------------- #
# Dispatch helpers
# --------------------------------------------------------------------------- #
ENCRYPTORS = {"aes": aes_encrypt, "chacha": chacha_encrypt, "3des": tdes_encrypt}
DECRYPTORS = {"aes": aes_decrypt, "chacha": chacha_decrypt, "3des": tdes_decrypt}


def _read_input():
    """Return (data: bytes, is_file: bool, filename: str|None) from the form."""
    mode = request.form.get("mode", "text")
    if mode == "text":
        text = request.form.get("text_input", "")
        if not text:
            raise ValueError("No text provided")
        return text.encode("utf-8"), False, None
    # file / image / audio all arrive as a single uploaded file.
    f = request.files.get("file_input")
    if not f or f.filename == "":
        raise ValueError("No file provided")
    return f.read(), True, os.path.basename(f.filename)


def _key_material(algorithm: str, for_encrypt: bool) -> str:
    if algorithm == "rsa":
        field = "public_key" if for_encrypt else "private_key"
        value = request.form.get(field, "").strip()
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
        public_key, private_key = generate_rsa_keys()
        return jsonify({"success": True, "public_key": public_key,
                        "private_key": private_key})
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/encrypt", methods=["POST"])
def encrypt():
    try:
        algorithm = request.form.get("algorithm", "aes")
        data, is_file, filename = _read_input()
        key = _key_material(algorithm, for_encrypt=True)

        if algorithm == "rsa":
            result = rsa_encrypt(data, key)
        elif algorithm in ENCRYPTORS:
            result = ENCRYPTORS[algorithm](data, key)
        else:
            return jsonify({"success": False, "error": "Unknown algorithm"}), 400

        if is_file:
            out_name = filename + ".tashfeer"
            out_path = os.path.join(OUTPUT_DIR, out_name)
            with open(out_path, "wb") as out_f:
                out_f.write(result)
            return send_file(out_path, as_attachment=True, download_name=out_name,
                             mimetype="application/octet-stream")
        return jsonify({"success": True, "result": result.decode(), "algorithm": algorithm})

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:  # noqa: BLE001
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/decrypt", methods=["POST"])
def decrypt():
    try:
        algorithm = request.form.get("algorithm", "aes")
        data, is_file, filename = _read_input()
        key = _key_material(algorithm, for_encrypt=False)

        if algorithm == "rsa":
            result = rsa_decrypt(data, key)
        elif algorithm in DECRYPTORS:
            result = DECRYPTORS[algorithm](data, key)
        else:
            return jsonify({"success": False, "error": "Unknown algorithm"}), 400

        if is_file:
            # Restore the original name by dropping the .tashfeer suffix.
            if filename.endswith(".tashfeer"):
                out_name = filename[: -len(".tashfeer")]
            else:
                out_name = "decrypted_" + filename
            out_path = os.path.join(OUTPUT_DIR, out_name)
            with open(out_path, "wb") as out_f:
                out_f.write(result)
            return send_file(out_path, as_attachment=True, download_name=out_name)

        # Text: the decrypted bytes should be valid UTF-8.
        try:
            text = result.decode("utf-8")
        except UnicodeDecodeError:
            text = base64.b64encode(result).decode()  # binary fallback
        return jsonify({"success": True, "result": text, "algorithm": algorithm})

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception:  # noqa: BLE001 — wrong key/password, corrupt data, etc.
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

    # Auto-open the browser shortly after the server starts (best-effort).
    import threading
    threading.Timer(1.2, _open_browser).start()

    print("=" * 50)
    print("  Tashfeer — تشفير")
    print("  Open: http://localhost:5000")
    print("=" * 50)
    app.run(debug=False, port=5000)
