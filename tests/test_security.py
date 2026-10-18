import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src import main

class TestSecurityAndMain(unittest.TestCase):
    def test_environment_variables(self):
        with open('src/main.py', 'r') as f:
            content = f.read()
        self.assertNotIn('YOUR_STRIPE_API_KEY', content)
        self.assertNotIn('YOUR_PAYWALL_TOKEN', content)
        self.assertNotIn('YOUR_API_BILLING_TOKEN', content)
        
    def test_secure_implementation(self):
        os.environ['STRIPE_API_KEY'] = 'sk_test_mock'
        os.environ['PAYWALL_SECRET_TOKEN'] = 'secret123'
        os.environ['API_BILLING_TOKEN'] = 'bill123'
        
        self.assertTrue(main.verify_paywall_token('secret123'))
        self.assertFalse(main.verify_paywall_token('wrong'))

if __name__ == '__main__':
    unittest.main()
