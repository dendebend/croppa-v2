"""
Croppa v2 Backend - Face Detection API

Single endpoint that receives an image and returns face coordinates.
All image processing happens client-side.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from face_detector import get_detector, FaceCoords


app = FastAPI(
    title="Croppa API",
    description="Face detection API for headshot cropping",
    version="2.0.0",
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alt dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FaceResponse(BaseModel):
    success: bool
    face: Optional[FaceCoords] = None
    error: Optional[str] = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "croppa-api"}


@app.post("/detect-face", response_model=FaceResponse)
async def detect_face(file: UploadFile = File(...)):
    """
    Detect face in uploaded image

    Returns coordinates of the largest detected face, or error if none found.
    """
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
