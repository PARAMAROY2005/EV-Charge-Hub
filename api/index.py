"""
Vercel Serverless Function entrypoint for FastAPI backend.
This file is the ASGI handler that Vercel's Python runtime calls.
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path so 'backend' package imports cleanly on Vercel
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

# Set VERCEL env var so db.py uses /tmp for SQLite
os.environ.setdefault("VERCEL", "1")

from backend.main import app

# Vercel expects a module-level 'app' variable (ASGI app)
# The import above already provides it.
