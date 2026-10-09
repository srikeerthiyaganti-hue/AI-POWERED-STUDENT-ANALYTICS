import json

with open("sample_data/existing_teacher_students.json", "r", encoding="utf-8") as f:
    teacher_data = json.load(f)
    print("Teacher data keys:", list(teacher_data.keys()))
    students = teacher_data.get("data", [])
    print(f"Total students in teacher_data: {len(students)}")
    if students:
        print("First student:", json.dumps(students[0], indent=2))
        print("Second student:", json.dumps(students[1], indent=2))
