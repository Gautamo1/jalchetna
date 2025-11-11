import json
import requests
import time
import random

API_URL = "https://indiawris.gov.in/Dataset/Ground%20Water%20Level"

with open("s2D.json", "r", encoding="utf-8") as f:
    state_to_districts = json.load(f)

invalid = {}
all_data = []

for state, districts in state_to_districts.items():
    print(f"\n--- Testing {state} ---")

    for district in districts:
        params = {
            "stateName": state,
            "districtName": district,
            "agencyName": "CGWB",
            "startdate": "2025-11-09",
            "enddate": "2025-11-09",
            "download": "false",
            "page": 0,
            "size": 1000
        }

        data = []
        for attempt in range(3):  # retry up to 3 times
            try:
                r = requests.post(
                    API_URL,
                    params=params,
                    headers={"User-Agent": "Mozilla/5.0"},
                    timeout=12
                )

                if r.status_code != 200:
                    raise Exception("HTTP", r.status_code)

                data = r.json().get("data", [])
                break
            except Exception:
                print(f"  retry {attempt+1} → {district}")
                time.sleep(2)

        if not data:
            invalid.setdefault(state, []).append(district)
            print(f"  ❌ No data: {district}")
        else:
            # Store the data
            for record in data:
                record['state'] = state
                record['district'] = district
                all_data.append(record)
            print(f"  ✅ OK: {district} ({len(data)} records)")

        # random sleep to avoid throttling
        time.sleep(0.7 + random.random() * 0.5)

# Save invalid districts
with open("invalid_districts2.json", "w", encoding="utf-8") as f:
    json.dump(invalid, f, ensure_ascii=False, indent=2)

# Save all collected data
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\n✅ Done!")
print(f"   - Saved {len(all_data)} records → data.json")
print(f"   - Saved invalid districts → invalid_districts2.json")
