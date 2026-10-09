import json

with open("sample_data/existing_api_students.json") as f:
    api_list = json.load(f)

print(f"Total API records: {len(api_list)}")
for i, s in enumerate(api_list):
    print(f"[{i:02d}] reg_no={s.get('reg_no')}, name={s.get('student_name')}, branch={s.get('branch')}, sem={s.get('semester')}, cgpa={s.get('cgpa')}")
