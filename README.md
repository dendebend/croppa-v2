# Croppa v2

Batch headshot cropper with automatic face detection. Drop images, adjust crops, download.

All image processing happens in the browser. The server only returns face coordinates.

## Deploy to Production

### Prerequisites

- Docker and Docker Compose on the host machine
- A domain with a DNS **A record** pointing to the machine's public IP
- Ports **80** and **443** open on the machine (for Let's Encrypt + HTTPS)

### 1. Clone and configure

```bash
git clone <repo-url> && cd croppa-v2
cp .env.example .env
```

Edit `.env`:

```env
DOMAIN=croppa.yourdomain.com
AUTH_USER=croppa
AUTH_PASS_HASH=<paste hash here>
```

### 2. Generate the password hash

Pick a shared password for the team and generate a bcrypt hash:

```bash
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'your-password-here'
```

Copy the full output (starts with `$2a$`) into `AUTH_PASS_HASH` in your `.env`.

### 3. Launch

```bash
docker compose up -d --build
```

Caddy will automatically provision a TLS certificate from Let's Encrypt. Give it a minute on first boot, then visit `https://croppa.yourdomain.com`. You'll be prompted for the username/password.

### Updating

```bash
git pull
docker compose up -d --build
```

TLS certs persist in a Docker volume across rebuilds.

---

## Local Development

No Docker needed for local dev. You'll need **Python 3.10+** and **Node.js 18+**.

### Linux / macOS / WSL

```bash
./dev.sh
```

Or manually:

```bash
# Terminal 1 - backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Terminal 2 - frontend
cd frontend
npm install
npm run dev
```

### Windows

```powershell
# Terminal 1 - backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Terminal 2 - frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Controls

| Input | Action |
|-------|--------|
| `Arrow Left` / `Arrow Right` | Navigate images |
| Drag on preview | Adjust crop position |
| Scroll on preview | Adjust padding / zoom |

## Architecture

```
Internet
   │
   ▼
┌──────────────────────────────────────┐
│  Caddy (TLS, Basic Auth, Headers)    │
├──────────┬───────────────────────────┤
│ /api/*   │  Static files (SPA)       │
│    │     │  React + Canvas API       │
│    ▼     │  - UI & image processing  │
│ FastAPI  │  - Client-side cropping   │
│ + OpenCV │  - ZIP downloads          │
│ (faces)  │                           │
└──────────┴───────────────────────────┘
```

## Configuration Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Your domain (Caddy auto-provisions TLS) | `croppa.example.com` |
| `AUTH_USER` | Basic auth username | `croppa` |
| `AUTH_PASS_HASH` | Bcrypt hash of the password | `$2a$14$...` |
