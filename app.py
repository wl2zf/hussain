"""
Tashfeer (تشفير) — A local encryption tool.

Flask server that exposes a small JSON/file API for four encryption
algorithms (AES-256-GCM, RSA-2048, ChaCha20-Poly1305 and Triple-DES) and
serves an elegant single-page UI from templates/index.html.

All cryptography is performed server-side using the `cryptography` library.
"""

import os
import sys
import base64
import importlib.util
import subprocess


def ensure_dependencies():
    """Install required packages on first run.

    This lets the app work straight from VS Code's ▶ Run button (or a
    double-click) on a fresh machine that only has Python installed — no
    manual `pip install` needed. If the packages are already present this
    is a fast no-op.
    """
    required = {
        "flask": "flask==3.0.0",
        "cryptography": "cryptography==42.0.0",
    }
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
            "Please run this once in the terminal:\n"
            "    pip install -r requirements.txt\n"
            f"Details: {exc}\n"
        )


# Make sure dependencies exist BEFORE importing them below.
ensure_dependencies()

from flask import Flask, request, jsonify, render_template, send_file

from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes, padding, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import rsa, padding as asym_padding

# --------------------------------------------------------------------------- #
# Paths / app setup
# --------------------------------------------------------------------------- #

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")

# Auto-create the working directories on startup.
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = Flask(__name__)

# Crypto constants
PBKDF2_ITERATIONS = 100_000
SALT_SIZE = 16
AES_NONCE_SIZE = 12
CHACHA_NONCE_SIZE = 12
DES3_IV_SIZE = 8


# --------------------------------------------------------------------------- #
# Key derivation helper
# --------------------------------------------------------------------------- #

def derive_key(password: str, salt: bytes, length: int) -> bytes:
    """Derive a key of `length` bytes from a password using PBKDF2-HMAC-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=length,
        salt=salt,
        iterations=PBKDF2_ITERATIONS,
    )
    return kdf.derive(password.encode("utf-8"))


# --------------------------------------------------------------------------- #
# AES-256-GCM
# --------------------------------------------------------------------------- #

def aes_encrypt(data: bytes, password: str) -> bytes:
    """Return blob: salt(16) + nonce(12) + ciphertext + tag(16)."""
    salt = os.urandom(SALT_SIZE)
    nonce = os.urandom(AES_NONCE_SIZE)
    key = derive_key(password, salt, 32)
    # AESGCM appends the 16-byte authentication tag to the ciphertext.
    ciphertext = AESGCM(key).encrypt(nonce, data, None)
    return salt + nonce + ciphertext


def aes_decrypt(blob: bytes, password: str) -> bytes:
    salt = blob[:SALT_SIZE]
    nonce = blob[SALT_SIZE:SALT_SIZE + AES_NONCE_SIZE]
    ciphertext = blob[SALT_SIZE + AES_NONCE_SIZE:]
    key = derive_key(password, salt, 32)
    return AESGCM(key).decrypt(nonce, ciphertext, None)


# --------------------------------------------------------------------------- #
# ChaCha20-Poly1305
# --------------------------------------------------------------------------- #

def chacha_encrypt(data: bytes, password: str) -> bytes:
    """Return blob: salt(16) + nonce(12) + ciphertext(+tag)."""
    salt = os.urandom(SALT_SIZE)
    nonce = os.urandom(CHACHA_NONCE_SIZE)
    key = derive_key(password, salt, 32)
    ciphertext = ChaCha20Poly1305(key).encrypt(nonce, data, None)
    return salt + nonce + ciphertext


def chacha_decrypt(blob: bytes, password: str) -> bytes:
    salt = blob[:SALT_SIZE]
    nonce = blob[SALT_SIZE:SALT_SIZE + CHACHA_NONCE_SIZE]
    ciphertext = blob[SALT_SIZE + CHACHA_NONCE_SIZE:]
    key = derive_key(password, salt, 32)
    return ChaCha20Poly1305(key).decrypt(nonce, ciphertext, None)


# --------------------------------------------------------------------------- #
# Triple-DES (3DES) — CBC + PKCS7
# --------------------------------------------------------------------------- #

def des3_encrypt(data: bytes, password: str) -> bytes:
    """Return blob: salt(16) + iv(8) + ciphertext."""
    salt = os.urandom(SALT_SIZE)
    iv = os.urandom(DES3_IV_SIZE)
    key = derive_key(password, salt, 24)  # 3DES needs a 24-byte key

    padder = padding.PKCS7(algorithms.TripleDES.block_size).padder()
    padded = padder.update(data) + padder.finalize()

    cipher = Cipher(algorithms.TripleDES(key), modes.CBC(iv))
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded) + encryptor.finalize()
    return salt + iv + ciphertext


def des3_decrypt(blob: bytes, password: str) -> bytes:
    salt = blob[:SALT_SIZE]
    iv = blob[SALT_SIZE:SALT_SIZE + DES3_IV_SIZE]
    ciphertext = blob[SALT_SIZE + DES3_IV_SIZE:]
    key = derive_key(password, salt, 24)

    cipher = Cipher(algorithms.TripleDES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()

    unpadder = padding.PKCS7(algorithms.TripleDES.block_size).unpadder()
    return unpadder.update(padded) + unpadder.finalize()


# --------------------------------------------------------------------------- #
# RSA-2048 (OAEP) — hybrid encryption so any size works (text or file)
# --------------------------------------------------------------------------- #

def generate_rsa_keys() -> tuple[str, str]:
    """Generate a 2048-bit RSA key pair, returned as PEM strings."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    return public_pem, private_pem


