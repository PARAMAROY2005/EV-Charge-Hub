"""
Vercel Serverless Function entrypoint for FastAPI backend.
"""

import sys
from pathlib import Path

# Add project root to sys.path so 'backend' package imports cleanly
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.main import app
