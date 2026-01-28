"""
Face detection module using OpenCV Haar Cascade
"""

import cv2
import numpy as np
from typing import Optional
from dataclasses import dataclass


@dataclass
class FaceCoords:
    x: int
    y: int
    w: int
    h: int


class FaceDetector:
    # Detection parameters
    SCALE_FACTOR = 1.1
    MIN_NEIGHBORS = 5
    MIN_FACE_SIZE = (30, 30)

    def __init__(self):
        """Initialize with Haar cascade classifier"""
        # Use OpenCV's bundled cascade file
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

        if self.face_cascade.empty():
            raise RuntimeError(f"Failed to load cascade from {cascade_path}")

    def detect_from_bytes(self, image_bytes: bytes) -> Optional[FaceCoords]:
        """
        Detect the largest face in an image from raw bytes

        Args:
            image_bytes: Raw image file bytes

        Returns:
            FaceCoords with x, y, width, height of detected face, or None
        """
        try:
            # Decode image from bytes
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return None

            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=self.SCALE_FACTOR,
                minNeighbors=self.MIN_NEIGHBORS,
                minSize=self.MIN_FACE_SIZE,
                flags=cv2.CASCADE_SCALE_IMAGE,
            )

            if len(faces) == 0:
                return None

            # Return the largest face
            largest = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = largest

            return FaceCoords(x=int(x), y=int(y), w=int(w), h=int(h))

        except Exception as e:
            print(f"Error detecting face: {e}")
            return None


# Singleton instance
_detector: Optional[FaceDetector] = None


def get_detector() -> FaceDetector:
    """Get or create the face detector singleton"""
    global _detector
    if _detector is None:
        _detector = FaceDetector()
    return _detector