def _rsa_oaep_padding() -> asym_padding.OAEP:
    return asym_padding.OAEP(
        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None,
    )


def rsa_encrypt(data: bytes, public_pem: str) -> bytes:
    """
    Hybrid encryption: a random AES-256-GCM key encrypts the data, and RSA-OAEP
    encrypts that AES key. Works for arbitrarily large payloads.

    Blob layout: enc_key_len(2) + enc_key + nonce(12) + aes_ciphertext(+tag)
    """
    public_key = serialization.load_pem_public_key(public_pem.encode("utf-8"))

    aes_key = os.urandom(32)
    nonce = os.urandom(AES_NONCE_SIZE)
    ciphertext = AESGCM(aes_key).encrypt(nonce, data, None)

    enc_key = public_key.encrypt(aes_key, _rsa_oaep_padding())
    return len(enc_key).to_bytes(2, "big") + enc_key + nonce + ciphertext


def rsa_decrypt(blob: bytes, private_pem: str) -> bytes:
    private_key = serialization.load_pem_private_key(
        private_pem.encode("utf-8"), password=None
    )

    enc_key_len = int.from_bytes(blob[:2], "big")
    offset = 2
    enc_key = blob[offset:offset + enc_key_len]
    offset += enc_key_len
    nonce = blob[offset:offset + AES_NONCE_SIZE]
    offset += AES_NONCE_SIZE
    ciphertext = blob[offset:]

    aes_key = private_key.decrypt(enc_key, _rsa_oaep_padding())
    return AESGCM(aes_key).decrypt(nonce, ciphertext, None)


# --------------------------------------------------------------------------- #
# Dispatch tables
# --------------------------------------------------------------------------- #

PASSWORD_ALGORITHMS = {
    "AES-256-GCM": (aes_encrypt, aes_decrypt),
    "ChaCha20-Poly1305": (chacha_encrypt, chacha_decrypt),
    "Triple-DES": (des3_encrypt, des3_decrypt),
}

RSA_ALGORITHM = "RSA-2048"


def run_encrypt(algorithm: str, data: bytes, key_material: str) -> bytes:
    if algorithm == RSA_ALGORITHM:
        return rsa_encrypt(data, key_material)
    if algorithm in PASSWORD_ALGORITHMS:
        return PASSWORD_ALGORITHMS[algorithm][0](data, key_material)
    raise ValueError(f"Unknown algorithm: {algorithm}")


def run_decrypt(algorithm: str, blob: bytes, key_material: str) -> bytes:
    if algorithm == RSA_ALGORITHM:
        return rsa_decrypt(blob, key_material)
    if algorithm in PASSWORD_ALGORITHMS:
        return PASSWORD_ALGORITHMS[algorithm][1](blob, key_material)
    raise ValueError(f"Unknown algorithm: {algorithm}")


