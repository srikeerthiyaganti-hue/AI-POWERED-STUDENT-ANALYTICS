import json

with open("sample_data/existing_api_students.json") as f:
    api_list = json.load(f)

with open("sample_data/existing_teacher_students.json") as f:
    teacher_list = json.load(f)["data"]

print("Comparing index by index:")
for i in range(10):
    a = api_list[i]
    t = teacher_list[i]
    print(f"[{i}] API: reg_no={a.get('reg_no')}, name={a.get('student_name')}, branch={a.get('branch')}, sem={a.get('semester')}, cgpa={a.get('cgpa')}")
    print(f"    TEA: id={t.get('student_id')}, name={t.get('name')}, dept={t.get('department')}, sem={t.get('semester')}, cgpa={t.get('cgpa')}")
