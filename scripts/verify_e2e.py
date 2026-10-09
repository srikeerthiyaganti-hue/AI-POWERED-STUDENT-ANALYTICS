import sys, os
sys.path.insert(0, os.path.abspath('.'))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Root HTML
r_root = client.get('/', headers={'Accept': 'text/html'})
assert r_root.status_code == 200 and 'Smart Campus Analytics' in r_root.text
print("[OK] Root HTML dashboard served correctly")

# 2. Static CSS & JS
r_css = client.get('/static/styles.css')
assert r_css.status_code == 200 and len(r_css.text) > 1000
print("[OK] static/styles.css served correctly")

r_js = client.get('/static/app.js')
assert r_js.status_code == 200 and len(r_js.text) > 1000
print("[OK] static/app.js served correctly")

# 3. Overview API
r_ov = client.get('/api/analytics/overview')
assert r_ov.status_code == 200
data = r_ov.json()
print("[OK] Overview API:")
print(f"     Total Students: {data['kpis']['total_students']}")
print(f"     Avg Success Score: {data['kpis']['avg_success_score']}/100")
print(f"     Avg Attendance: {data['kpis']['avg_attendance']}%")
print(f"     Avg Placement Prep: {data['kpis']['avg_placement_prep']}%")
print(f"     High Risk: {data['kpis']['high_risk_count']}, Moderate: {data['kpis']['moderate_risk_count']}, Low: {data['kpis']['low_risk_count']}")
print(f"     Category Completeness: {list(data['category_coverage'].keys())}")
print(f"     Distinct Segments: {len(data['segment_distribution'])}")

# 4. Student Roster API
r_roster = client.get('/api/analytics/students?limit=5')
assert r_roster.status_code == 200
roster_data = r_roster.json()
print(f"[OK] Roster API: {roster_data['total']} students total, {len(roster_data['students'])} returned on page 1")

# 5. Student 360 Detail
r_det = client.get('/api/analytics/students/1')
assert r_det.status_code == 200
det_data = r_det.json()
print(f"[OK] Student 360 Detail: {det_data['student']['name']} ({det_data['student']['reg_no']})")
print(f"     Score: {det_data['success_score']['score']}, Tier: {det_data['success_score']['performance_tier']}")
print(f"     Risk: {det_data['risk_assessment']['risk_level']}, Rules triggered: {len(det_data['risk_assessment']['triggered_rules'])}")
print(f"     Academic subjects: {len(det_data['academic'].get('subjects', []))}")

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
