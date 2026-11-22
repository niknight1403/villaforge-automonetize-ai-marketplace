const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createSubscription(customerId, priceId) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Stripe Subscription Error:', error);
    throw error;
  }
}

module.exports = { createSubscription };