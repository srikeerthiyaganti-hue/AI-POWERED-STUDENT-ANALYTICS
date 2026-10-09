import unittest
from app.security import validate_url_security, verify_admin_token, is_private_ip

class TestSecurity(unittest.TestCase):
    def test_allowed_domains(self):
        valid_urls = [
            "https://www.vignan.ac.in/r22/syllabus.pdf",
            "https://vignan.ac.in/2023pdf/regulations.pdf",
            "https://erp.vignan.ac.in/student/",
            "https://omega-hnqg.onrender.com/api/subjects",
            "https://omega-nine-tau.vercel.app/"
        ]
        for url in valid_urls:
            is_safe, msg = validate_url_security(url)
            self.assertTrue(is_safe, f"Expected safe for {url}, got: {msg}")

    def test_disallowed_domains(self):
        invalid_urls = [
            "https://evil-attacker.com/malicious.pdf",
            "https://phishing-vignan.tk/login",
            "ftp://vignan.ac.in/file.pdf",
            "javascript:alert(1)"
        ]
        for url in invalid_urls:
            is_safe, msg = validate_url_security(url)
            self.assertFalse(is_safe, f"Expected unsafe for {url}")

    def test_ssrf_private_ips(self):
        self.assertTrue(is_private_ip("127.0.0.1"))
        self.assertTrue(is_private_ip("10.0.0.1"))
        self.assertTrue(is_private_ip("192.168.1.100"))
        self.assertTrue(is_private_ip("172.16.0.1"))
        self.assertTrue(is_private_ip("169.254.169.254"))
        self.assertFalse(is_private_ip("8.8.8.8"))

    def test_admin_token_verification(self):
        from app.config import PIPELINE_ADMIN_KEY
        self.assertTrue(verify_admin_token(PIPELINE_ADMIN_KEY))
        self.assertFalse(verify_admin_token("wrong-secret-token"))
        self.assertFalse(verify_admin_token(""))

if __name__ == "__main__":
    unittest.main()
