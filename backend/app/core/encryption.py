import json
from cryptography.fernet import Fernet
from app.core.config import settings

_fernet = None

def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = settings.ENCRYPTION_KEY
        import hashlib
        import base64
        # Fernet keys must be 32 url-safe base64-encoded bytes.
        # We can hash any key to 32 bytes and base64 encode it.
        hashed = hashlib.sha256(key.encode()).digest()
        fernet_key = base64.urlsafe_b64encode(hashed)
        _fernet = Fernet(fernet_key)
    return _fernet

def encrypt_data(data: dict) -> dict:
    """Encrypt all values in the dict to strings representing ciphertext."""
    if not data:
        return {}
    fernet = get_fernet()
    encrypted_dict = {}
    for k, v in data.items():
        # Serialize the value to JSON to preserve type
        serialized = json.dumps(v)
        encrypted_val = fernet.encrypt(serialized.encode()).decode()
        encrypted_dict[k] = encrypted_val
    return encrypted_dict

def decrypt_data(data: dict) -> dict:
    """Decrypt all values in the dict from ciphertext back to original values."""
    if not data:
        return {}
    fernet = get_fernet()
    decrypted_dict = {}
    for k, v in data.items():
        try:
            # v should be a string representing ciphertext
            if isinstance(v, str):
                decrypted_bytes = fernet.decrypt(v.encode())
                decrypted_val = json.loads(decrypted_bytes.decode())
                decrypted_dict[k] = decrypted_val
            else:
                decrypted_dict[k] = v
        except Exception:
            # In case decryption fails (e.g. data was not encrypted, or key mismatch)
            # return as-is to prevent crash and ensure robustness
            decrypted_dict[k] = v
    return decrypted_dict
