
from pypdf import PdfReader
import os

filename = "KitsManut25Rev1.pdf"
base_path = os.getcwd()
path = os.path.join(base_path, filename)

with open("kits_dump.txt", "w") as f:
    if os.path.exists(path):
        reader = PdfReader(path)
        for page in reader.pages:
            f.write(page.extract_text())
            f.write("\n--------------------\n")
    else:
        f.write("File not found")