def get_key_material(algorithm: str, form, for_encrypt: bool) -> str:
    """Pull and validate the password / PEM key from the request form."""
    if algorithm == RSA_ALGORITHM:
        field = "public_key" if for_encrypt else "private_key"
        key_material = (form.get(field) or "").strip()
        if not key_material:
            label = "public key" if for_encrypt else "private key"
            raise ValueError(f"RSA {label} is required.")
        return key_material

    password = form.get("password") or ""
    if not password:
        raise ValueError("Password is required.")
    if for_encrypt:
        confirm = form.get("confirm_password")
        if confirm is not None and confirm != password:
            raise ValueError("Passwords do not match.")
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
        public_pem, private_pem = generate_rsa_keys()
        return jsonify(
            {"success": True, "public_key": public_pem, "private_key": private_pem}
        )
    except Exception as exc:  # noqa: BLE001 — surface any failure as JSON
        return jsonify({"success": False, "error": str(exc)}), 500


def _handle(operation: str):
    """Shared logic for /encrypt and /decrypt."""
    for_encrypt = operation == "encrypt"
    algorithm = (request.form.get("algorithm") or "").strip()
    mode = (request.form.get("mode") or "text").strip()

    if not algorithm:
        raise ValueError("No algorithm selected.")

    key_material = get_key_material(algorithm, request.form, for_encrypt)

    # ----------------------------------------------------------------- file
    if mode == "file":
        uploaded = request.files.get("file")
        if uploaded is None or uploaded.filename == "":
            raise ValueError("No file provided.")

        original_name = os.path.basename(uploaded.filename)
        upload_path = os.path.join(UPLOAD_DIR, original_name)
        uploaded.save(upload_path)

        try:
            with open(upload_path, "rb") as fh:
                data = fh.read()

            if for_encrypt:
                blob = run_encrypt(algorithm, data, key_material)
                out_name = original_name + ".tashfeer"
                download_name = out_name
            else:
                blob = run_decrypt(algorithm, data, key_material)
                if original_name.endswith(".tashfeer"):
                    out_name = original_name[: -len(".tashfeer")]
                else:
                    out_name = "decrypted_" + original_name
                download_name = out_name

            out_path = os.path.join(OUTPUT_DIR, out_name)
            with open(out_path, "wb") as fh:
                fh.write(blob)
        finally:
            # Clean up the uploaded temp file.
            if os.path.exists(upload_path):
                os.remove(upload_path)

        return send_file(out_path, as_attachment=True, download_name=download_name)

    # ----------------------------------------------------------------- text
    text = request.form.get("text")
    if text is None or text == "":
        raise ValueError("No text provided.")

    if for_encrypt:
        blob = run_encrypt(algorithm, text.encode("utf-8"), key_material)
        result = base64.b64encode(blob).decode("ascii")
    else:
        try:
            blob = base64.b64decode(text.strip())
        except Exception:
            raise ValueError("Input is not valid base64 ciphertext.")
        result = run_decrypt(algorithm, blob, key_material).decode("utf-8")

    return jsonify({"success": True, "result": result, "algorithm": algorithm})


@app.route("/encrypt", methods=["POST"])
def encrypt_route():
    try:
        return _handle("encrypt")
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"success": False, "error": f"Encryption failed: {exc}"}), 400


@app.route("/decrypt", methods=["POST"])
def decrypt_route():
    try:
        return _handle("decrypt")
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        # Most decryption failures (wrong password/key, corrupt data) land here.
        return jsonify(
            {"success": False, "error": "Decryption failed — wrong key/password or corrupted data."}
        ), 400


def _open_browser():
    """Open the app in the default browser (ignored if none is available)."""
    import webbrowser
    try:
        webbrowser.open("http://localhost:5000")
    except Exception:  # noqa: BLE001 — headless environments, etc.
        pass


if __name__ == "__main__":
    # The reloader runs this file twice; WERKZEUG_RUN_MAIN is "true" only in
    # the worker process, so the browser opens exactly once.
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        import threading
        threading.Timer(1.2, _open_browser).start()

    print("\n[Tashfeer] Running at http://localhost:5000  —  press Ctrl+C to stop\n")
    app.run(debug=True, port=5000)
