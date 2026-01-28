# Croppa

Batch headshot cropper with automatic face detection. Drop images, adjust crops, download.

## Quick Start

### Docker

```bash
docker-compose up --build
```

Open http://localhost:3000

### Windows (Native)

**Backend:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (new terminal):
```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Linux / macOS / WSL

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Controls

| Input | Action |
|-------|--------|
| `←` `→` | Navigate images |
| Drag | Adjust position |
| Scroll | Adjust padding |

## Architecture

```
Browser                              Server
┌─────────────────────┐              ┌─────────────────────┐
│  React + Canvas API │◄────────────►│  FastAPI + OpenCV   │
│  - UI               │  /detect-face│  - Face detection   │
│  - Image processing │              │                     │
│  - Downloads        │              │                     │
└─────────────────────┘              └─────────────────────┘
```

All image processing happens in the browser. The server only returns face coordinates.

## Requirements

- Python 3.10+
- Node.js 18+
- Docker (optional)
