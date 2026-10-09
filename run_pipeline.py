import sys
import argparse
from app.pipeline import AcademicExtractionPipeline
from app.database import get_db

def main():
    parser = argparse.ArgumentParser(description="VFSTR Academic Extraction Pipeline CLI")
    parser.add_argument("--dry-run", action="store_true", help="Run in dry-run mode without saving changes")
    args = parser.parse_args()

    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("================================================================")
    print(" VFSTR ACADEMIC DATA EXTRACTION PIPELINE")
    print("================================================================")
    print(f"Dry run mode: {args.dry_run}")

    pipeline = AcademicExtractionPipeline(dry_run=args.dry_run)
    stats = pipeline.run()

    print("\n------------------- PIPELINE EXECUTION STATS -------------------")
    for k, v in stats.items():
        print(f" {k:<28}: {v}")
    print("----------------------------------------------------------------")

    if not args.dry_run:
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) as c FROM source_documents")
            sources = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM regulations")
            regs = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM programs")
            progs = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM courses")
            courses = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM syllabus_units")
            units = cur.fetchone()["c"]
            cur.execute("SELECT COUNT(*) as c FROM failed_records")
            failed = cur.fetchone()["c"]

            print("\n------------------- DATABASE AUDIT SUMMARY ---------------------")
            print(f" Source Documents Tracked     : {sources}")
            print(f" Academic Regulations         : {regs}")
            print(f" Academic Programs            : {progs}")
            print(f" Total Unique Courses         : {courses}")
            print(f" Total Syllabus Units (1..5)  : {units}")
            print(f" Flagged / Failed Records     : {failed}")
            print("================================================================")

if __name__ == "__main__":
    main()
