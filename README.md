# تشفير — Tashfeer

A clean, zero-configuration encryption tool. Encrypt and decrypt text, files,
images and audio using **AES-256-GCM**, **RSA-2048**, **ChaCha20-Poly1305** or
**Triple-DES** — all from an elegant dark, bilingual (العربية / English) web UI.

## Run

```bash
pip install -r requirements.txt
python app.py
```

Then open: **http://localhost:5000**

> First run installs the two dependencies automatically if they're missing, so
> even `python app.py` on a fresh machine just works. The browser opens on its
> own once the server is up.

## Supported input types

- **Text** — plain text
- **Files** — any file type
- **Images** — jpg, png, gif… (with preview)
- **Audio** — mp3, wav, ogg… (with player)

## Algorithms

| Algorithm    | Type       | Use case             |
|--------------|------------|----------------------|
| AES-256-GCM  | Symmetric  | Standard encryption  |
| RSA-2048     | Asymmetric | Key exchange         |
| ChaCha20     | Symmetric  | Mobile / speed       |
| Triple-DES   | Symmetric  | Legacy / educational |

- Password algorithms derive keys with **PBKDF2-HMAC-SHA256, 100,000 iterations**
  and a fresh random salt each time.
- **RSA** uses **hybrid encryption** (a random AES-256-GCM key is wrapped with
  RSA-OAEP/SHA-256), so it works for any text or file size.
- Encrypted files download as `name.tashfeer`; decrypting restores `name`.

> To decrypt, pick the **same algorithm** and supply the matching password / key.

## Project layout

```
.
├── app.py              # Flask server + all crypto logic
├── requirements.txt    # flask, cryptography
└── templates/
    └── index.html      # Complete UI
```

`uploads/` and `outputs/` are created automatically at startup.
