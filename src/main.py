import os
import os

def create_customer(email: str, payment_method: str):
    api_key = os.environ.get('STRIPE_API_KEY', '')
    if not api_key:
        raise ValueError("STRIPE_API_KEY environment variable is not set")
    return {"status": "mock_customer_created", "email": email}

def verify_paywall_token(token: str) -> bool:
    expected = os.environ.get('PAYWALL_SECRET_TOKEN', '')
    if not expected:
        raise ValueError("PAYWALL_SECRET_TOKEN environment variable is not set")
    return token == expected

def process_api_billing(token: str, amount: int):
    expected = os.environ.get('API_BILLING_TOKEN', '')
    if not expected:
        raise ValueError("API_BILLING_TOKEN environment variable is not set")
    if token != expected:
        raise PermissionError("Invalid API billing token")
    return {"status": "success", "billed_amount": amount}
