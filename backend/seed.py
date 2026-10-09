"""
CODEBUFFET — Standalone Database Seeder
Usage: python -m backend.seed
"""

from backend.database import init_db, seed_initial_data

if __name__ == "__main__":
    print("Initializing CODEBUFFET database schema...")
    init_db()
    print("Seeding default hackathon demo accounts and student cohort...")
    seed_initial_data()
    print("Database seeding completed successfully.")
