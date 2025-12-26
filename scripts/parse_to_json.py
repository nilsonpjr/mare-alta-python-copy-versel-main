
import re
import json
import os
from pypdf import PdfReader

def parse_price(price_str):
    # Remove R$, dots, replace comma with dot
    clean = price_str.replace('R$', '').replace('.', '').replace(',', '.').strip()
    try:
        # Sometimes there's extra text like "+ ST"
        if '+' in clean:
            clean = clean.split('+')[0].strip()
        return float(clean)
    except:
        return 0.0

def process_accessories_oils(filename):
    items = []
    path = filename
    if not os.path.exists(path):
        print(f"Skipping {path}")
        return []
    
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
        
    # Regex to find REF and Price
    # Pattern: Description (variable lines) -> REF. code -> R$ price
    # We'll look for chunks.
    
    # Strategy: Find all "REF. XXXXX" and associated "R$ YYYY"
    # This is tricky because description is above.
    
    # Let's clean up formatting
    lines = text.split('\n')
    
    current_desc = []
    
    # Iterator
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Check for REF
        ref_match = re.search(r'REF\.\s*([A-Za-z0-9-]+)', line)
        if ref_match:
            sku = ref_match.group(1)
            
            # Look ahead for price in next few lines
            price = 0.0
            price_found = False
            
            # Check current line for price too
            price_match = re.search(r'R\$\s*([\d\.,]+)', line)
            
            if price_match:
                price = parse_price(price_match.group(1))
                price_found = True
            else:
                # Look ahead
                for k in range(1, 5): # check next 4 lines
                    if i + k < len(lines):
                        next_line = lines[i+k]
                        pm = re.search(r'R\$\s*([\d\.,]+)', next_line)
                        if pm:
                            price = parse_price(pm.group(1))
                            price_found = True
                            break
            
            # Description is what we accumulated before
            # Filter out junk from description (like "R$...", "REF...")
            clean_desc = " ".join([d for d in current_desc if "REF." not in d and "R$" not in d and "This data" not in d and "---" not in d]).strip()
            
            if not clean_desc and items:
                # maybe incomplete parsing, previous item might have consumed it? 
                # Or maybe it's just the previous line
                pass
            
            if not clean_desc:
                # Fallback: just use sku
                clean_desc = f"Item {sku}"

            # Add to items
            items.append({
                "sku": sku,
                "name": clean_desc if clean_desc else "Item Generic",
                "price": price,
                "cost": price * 0.6, # Estimating cost as 60% of price
                "category": "Acessórios" if "Acess" in filename else "Óleo/Químicos"
            })
            
            current_desc = [] # Reset
        else:
            if line and "R$" not in line and "This data" not in line and "---" not in line and "PAGE" not in line:
                current_desc.append(line)
        
        i += 1
        
    return items

def process_kits(filename):
    items = []
    path = filename
    if not os.path.exists(path):
        return []
        
    reader = PdfReader(path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
        
    lines = text.split('\n')
    
    # Pattern: 8M0232733 KIT DE MANUTENÇÃO...
    # Regex: Start with digit/letter (8M...), whitespace, then text
    
    processed_skus = set()
    
    for line in lines:
        line = line.strip()
        match = re.match(r'^([8A-Z0-9]{5,})\s+(KIT DE MANUTENÇÃO.+)', line)
        if match:
            sku = match.group(1)
            desc = match.group(2)
            
            # Try to extract hours to categorize
            hours = 0
            if "100HS" in desc or "100 HS" in desc: hours = 100
            elif "300HS" in desc or "300 HS" in desc: hours = 300
            elif "1000HS" in desc: hours = 1000
            
            # Extract engine model hint
            # ex: "40-60HP EFI 4T"
            
            if sku not in processed_skus:
                items.append({
                    "sku": sku,
                    "name": desc,
                    "price": 0.0, # No price in this file
                    "category": "Kit Revisão",
                    "hours": hours,
                    "desc_full": desc
                })
                processed_skus.add(sku)
                
    return items

# Main execution
all_parts = []
all_parts.extend(process_accessories_oils("Acess25Rev10.pdf"))
all_parts.extend(process_accessories_oils("Oleo25Rev1.pdf"))
kits = process_kits("KitsManut25Rev1.pdf")

# Generate SQL/Python seed code
# We will write a python script that uses the existing CRUD to insert these.
# But first let's just dump to JSON to verify structure
output = {
    "parts": all_parts,
    "kits": kits
}

with open("extracted_data.json", "w", encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(all_parts)} parts and {len(kits)} kits.")
