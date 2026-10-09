import ipaddress
import socket
import hmac
from urllib.parse import urlparse
from app.config import ALLOWED_DOMAINS, PIPELINE_ADMIN_KEY

def is_private_ip(ip_str: str) -> bool:
    """Check if an IP address belongs to a private, loopback, or reserved range."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        )
    except ValueError:
        return True

def validate_url_security(url: str) -> tuple[bool, str]:
    """
    Validate that a URL is safe to fetch:
    1. Only https or http schemes allowed.
    2. Hostname must belong to ALLOWED_DOMAINS allowlist.
    3. Hostname cannot resolve to loopback/private/internal IP (SSRF mitigation).
    """
    if not url or not isinstance(url, str):
        return False, "URL is empty or not a string"

    try:
        parsed = urlparse(url.strip())
    except Exception as e:
        return False, f"Malformed URL: {e}"

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Disallowed scheme: '{parsed.scheme}'. Only http and https permitted."

    hostname = (parsed.hostname or "").lower()
    if not hostname:
        return False, "No hostname found in URL"

    # Check allowlist
    domain_allowed = any(
        hostname == allowed or hostname.endswith("." + allowed)
        for allowed in ALLOWED_DOMAINS
    )
    if not domain_allowed:
        return False, f"Hostname '{hostname}' is not in the approved domain allowlist"

    # Check DNS resolution for SSRF
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for entry in addr_info:
            ip_candidate = entry[4][0]
            if is_private_ip(ip_candidate):
                return False, f"Domain '{hostname}' resolves to private or loopback IP ({ip_candidate})"
    except socket.gaierror as e:
        return False, f"DNS resolution failed for '{hostname}': {e}"
    except Exception as e:
        return False, f"Security check error during DNS resolution: {e}"

    return True, "URL is verified and safe"

def verify_admin_token(token: str) -> bool:
    """Timing-safe verification of administrator key."""
    if not token or not PIPELINE_ADMIN_KEY:
        return False
    return hmac.compare_digest(token.strip(), PIPELINE_ADMIN_KEY.strip())
