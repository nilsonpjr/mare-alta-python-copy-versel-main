
from pypdf import PdfReader
import os

files = ["Acess25Rev10.pdf", "Oleo25Rev1.pdf"]
base_path = os.getcwd()

with open("parts_dump.txt", "w") as f:
    for filename in files:
        f.write(f"\n\n--- FILE: {filename} ---\n")
        path = os.path.join(base_path, filename)
        if os.path.exists(path):
            reader = PdfReader(path)
            for page in reader.pages:
                f.write(page.extract_text())
                f.write("\n--------------------\n")
        else:
            f.write("File not found")
