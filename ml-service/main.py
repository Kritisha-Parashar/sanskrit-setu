"""
FastAPI microservice for Sanskrit pronunciation evaluation.
Combines Whisper ASR + phoneme-level pronunciation scoring.
"""

import base64
import io
import logging
import subprocess
import tempfile
import os
from typing import Optional
from contextlib import asynccontextmanager

import numpy as np
import torch
import whisper
import librosa
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from phoneme_scorer import compare_pronunciations

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model cache
whisper_model = None


def load_models():
    """Load Whisper model on startup."""
    global whisper_model
    logger.info("Loading Whisper model (base)...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Using device: {device}")
    whisper_model = whisper.load_model("base", device=device)
    logger.info("Whisper model loaded successfully")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for FastAPI app."""
    load_models()
    yield


app = FastAPI(
    title="Sanskrit Pronunciation Evaluator",
    description="Evaluates Sanskrit word pronunciation using Whisper ASR + phoneme scoring",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluationRequest(BaseModel):
    """Request schema for pronunciation evaluation."""
    word_expected: str  # Target word in Devanagari (e.g., "अश्वः")
    audio_base64: str   # Audio WAV file in base64


class EvaluationResponse(BaseModel):
    """Response schema for pronunciation evaluation."""
    word_match: bool           # Did they say the right word?
    score: int                 # 0-100 pronunciation accuracy
    transcription: str         # What Whisper heard
    feedback: str              # Human-readable feedback
    phoneme_sequence_expected: str
    phoneme_sequence_actual: str
    similarity: float


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "whisper_model": "base",
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }


@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_pronunciation(request: EvaluationRequest) -> EvaluationResponse:
    """
    Evaluate Sanskrit pronunciation.
    
    1. Decode audio from base64
    2. Transcribe using Whisper
    3. Compare phonetically against expected word
    4. Return score + feedback
    """
    temp_files = []
    try:
        # Decode audio
        audio_bytes = base64.b64decode(request.audio_base64)
        logger.info(f"Loading audio ({len(audio_bytes)} bytes)...")
        
        # Create temporary files for ffmpeg conversion
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp_input:
            tmp_input.write(audio_bytes)
            input_file = tmp_input.name
        temp_files.append(input_file)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_output:
            output_file = tmp_output.name
        temp_files.append(output_file)
        
        # Use ffmpeg to convert to WAV
        logger.info("Converting audio format using ffmpeg...")
        try:
            subprocess.run(
                ["ffmpeg", "-i", input_file, "-ar", "16000", "-ac", "1", "-q:a", "9", output_file, "-y"],
                capture_output=True,
                check=True,
                timeout=30
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"ffmpeg conversion failed: {e.stderr.decode()}")
            raise ValueError("Failed to convert audio format")
        
        # Load with librosa
        try:
            audio, sr = librosa.load(output_file, sr=16000, mono=True)
        except Exception as e:
            logger.error(f"Failed to load audio file: {e}")
            raise ValueError("Failed to process audio file")
        
        logger.info(f"Audio loaded: sr={sr}, duration={len(audio)/sr:.2f}s")
        
        if len(audio) == 0:
            raise ValueError("Audio is empty or couldn't be loaded")
        
        # Transcribe with Whisper
        logger.info("Transcribing with Whisper...")
        result = whisper_model.transcribe(audio, language="sa", verbose=False)
        transcription_devanagari = result["text"].strip()
        logger.info(f"Transcription: {transcription_devanagari}")
        
        # Compare pronunciation
        logger.info(f"Comparing against expected: {request.word_expected}")
        comparison = compare_pronunciations(
            expected_word_devanagari=request.word_expected,
            transcribed_word_devanagari=transcription_devanagari,
            transcribed_word_romanized=None
        )
        
        logger.info(f"Score: {comparison['score']}, Match: {comparison['word_match']}")
        
        return EvaluationResponse(
            word_match=comparison["word_match"],
            score=comparison["score"],
            transcription=transcription_devanagari,
            feedback=comparison["feedback"],
            phoneme_sequence_expected=comparison["phoneme_sequence_expected"],
            phoneme_sequence_actual=comparison["phoneme_sequence_actual"],
            similarity=comparison["similarity"]
        )
    
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Evaluation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
    finally:
        # Clean up temp files
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except Exception as e:
                logger.warning(f"Failed to clean up temp file {temp_file}: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
