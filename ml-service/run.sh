#!/bin/bash
set -e

echo "🚀 Sanskrit Pronunciation ML Service"
echo "===================================="

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python $PYTHON_VERSION found"

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/upgrade dependencies
echo "📚 Installing dependencies (this may take a few minutes)..."
pip install --upgrade pip "setuptools>=68.0.0" wheel
echo "📦 Installing PyTorch (CPU-optimized)..."
pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
echo "📦 Installing remaining dependencies..."
pip install --no-cache-dir -r requirements.txt

# Verify torch installation
echo "✅ Verifying PyTorch installation..."
python3 -c "import torch; print(f'PyTorch version: {torch.__version__}')"
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"

# Download Whisper model (first run)
echo "🎤 Downloading Whisper model..."
python3 -c "import whisper; whisper.load_model('base')"

echo ""
echo "✅ Setup complete!"
echo "🚀 Starting FastAPI server on http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo ""

# Start server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
