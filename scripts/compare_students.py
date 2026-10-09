import json

with open("sample_data/existing_api_students.json", "r", encoding="utf-8") as f:
    api_students = json.load(f)

with open("sample_data/existing_teacher_students.json", "r", encoding="utf-8") as f:
    teacher_students = json.load(f).get("data", [])

print(f"API students count: {len(api_students)}")
print(f"Teacher students count: {len(teacher_students)}")

print("\nSample API students:")
for s in api_students[:5]:
    print(s)

print("\nSample Teacher students:")
for s in teacher_students[:5]:
    print(s)
