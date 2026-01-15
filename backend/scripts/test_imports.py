import sys
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).parent.parent.parent
sys.path.append(str(project_root))

try:
    print("Tentando: import models")
    import models
    print("✅ import models funcionou")
except ImportError as e:
    print(f"❌ import models falhou: {e}")

try:
    print("Tentando: from backend import models")
    from backend import models
    print("✅ from backend import models funcionou")
except ImportError as e:
    print(f"❌ from backend import models falhou: {e}")
