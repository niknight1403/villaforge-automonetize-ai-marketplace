import stripe
import paywall
import api

# Stripe API
stripe.api_key = 'YOUR_STRIPE_API_KEY'
stripe.Customer.create(source='card_123456789', email='user@example.com')

# Paywall Logik
paywall.Logik.create('YOUR_PAYWALL_TOKEN')

# API Billing
api.Billing.create('YOUR_API_BILLING_TOKEN')
