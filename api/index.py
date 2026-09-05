import sys
import os

# Add root directory and backend directory to path for Vercel Serverless
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend'))

from backend.app.main import app
