
from pypdf import PdfReader
import os

files = [
    "Acess25Rev10.pdf",
    "KitsManut25Rev1.pdf",
    "Oleo25Rev1.pdf"
]

base_path = os.getcwd()

for filename in files:
    path = os.path.join(base_path, filename)
    print(f"\n\n{'='*50}")
    print(f"FILE: {filename}")
    print(f"{'='*50}\n")
    
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
        
    try:
        reader = PdfReader(path)
        for page in reader.pages:
            print(page.extract_text())
            print("-" * 20)
    except Exception as e:
        print(f"Error reading {filename}: {e}")
