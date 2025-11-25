from pathlib import Path
import sys

SERVICE_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = SERVICE_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

__all__ = ["SERVICE_DIR", "BACKEND_DIR"]

