# تشفير — Tashfeer

A clean, zero-configuration local encryption web app. Encrypt and decrypt
**text, files, images and audio** using **seven algorithms**, from an elegant
dark, bilingual (العربية / English) UI. All cryptography runs server-side in
Python using only the `cryptography` library.

## Run

```bash
pip install flask cryptography
python app.py
```

Then open: **http://localhost:5000** (the browser opens automatically; first
run installs the two dependencies if they're missing).

## Two modes, one screen

The UI has two main tabs — **🔐 Encrypt** and **🔓 Decrypt** — each with its
own input area (Text / Files / Images / Audio). They share the algorithm
selector and the key/password section. Switching tabs clears the boxes so
plaintext and ciphertext never get mixed up.

## Algorithms

| # | Algorithm          | Key (via PBKDF2) | Output (before base64)                         |
|---|--------------------|------------------|------------------------------------------------|
| 1 | AES-256-GCM        | 32 bytes         | `salt[16] + nonce[12] + ct(+tag)`              |
| 2 | RSA-2048 (hybrid)  | PEM keys         | `keylen[2] + enc_aes_key + nonce[12] + ct`     |
| 3 | ChaCha20-Poly1305  | 32 bytes         | `salt[16] + nonce[12] + ct(+tag)`              |
| 4 | Triple-DES (CBC)   | 24 bytes         | `salt[16] + iv[8] + ct`                        |
| 5 | Camellia-256 (CBC) | 32 bytes         | `salt[16] + iv[16] + ct`                       |
| 6 | AES-256-CBC + HMAC | 32 + 32 bytes    | `salt[16] + iv[16] + hmac[32] + ct` (EtM)      |
| 7 | Fernet             | 32 → urlsafe b64 | `salt[16] + fernet_token`                      |

- Every password-based algorithm stretches the password to the exact length it
  needs with **PBKDF2-HMAC-SHA256 (100,000 iterations, random 16-byte salt)** —
  so even a 3-character password works.
- **RSA** uses hybrid encryption (a random AES-256-GCM key encrypts the data;
  RSA-OAEP/SHA-256 wraps the AES key), so any size works. Use **Generate Key
  Pair** to create keys.
- **AES-256-CBC + HMAC** is encrypt-then-MAC: the HMAC is verified before
  decryption, so a wrong password or any tampering fails cleanly.
- Encrypted files download as `name.tashfeer`; decrypting restores `name`.

> To decrypt, pick the **same algorithm** and supply the matching password / key.

## Project layout

```
.
├── app.py              # Flask server + all crypto logic
├── requirements.txt    # flask, cryptography
└── templates/
    └── index.html      # Complete two-tab UI
```

`uploads/` and `outputs/` are created automatically at startup. Every route
returns JSON (text) or a file download — never an empty response — and all
errors are reported without crashing the server.
