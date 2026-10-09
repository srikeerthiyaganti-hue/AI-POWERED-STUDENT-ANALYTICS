import unittest
import sqlite3
from pathlib import Path
from app.database import get_db, init_db, SCHEMA_SQL

class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.test_db = Path("test_temp.db")
        if self.test_db.exists():
            self.test_db.unlink()
        init_db(self.test_db)

    def tearDown(self):
        if self.test_db.exists():
            self.test_db.unlink()

    def test_schema_and_constraints(self):
        with get_db(self.test_db) as conn:
            # 1. Insert source document
            conn.execute(
                """
                INSERT INTO source_documents (source_url, title, document_type, content_hash)
                VALUES ('https://vignan.ac.in/test.pdf', 'Test Doc', 'pdf', 'hash123')
                """
            )
            doc_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            # 2. Insert regulation
            conn.execute(
                """
                INSERT INTO regulations (regulation_code, regulation_name, degree, source_document_id)
                VALUES ('R22', 'Regulations R22', 'B.Tech', ?)
                """,
                (doc_id,)
            )
            reg_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            # 3. Test uniqueness constraint on regulation (R22, B.Tech)
            with self.assertRaises(sqlite3.IntegrityError):
                conn.execute(
                    """
                    INSERT INTO regulations (regulation_code, regulation_name, degree, source_document_id)
                    VALUES ('R22', 'Duplicate R22', 'B.Tech', ?)
                    """,
                    (doc_id,)
                )

    def test_curriculum_version_isolation(self):
        with get_db(self.test_db) as conn:
            conn.execute("INSERT INTO source_documents (source_url, title, document_type, content_hash) VALUES ('url1', 'd1', 'pdf', 'h1')")
            d1 = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            conn.execute("INSERT INTO source_documents (source_url, title, document_type, content_hash) VALUES ('url2', 'd2', 'pdf', 'h2')")
            d2 = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            # R22 vs R19 regulations coexist
            conn.execute("INSERT INTO regulations (regulation_code, regulation_name, degree, source_document_id) VALUES ('R22', 'R22 B.Tech', 'B.Tech', ?)", (d1,))
            r22 = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            conn.execute("INSERT INTO regulations (regulation_code, regulation_name, degree, source_document_id) VALUES ('R19', 'R19 B.Tech', 'B.Tech', ?)", (d2,))
            r19 = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            self.assertNotEqual(r22, r19)

if __name__ == "__main__":
    unittest.main()
