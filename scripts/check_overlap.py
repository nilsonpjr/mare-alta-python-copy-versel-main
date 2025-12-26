
import json

with open("extracted_data.json", "r") as f:
    data = json.load(f)

parts = data['parts']
kits = data['kits']

# Index parts by SKU
parts_map = {p['sku']: p for p in parts}

updated_kits = 0
for kit in kits:
    if kit['sku'] in parts_map:
        kit['price'] = parts_map[kit['sku']]['price']
        updated_kits += 1
        print(f"Found price for kit {kit['sku']}: {kit['price']}")

print(f"Matched prices for {updated_kits} / {len(kits)} kits.")
