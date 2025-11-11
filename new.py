import json

# Load the files
with open("state_to_districts.json", "r", encoding="utf-8") as f:
    state_to_districts = json.load(f)

with open("invalid_districts.json", "r", encoding="utf-8") as f:
    invalid_districts = json.load(f)

# Remove invalid districts from each state
removed_count = 0
for state, invalid_list in invalid_districts.items():
    if state in state_to_districts:
        original_count = len(state_to_districts[state])
        # Keep only districts that are NOT in the invalid list
        state_to_districts[state] = [
            district for district in state_to_districts[state]
            if district not in invalid_list
        ]
        removed = original_count - len(state_to_districts[state])
        removed_count += removed
        if removed > 0:
            print(f"{state}: Removed {removed} invalid districts")

# Save the cleaned data
with open("s2D_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(state_to_districts, f, ensure_ascii=False, indent=2)

print(f"\n✅ Done! Removed {removed_count} invalid districts")
print(f"   Saved cleaned data → s2D_cleaned.json")
