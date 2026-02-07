"""
Croppa v2 Backend - Face Detection API

Single endpoint that receives an image and returns face coordinates.
All image processing happens client-side.
"""

import os
import time
from collections import defaultdict

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from face_detector import get_detector, FaceCoords


app = FastAPI(
    title="Croppa API",
    description="Face detection API for headshot cropping",
    version="2.0.0",
)

# CORS - derived from DOMAIN env var
domain = os.getenv("DOMAIN", "localhost")
if domain == "localhost":
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
else:
    allowed_origins = [f"https://{domain}"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Limits
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
RATE_LIMIT = 30  # requests per minute per IP
RATE_WINDOW = 60  # seconds

_rate_limits: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    _rate_limits[client_ip] = [t for t in _rate_limits[client_ip] if now - t < RATE_WINDOW]
    if len(_rate_limits[client_ip]) >= RATE_LIMIT:
        return False
    _rate_limits[client_ip].append(now)
    return True


class FaceResponse(BaseModel):
    success: bool
    face: Optional[FaceCoords] = None
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "croppa-api"}


@app.post("/detect-face", response_model=FaceResponse)
async def detect_face(request: Request, file: UploadFile = File(...)):
    """
    Detect face in uploaded image

    Returns coordinates of the largest detected face, or error if none found.
    """
    # Rate limit by real client IP (behind reverse proxy)
    client_ip = request.headers.get("X-Real-IP", request.client.host if request.client else "unknown")
    if not _check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

    # Validate content type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Expected image/*"
        )

    # Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    # Validate file size
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 25MB)")

    # Detect face
    detector = get_detector()
    face = detector.detect_from_bytes(contents)

    if face is None:
        return FaceResponse(
            success=False,
            face=None,
            error="No face detected in image",
        )

    return FaceResponse(
        success=True,
        face=face,
        error=None,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
