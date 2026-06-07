# تشفير · Tashfeer

A local, single-machine encryption tool with an elegant dark UI. Pick an
algorithm, drop in text or a file, supply a password (or RSA keys), and get
encrypted output you can decrypt back to the original — all crypto runs
server-side in Python using the [`cryptography`](https://cryptography.io)
library.

## Features

- **Four algorithms**, all implemented end-to-end:
  - **AES-256-GCM** — authenticated encryption, PBKDF2 key derivation
  - **RSA-2048 (OAEP/SHA-256)** — hybrid (RSA + AES) so any size works
  - **ChaCha20-Poly1305** — fast authenticated encryption
  - **Triple-DES (CBC + PKCS7)** — legacy / educational
- Encrypt and decrypt **text** or **any file**
- In-browser **RSA key-pair generation**
- **Bilingual UI** (العربية / English) with RTL/LTR switching
- No external services — everything stays on `localhost`

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the server
python app.py

# 3. Open your browser
#    http://localhost:5000
```

## How it works

| Algorithm    | Key input            | Output format (before base64)             |
|--------------|----------------------|-------------------------------------------|
| AES-256-GCM  | password             | `salt(16) + nonce(12) + ciphertext+tag`   |
| ChaCha20     | password             | `salt(16) + nonce(12) + ciphertext+tag`   |
| Triple-DES   | password             | `salt(16) + iv(8) + ciphertext`           |
| RSA-2048     | public/private (PEM) | `enc_key_len(2) + enc_key + nonce + ct`   |

- **Text** results are returned base64-encoded in JSON.
- **Files** are encrypted to a `.tashfeer` download; decrypting a
  `<name>.tashfeer` file restores `<name>`.
- Password keys are derived with **PBKDF2-HMAC-SHA256, 100,000 iterations**
  and a fresh random 16-byte salt every time.

> ⚠️ To decrypt, select the **same algorithm** used to encrypt and provide the
> matching password / key.

## Project structure

```
.
├── app.py              # Flask server + all crypto logic
├── requirements.txt    # Dependencies
├── templates/
│   └── index.html      # Full UI (HTML + CSS + JS)
├── uploads/            # Temp folder for uploads (auto-created)
└── outputs/            # Encrypted/decrypted outputs (auto-created)
```

## Security notes

This is a practical tool and a learning project. Triple-DES is included for
educational purposes only — prefer AES-256-GCM or ChaCha20-Poly1305 for real
use. Keep your RSA **private key** secret; only ever share the **public key**.
