# Sanskrit Pronunciation Evaluator - Complete ML Service Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technologies & Dependencies](#technologies--dependencies)
4. [Deep Learning Algorithms](#deep-learning-algorithms)
5. [Transformer Architecture](#transformer-architecture)
6. [Seq2Seq Encoder-Decoder](#seq2seq-encoder-decoder)
7. [Whisper ASR Model](#whisper-asr-model)
8. [Phoneme Scoring System](#phoneme-scoring-system)
9. [Complete Pipeline](#complete-pipeline)
10. [Implementation Details](#implementation-details)
11. [Performance & Optimization](#performance--optimization)

---

## Overview

The Sanskrit Pronunciation Evaluator is a microservice built with **FastAPI** that evaluates how accurately users pronounce Sanskrit words. It combines:

1. **Whisper ASR** (Automatic Speech Recognition) - for transcribing Sanskrit audio
2. **Phoneme-Level Scoring** - for comparing expected vs. actual pronunciation at the phoneme level

The system is specifically fine-tuned for **Sanskrit language** with support for Devanagari script processing, IPA phoneme mapping, and romanization conversion.

### Core Functionality

- **Input**: Audio file (WebM format) + expected Sanskrit word (Devanagari)
- **Processing**: Converts audio → transcribes → maps to phonemes → compares
- **Output**: Pronunciation score (0-100), phoneme sequences, feedback, word match status

---

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Web Service                     │
│                  (Port 8000 / CORS Enabled)              │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
    ┌───▼────┐          ┌───▼─────────┐
    │ Whisper│          │   Phoneme   │
    │  ASR   │          │   Scorer    │
    │ Model  │          │             │
    └───┬────┘          └───┬─────────┘
        │                   │
        │ Sanskrit Audio    │ Compares Phonemes
        │ → Text            │ (IPA sequences)
        │                   │
        └───────┬───────────┘
                │
        ┌───────▼──────────┐
        │  Response Model  │
        │  (Score, Feedback)
        └──────────────────┘
```

### Microservice Components

1. **FastAPI Application** (`main.py`)
   - REST API endpoint: `POST /evaluate`
   - Lifespan management: Loads models on startup
   - CORS support for cross-origin requests
   - Error handling & logging

2. **Whisper ASR Engine** (`main.py`)
   - Fine-tuned model for Sanskrit
   - Loads from `models/whisper_kathbath_final/`
   - Supports GPU acceleration (CUDA)

3. **Phoneme Scorer** (`phoneme_scorer.py`)
   - Sanskrit phoneme mapping (Devanagari → IPA)
   - Romanization conversion (IAST/ITRANS/SLP1)
   - Sequence matching & similarity computation

---

## Technologies & Dependencies

### Core Framework

- **FastAPI** (v0.109.0): Modern Python web framework with async/await support
- **Uvicorn** (v0.27.0): ASGI web server for FastAPI

### Audio Processing

- **Librosa** (v0.10.0): Audio feature extraction, resampling (converts to 16kHz mono)
- **TorchAudio** (≥2.3.0): PyTorch's audio processing library
- **ffmpeg**: Command-line tool for audio codec conversion (WebM → WAV)

### Deep Learning

- **PyTorch** (≥2.3.0): Foundation for neural network models
- **OpenAI Whisper** (≥20231117): Transformer-based ASR model

### Language Processing

- **indic-transliteration** (v2.3.7): Accurate Sanskrit romanization conversion
  - Supports IAST, ITRANS, SLP1 romanization schemes
  - Converts between Devanagari and romanized forms

### Utilities

- **NumPy** (≥1.24.3): Numerical/array operations
- **SciPy** (≥1.11.4): Scientific computing (sequence matching algorithms)
- **Python-multipart** (v0.0.6): File upload handling

---

## Deep Learning Algorithms

### 1. **Transformer Networks**

The backbone of modern NLP/speech models. Whisper uses the full Transformer architecture.

**Key Benefits**:

- Parallel processing (unlike RNNs)
- Long-range dependency modeling via self-attention
- Scalable to large datasets
- Transfer learning friendly

### 2. **Self-Attention Mechanism**

Powers the Transformer by computing attention weights between all sequence positions.

**Formula**:
$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Where:

- $Q$ = Query matrix
- $K$ = Key matrix
- $V$ = Value matrix
- $d_k$ = Dimension of keys

### 3. **Mel-Spectrogram Feature Extraction**

Converts raw audio into learned features.

**Process**:

1. Audio signal → STFT (Short-Time Fourier Transform)
2. Power spectrogram → Mel-scale filtering (80 mel bins)
3. Log compression for logarithmic frequency perception

**Why Mel-scale?**: Human hearing is non-linear; mel-scale mimics this.

### 4. **Encoder-Decoder Architecture**

Whisper uses the Transformer encoder-decoder pattern for sequence-to-sequence tasks.

### 5. **Sequence Matching Algorithm** (Phoneme Scoring)

Uses **SequenceMatcher** (Longest Contiguous Subsequence) to compare phoneme sequences.

**Algorithm**: Computes similarity ratio between two sequences
$$\text{Similarity Ratio} = \frac{2m}{n_1 + n_2}$$

Where:

- $m$ = Number of matching characters
- $n_1, n_2$ = Length of sequences

---

## Transformer Architecture

### The Transformer Foundation

The Transformer (Vaswani et al., 2017) revolutionized NLP and speech recognition.

**Core Components**:

#### 1. **Multi-Head Self-Attention**

```
Input (sequence of tokens)
    ↓
Linear Projections (split into h heads)
    ↓
Scale Dot-Product Attention (parallel)
    ↓
Concatenate & Linear Projection
    ↓
Output (weighted representations)
```

**Benefits**:

- Multiple attention heads learn different relationships
- Head count = parallelization
- Captures both local and global dependencies

#### 2. **Feed-Forward Networks (FFN)**

Applied to each position independently:
$$\text{FFN}(x) = \max(0, xW_1 + b_1)W_2 + b_2$$

- Uses ReLU/GELU activation
- Adds non-linearity to the model

#### 3. **Layer Normalization & Residual Connections**

Each sub-layer follows:
$$\text{Output} = \text{LayerNorm}(\text{Input} + \text{Sublayer}(\text{Input}))$$

This prevents vanishing gradients and stabilizes training.

#### 4. **Positional Encoding**

Transforms encode position information since self-attention is position-agnostic:

$$PE(pos, 2i) = \sin(pos/10000^{2i/d_{model}})$$
$$PE(pos, 2i+1) = \cos(pos/10000^{2i/d_{model}})$$

Where:

- $pos$ = Position in sequence
- $i$ = Dimension index
- $d_{model}$ = Model dimension

---

## Seq2Seq Encoder-Decoder

### Architecture Overview

The Seq2Seq (Sequence-to-Sequence) model is fundamental for speech-to-text tasks.

```
ENCODER SIDE                          DECODER SIDE
─────────────                         ─────────────

Audio Input (time-freq)          Target Tokens (Devanagari)
    ↓                                     ↓
Mel-Spectrogram                    Embedding Layer
(80 features)                            ↓
    ↓                            Self-Attention (causal)
Positional Encoding                      ↓
    ↓                            Cross-Attention (with encoder)
┌─────────────────────┐                  ↓
│ Transformer Encoder │          Feed-Forward Network
│ (6 layers)          │                  ↓
│ (8 attention heads) │          Output Logits
└──────────┬──────────┘                  ↓
           ↓                      Next Token Prediction
        Context Vector
        (Attention Weights)
           │
           └──────────→ Shared with Decoder
```

### Encoder Details (Sanskrit Whisper)

**Input**: Raw audio waveform

- Sample rate: 16 kHz (mono)
- Processed into 80-channel Mel-spectrogram

**Encoder Stack**:

- **Layers**: 6 Transformer layers
- **Attention Heads**: 8
- **Model Dimension** ($d_{model}$): 512
- **FFN Dimension**: 2048
- **Max Input Length**: 1500 frames (~188 seconds audio)

**Output**: Encoded representation (context) of audio

### Decoder Details

**Input**: Previous tokens (ground-truth during training, generated during inference)

- Vocabulary size: 51,865 tokens (covers Sanskrit + special tokens)
- Uses causal self-attention (can only attend to past tokens)

**Decoder Stack**:

- **Layers**: 6 Transformer layers
- **Attention Heads**: 8 (same as encoder)
- **Cross-Attention**: Attends to encoder output
- **Max Output Length**: 448 tokens (~55 seconds transcription)

**Output**: Probability distribution over vocabulary tokens

### Autoregressive Decoding (Inference)

During inference, the model generates text token-by-token:

```
Time Step 1: [BOS] → softmax → P(token_1)
           Choose: token_1 (highest probability)

Time Step 2: [BOS] + token_1 → softmax → P(token_2)
           Choose: token_2

Time Step 3: [BOS] + token_1 + token_2 → softmax → P(token_3)
           Choose: token_3 (or [EOS] to stop)

...
```

This iterative process generates the complete transcription.

---

## Whisper ASR Model

### What is Whisper?

**Whisper** is OpenAI's robust speech recognition model trained on 680,000 hours of multilingual audio from the web.

**Key Properties**:

- Multilingual support (99+ languages including Sanskrit)
- Handles accents, background noise, technical language
- Encoder-Decoder Transformer architecture
- Released open-source (November 2022)

### Whisper Model Architecture Specifications

Our fine-tuned Sanskrit version (`whisper_kathbath_final`) has:

| Component                | Value                             |
| ------------------------ | --------------------------------- |
| **Model Type**           | WhisperForConditionalGeneration   |
| **Encoder Layers**       | 6                                 |
| **Decoder Layers**       | 6                                 |
| **Attention Heads**      | 8 (both encoder & decoder)        |
| **Model Dimension**      | 512                               |
| **FFN Dimension**        | 2048                              |
| **Input Features**       | 80 mel-scaled spectrogram bins    |
| **Vocabulary Size**      | 51,865 tokens                     |
| **Activation Function**  | GELU (Gaussian Error Linear Unit) |
| **Data Type**            | float32                           |
| **Max Source Positions** | 1500 frames (~25 seconds @ 60fps) |
| **Max Target Positions** | 448 tokens (~55 seconds)          |

### Fine-tuning for Sanskrit

The base Whisper model is **fine-tuned** on Sanskrit data (Kathbath dataset):

- **Base Model**: Whisper-base (140M parameters)
- **Training Data**: Sanskrit speech corpus
- **Language Tag**: "sa" (ISO 639-1 code for Sanskrit)
- **Forced Decoder IDs**: None (allows open-ended transcription)

### Forward Pass in Whisper

```
Audio Input
    ↓
[1] Mel-Spectrogram Extraction
    - Input: 16kHz mono audio
    - Output: (seq_len, 80)
    ↓
[2] Encoder Stack
    - 6 Transformer layers
    - Self-attention over audio frames
    - Output: (seq_len, 512) hidden states
    ↓
[3] Decoder Stack (Autoregressive)
    - Takes encoder output + previous tokens
    - 6 Transformer layers
    - Cross-attention to encoder
    - Self-attention over generated tokens
    ↓
[4] Logits & Softmax
    - Output dimension: 51,865 (vocab size)
    - Softmax to get probabilities
    ↓
Predicted Sanskrit Text (Devanagari)
```

### Device Optimization

```python
device = "cuda" if torch.cuda.is_available() else "cpu"
```

- **GPU (CUDA)**: Fast inference, parallel computation
- **CPU**: Fallback, slower but no GPU required

---

## Phoneme Scoring System

### What are Phonemes?

**Phonemes** are the smallest units of sound that distinguish meaning in a language.

In Sanskrit:

- **Vowels** (स्वर): अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ
- **Consonants** (व्यंजन): क, ख, ग, घ, ङ, च, छ, ज, झ, ञ, ...

### IPA (International Phonetic Alphabet) Mapping

Each Devanagari character maps to IPA representation:

**Vowels**:
| Devanagari | IPA | Example |
|-----------|-----|---------|
| अ | schwa (ə) | cup |
| आ | long-a (aː) | father |
| इ | short-i (i) | bit |
| ई | long-i (iː) | see |

**Consonants**:
| Devanagari | IPA | Example |
|-----------|-----|---------|
| क | k | cat |
| ख | kʰ | khan |
| ग | g | go |
| च | tʃ | church |
| ट | ʈ | (retroflex) |

**Complete mapping in code**:

- 12 vowels mapped to IPA
- 32 consonants mapped to IPA
- 4 approximants & sibilants
- Total: ~48 phonemic distinctions

### Algorithm: Phoneme Comparison

The scoring system follows this algorithm:

```
1. INPUT:
   - expected_word_devanagari (e.g., "अश्वः")
   - transcribed_word (from Whisper, may need conversion)

2. ROMANIZATION DETECTION:
   if transcribed_word is not in Devanagari:
       convert to Devanagari using indic-transliteration

3. NORMALIZATION:
   - Remove combining marks (virama, anusvara)
   - Decompose to NFC (Canonical Form)
   - Strip whitespace

4. PHONEME CONVERSION:
   expected_phonemes = devanagari_to_phonemes(expected_word)
   actual_phonemes = devanagari_to_phonemes(transcribed_word)

5. SIMILARITY COMPUTATION:
   similarity = SequenceMatcher.ratio(expected, actual)
   score = round(similarity * 100)  # 0-100

6. EXACT MATCH CHECK:
   word_match = normalize(expected) == normalize(actual)

7. FEEDBACK GENERATION:
   if score >= 90: "Excellent!"
   elif score >= 75: "Great!"
   elif score >= 60: "Good!"
   elif score >= 40: "Getting there!"
   else: "Not quite."

8. OUTPUT:
   {
       "score": int (0-100),
       "word_match": bool,
       "similarity": float (0-1),
       "phoneme_sequence_expected": str,
       "phoneme_sequence_actual": str,
       "feedback": str
   }
```

### Devanagari Normalization

Devanagari script uses combining marks (diacritics) that need normalization:

**Before**: "अश्वः" (with virama/anusvara)
**After**: "अशव" (normalized, combining marks removed)

This prevents scoring errors from different Unicode representations of the same word.

### Romanization Conversion

Supports **three major Sanskrit romanization schemes**:

1. **IAST** (International Alphabet of Sanskrit Transliteration)
   - Example: "ashvah"
   - Diacritics: ā ī ū ṛ ṝ ē ō

2. **ITRANS** (Indian Languages Transliteration)
   - Example: "ashvah" (similar to IAST)
   - Uses ~ for nasalization

3. **SLP1** (Sanskrit Library Phonetic Basic)
   - Example: "aSvah"
   - Single-character ASCII representation

**Conversion Logic**:

```python
for scheme in [IAST, ITRANS, SLP1]:
    try:
        result = transliterate(text, scheme → DEVANAGARI)
        if result != original_text:
            return result
    except:
        continue
```

### Sequence Matching Algorithm

Uses Python's **difflib.SequenceMatcher**:

```python
matcher = SequenceMatcher(None, seq1, seq2)
similarity = matcher.ratio()  # 0.0 to 1.0
```

**Formula**:
$$\text{Ratio} = \frac{2m}{T}$$

Where:

- $m$ = Number of matches
- $T$ = Total sequence length

**Example**:

```
Expected: "कह" → IPA: "kəhə" (4 chars)
Actual:   "कः" → IPA: "kə" (2 chars)

Matches: "कə" (2 chars)
Ratio: 2*2 / (4+2) = 4/6 = 0.667 = 67%
```

---

## Complete Pipeline

### End-to-End Request Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT REQUEST (/evaluate POST)                          │
│    - Expected word: "अश्वः" (Devanagari)                     │
│    - Audio: base64-encoded WebM file                        │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 2. DECODE & VALIDATE INPUT                                  │
│    - Decode base64 audio                                    │
│    - Validate word format                                   │
│    - Check audio size/validity                              │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 3. AUDIO CONVERSION (ffmpeg)                                │
│    Input:  WebM container, variable codec                  │
│    Process: ffmpeg -i input.webm -ar 16000 -ac 1 output.wav│
│    Output: PCM WAV, 16kHz mono                              │
│    Why: Whisper expects 16kHz mono                          │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 4. AUDIO LOADING (librosa)                                  │
│    Input:  WAV file (16kHz mono)                            │
│    Process: Load with librosa.load(sr=16000)               │
│    Output: NumPy array (float32), shape: (num_samples,)    │
│    Why: Librosa handles encoding/resampling                │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 5. MEL-SPECTROGRAM EXTRACTION (Whisper preprocessing)       │
│    Input:  Audio waveform                                   │
│    Steps:                                                   │
│      a) STFT (Short-Time Fourier Transform)                │
│      b) Power spectrogram calculation                       │
│      c) Mel-scale filtering (80 bins)                      │
│      d) Log compression                                     │
│    Output: (frames, 80) spectrogram                        │
│    Why: Mimics human auditory perception                   │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 6. WHISPER ENCODER FORWARD PASS                             │
│    Input:  (frames, 80) mel-spectrogram                    │
│    Process:                                                 │
│      a) Positional encoding (frame positions)              │
│      b) 6 Transformer encoder layers                        │
│      c) 8-head attention mechanism                          │
│      d) Feed-forward networks                               │
│    Output: (frames, 512) contextual embeddings             │
│    Why: Learn audio patterns & representations             │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 7. WHISPER DECODER FORWARD PASS (Autoregressive)           │
│    Iterative generation:                                    │
│                                                              │
│    Step 1: [BOS] token → encoder context                   │
│             ↓                                                │
│             Decoder → Softmax → token_1 (highest prob)    │
│                                                              │
│    Step 2: [BOS] + token_1 → encoder context               │
│             ↓                                                │
│             Decoder → Softmax → token_2                    │
│                                                              │
│    Step N: [BOS] + tokens... → Softmax → [EOS] or token   │
│                                                              │
│    [BOS] = Begin-of-sequence token                         │
│    [EOS] = End-of-sequence token                           │
│    51,865 vocabulary tokens (Sanskrit + special)           │
│                                                              │
│    Output: "अश्व" (Devanagari text)                        │
│    Why: Transformer attention captures long dependencies   │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 8. TRANSCRIPTION POST-PROCESSING                            │
│    - Strip whitespace                                       │
│    - Normalize Devanagari (remove combining marks)         │
│    Output: "अश्वः" (expected: "अश्वः")                      │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 9. PHONEME SCORING PHASE                                    │
│                                                              │
│    A. ROMANIZATION DETECTION & CONVERSION                  │
│       if not is_devanagari(transcribed):                    │
│           transcribed = romanized_to_devanagari()          │
│                                                              │
│    B. PHONEME SEQUENCE CONVERSION                          │
│       expected_phonemes = devanagari_to_phonemes()         │
│       actual_phonemes = devanagari_to_phonemes()           │
│                                                              │
│       Example:                                              │
│       "अश्वः" → "əʃʋ:" (IPA phoneme sequence)             │
│                                                              │
│    C. SIMILARITY COMPUTATION                               │
│       similarity = SequenceMatcher.ratio()                 │
│       (0-1, where 1 is perfect match)                      │
│                                                              │
│    Output: similarity (0-1), phoneme sequences            │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 10. SCORE CALCULATION & FEEDBACK GENERATION                 │
│                                                              │
│     score = round(similarity * 100)  # Convert to 0-100    │
│                                                              │
│     Feedback Decision Tree:                                 │
│     ├─ score >= 90: "Excellent! Perfect or near-perfect"   │
│     ├─ score >= 75: "Great! Very close. Minor differences" │
│     ├─ score >= 60: "Good! You're on the right track"      │
│     ├─ score >= 40: "Getting there! Try again"             │
│     └─ score < 40: "Not quite. You said something different"│
│                                                              │
│     word_match = exact_match after normalization           │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 11. RESPONSE OBJECT CONSTRUCTION                            │
│                                                              │
│     EvaluationResponse {                                    │
│         word_match: bool,                                   │
│         score: int (0-100),                                 │
│         transcription: str (Devanagari),                   │
│         transcription_devanagari: str,                     │
│         feedback: str,                                      │
│         phoneme_sequence_expected: str (IPA),              │
│         phoneme_sequence_actual: str (IPA),                │
│         similarity: float (0-1)                             │
│     }                                                        │
└────────────────────┬────────────────────────────────────────┘

┌────────────────────▼────────────────────────────────────────┐
│ 12. RESPONSE & CLEANUP                                      │
│    - Return JSON response (200 OK)                          │
│    - Delete temporary audio files (ffmpeg outputs)         │
│    - Cleanup: temp WebM and WAV files                      │
└─────────────────────────────────────────────────────────────┘
```

### Performance Breakdown

| Stage                     | Time (approx)    | Bottleneck               |
| ------------------------- | ---------------- | ------------------------ |
| Audio decode              | 10-50ms          | I/O, large files         |
| Audio conversion (ffmpeg) | 100-500ms        | Audio codec              |
| Mel-spectrogram           | 10-20ms          | Fast with librosa        |
| Whisper encoder           | 200-400ms        | GPU/CPU bound            |
| Whisper decoder           | 300-800ms        | Autoregressive (N steps) |
| Phoneme scoring           | 5-10ms           | String operations        |
| **Total**                 | **625ms - 1.8s** | Whisper inference        |

---

## Implementation Details

### Code Flow: Main Evaluation Endpoint

```python
@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_pronunciation(request: EvaluationRequest) -> EvaluationResponse:
    """
    Main endpoint implementation
    """

    # Step 1: Decode base64 audio
    audio_bytes = base64.b64decode(request.audio_base64)

    # Step 2: Write to temporary WebM file
    with tempfile.NamedTemporaryFile(suffix=".webm") as tmp_input:
        tmp_input.write(audio_bytes)
        input_file = tmp_input.name

    # Step 3: Convert WebM → WAV with ffmpeg
    subprocess.run([
        "ffmpeg", "-i", input_file,
        "-ar", "16000",      # 16kHz sample rate
        "-ac", "1",          # 1 channel (mono)
        "-q:a", "9",         # Quality
        output_file, "-y"
    ])

    # Step 4: Load audio with librosa
    audio, sr = librosa.load(output_file, sr=16000, mono=True)

    # Step 5: Transcribe with Whisper
    result = whisper_model.transcribe(
        audio,
        language="sa",          # Sanskrit
        verbose=False
    )
    transcription_devanagari = result["text"].strip()

    # Step 6: Score the pronunciation
    comparison = compare_pronunciations(
        expected_word_devanagari=request.word_expected,
        transcribed_word_devanagari=transcription_devanagari
    )

    # Step 7: Build response
    return EvaluationResponse(
        word_match=comparison["word_match"],
        score=comparison["score"],
        transcription=transcription_devanagari,
        feedback=comparison["feedback"],
        phoneme_sequence_expected=comparison["phoneme_sequence_expected"],
        phoneme_sequence_actual=comparison["phoneme_sequence_actual"],
        similarity=comparison["similarity"]
    )
```

### Key Data Structures

**EvaluationRequest**:

```python
class EvaluationRequest(BaseModel):
    word_expected: str          # e.g., "अश्वः"
    audio_base64: str           # Base64-encoded WebM/audio
```

**EvaluationResponse**:

```python
class EvaluationResponse(BaseModel):
    word_match: bool            # Exact pronunciation match?
    score: int                  # 0-100 accuracy
    transcription: str          # What Whisper heard
    transcription_devanagari: str  # Normalized Devanagari
    feedback: str               # Human-friendly message
    phoneme_sequence_expected: str # IPA expected
    phoneme_sequence_actual: str   # IPA actual
    similarity: float           # 0-1 phoneme similarity
```

---

## Performance & Optimization

### Model Loading & Caching

**Lifespan Management**:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs once on startup"""
    load_models()  # Load Whisper model
    yield
    # Cleanup on shutdown
```

**Why**:

- Whisper model (~140M parameters) is large
- Loading multiple times would be expensive
- Load once, reuse for all requests

### Device Acceleration

```python
device = "cuda" if torch.cuda.is_available() else "cpu"
whisper_model = whisper.load_model(model_path, device=device)
```

**GPU (CUDA)**:

- 3-5x faster inference
- Parallel tensor operations
- Suitable for production

**CPU**:

- Fallback option
- ~50-100ms slower per request
- Suitable for development

### Audio Processing Optimization

| Technique             | Benefit                         |
| --------------------- | ------------------------------- |
| Resampling to 16kHz   | Reduces data (44.1kHz → 16kHz)  |
| Mono conversion       | Cuts memory/computation in half |
| ffmpeg pre-processing | Handles various audio codecs    |
| Librosa caching       | Avoids redundant operations     |

### Memory Efficiency

| Component             | Memory                                |
| --------------------- | ------------------------------------- |
| Whisper model (GPU)   | ~280MB (float32)                      |
| Audio buffer (10s)    | ~320KB (16kHz × 10s × 2 bytes)        |
| Mel-spectrogram (10s) | ~64KB (75 frames × 80 bins × 4 bytes) |
| Intermediate tensors  | ~100MB (during inference)             |
| **Total footprint**   | **~380MB**                            |

### Batch Processing (Future)

Current implementation handles **one request at a time**. For scaling:

```python
@app.post("/evaluate-batch")
async def evaluate_batch(requests: List[EvaluationRequest]):
    """Process multiple requests in parallel"""
    tasks = [evaluate_pronunciation(req) for req in requests]
    return await asyncio.gather(*tasks)
```

### Caching Opportunities

1. **Model Caching**: ✅ Implemented (global `whisper_model`)
2. **Audio Cache**: Could cache processed spectrograms (rarely useful)
3. **Phoneme Cache**: Could cache phoneme mappings (minimal gain)

---

## Error Handling & Robustness

### Common Error Cases

| Error                | Handling                                     |
| -------------------- | -------------------------------------------- |
| Invalid base64       | HTTPException 400 (Bad audio)                |
| Corrupted audio file | HTTPException 400 (Audio processing failed)  |
| Empty audio          | HTTPException 400 (Audio is empty)           |
| ffmpeg timeout       | HTTPException 400 (Conversion failed)        |
| Out of memory        | HTTPException 500 (Server error)             |
| Invalid Devanagari   | Graceful fallback (returns empty similarity) |

### Cleanup & Resource Management

```python
finally:
    for temp_file in temp_files:
        try:
            os.remove(temp_file)  # Clean temporary files
        except Exception:
            logger.warning(f"Failed to clean up {temp_file}")
```

Ensures temporary WebM/WAV files always removed, preventing disk space issues.

---

## API Endpoints

### Health Check

```
GET /health

Response:
{
    "status": "healthy",
    "whisper_model": "base",
    "device": "cuda"
}
```

### Pronunciation Evaluation

```
POST /evaluate

Request:
{
    "word_expected": "अश्वः",
    "audio_base64": "...base64-encoded audio..."
}

Response:
{
    "word_match": true,
    "score": 92,
    "transcription": "अश्वः",
    "transcription_devanagari": "अश्वः",
    "feedback": "Excellent! Perfect or near-perfect pronunciation.",
    "phoneme_sequence_expected": "əʃʋə:",
    "phoneme_sequence_actual": "əʃʋə:",
    "similarity": 0.95
}
```

---

## Technologies Summary

### Deep Learning Stack

- **Framework**: PyTorch (GPU-accelerated tensor operations)
- **Model Type**: Transformer (Encoder-Decoder)
- **Pretrained Weights**: OpenAI Whisper (680K hours training)
- **Fine-tuning**: Sanskrit corpus (Kathbath dataset)

### NLP/Speech

- **ASR**: Whisper (99+ languages, robust noise handling)
- **Phoneme Mapping**: Custom Sanskrit IPA dictionary
- **Script Processing**: indic-transliteration (IAST/ITRANS/SLP1)
- **Sequence Matching**: Python difflib.SequenceMatcher

### Audio Processing

- **Librosa**: Audio loading, resampling, feature extraction
- **ffmpeg**: Codec conversion (WebM → WAV)
- **TorchAudio**: (available for future use)

### Web Framework

- **FastAPI**: Modern async Python web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Request/Response validation

---

## Future Improvements

1. **Batch Processing**: Handle multiple student evaluations simultaneously
2. **Caching**: Redis cache for frequent word evaluations
3. **Custom Vocab**: Focus ASR on Sanskrit words only (reduce errors)
4. **Prosody Analysis**: Evaluate tone, rhythm, stress patterns
5. **Spectrogram Visualization**: Return visual comparison of expected vs. actual
6. **Confidence Scores**: Per-token confidence from Whisper logits
7. **Allophone Support**: Different pronunciations of same phoneme
8. **Multilingual Support**: Mix Sanskrit with Hindi/English

---

## References & Resources

### Papers

- **Attention Is All You Need** (Vaswani et al., 2017) - Transformer foundation
- **Robust Speech Recognition via Large-Scale Weak Supervision** (Radford et al., 2022) - Whisper paper
- **Seq2Seq with Attention** (Bahdanau et al., 2015) - Encoder-Decoder attention

### Tools & Libraries

- [OpenAI Whisper](https://github.com/openai/whisper)
- [indic-transliteration](https://github.com/indic-transliteration/indic-transliteration)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyTorch Documentation](https://pytorch.org/)
- [Librosa](https://librosa.org/)

### Sanskrit Resources

- **Kathbath Dataset**: Sanskrit speech corpus for fine-tuning
- **Devanagari Unicode**: U+0900 to U+097F range
- **IPA for Sanskrit**: Standard phonetic alphabet mappings

---

## Glossary

| Term                | Definition                                                        |
| ------------------- | ----------------------------------------------------------------- |
| **ASR**             | Automatic Speech Recognition - converts audio to text             |
| **Transformer**     | Neural architecture using self-attention (no RNNs/CNNs)           |
| **Encoder-Decoder** | Two-part model: encoder processes input, decoder generates output |
| **Seq2Seq**         | Sequence-to-Sequence - maps one sequence to another               |
| **Self-Attention**  | Mechanism where sequence elements attend to all positions         |
| **FFN**             | Feed-Forward Network - non-linear transformation layer            |
| **Mel-Spectrogram** | Audio representation on mel-scale (logarithmic frequency)         |
| **Phoneme**         | Smallest unit of distinctive sound in a language                  |
| **IPA**             | International Phonetic Alphabet - standardized sound notation     |
| **IAST**            | International Alphabet of Sanskrit Transliteration                |
| **Devanagari**      | Script used for Sanskrit, Hindi, and other languages              |
| **BOS/EOS**         | Begin-of-Sequence / End-of-Sequence tokens                        |
| **CUDA**            | GPU computing platform by NVIDIA                                  |
| **ASGI**            | Asynchronous Server Gateway Interface - async web standard        |

---

## Quick Start for Developers

### Running the Service

```bash
cd ml-service
pip install -r requirements.txt
python main.py  # Starts on http://0.0.0.0:8000
```

### Testing Language Evaluation

```bash
curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "word_expected": "अश्वः",
    "audio_base64": "..."
  }'
```

### Understanding the Phoneme Scorer

Edit `phoneme_scorer.py` to:

- Add more phonemes to `SANSKRIT_PHONEME_MAP`
- Adjust scoring thresholds in `compare_pronunciations()`
- Implement custom romanization rules

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Maintained By**: Sanskrit Setu ML Team
