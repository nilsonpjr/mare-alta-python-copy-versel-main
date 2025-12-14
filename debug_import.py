import sys
import os

print("Simulating Vercel environment...")
# Adiciona paths como no api/index.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

print(f"Sys.path: {sys.path}")

try:
    print("Attempting to import backend.main...")
    from backend.main import app
    print("Success importing backend.main!")
except ImportError as e:
    print(f"Failed to import backend.main: {e}")
    try:
        print("Attempting to import main...")
        from main import app
        print("Success importing main!")
    except ImportError as e2:
        print(f"Failed to import main: {e2}")
        import traceback
        traceback.print_exc()

print("Simulation complete.")
