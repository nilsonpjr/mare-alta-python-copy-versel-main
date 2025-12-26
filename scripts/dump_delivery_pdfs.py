
from pypdf import PdfReader
import os

files = ["ENTTECMERC.pdf", "ENTTECPOPA.pdf"]
base_path = os.getcwd()

with open("delivery_forms_dump.txt", "w") as f:
    for filename in files:
        f.write(f"\n\n--- FILE: {filename} ---\n")
        path = os.path.join(base_path, filename)
        if os.path.exists(path):
            try:
                reader = PdfReader(path)
                for page in reader.pages:
                    f.write(page.extract_text())
                    f.write("\n--------------------\n")
            except Exception as e:
                f.write(f"Error reading {filename}: {e}")
        else:
            f.write(f"File not found: {path}")
