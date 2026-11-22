from flask import Flask, request, jsonify
import os

app = Flask(__name__)

# Simple in-memory store for subscriptions
subscriptions = {}

@app.route('/subscribe', methods=['POST'])
def subscribe():
    data = request.json
    user_id = data.get('user_id')
    plan = data.get('plan')
    if not user_id or not plan:
        return jsonify({'error': 'Missing user_id or plan'}), 400
    # Simulate Stripe interaction (placeholder)
    subscription_id = f'sub_{len(subscriptions)+1}'
    subscriptions[subscription_id] = {'user_id': user_id, 'plan': plan, 'status': 'active'}
    return jsonify({'subscription_id': subscription_id, 'status': 'active'}), 201

@app.route('/api/usage', methods=['POST'])
def api_usage():
    data = request.json
    subscription_id = data.get('subscription_id')
    usage = data.get('usage')
    if not subscription_id or subscription_id not in subscriptions:
        return jsonify({'error': 'Invalid subscription'}), 400
    # Dummy billing logic
    cost = usage * 0.01
    return jsonify({'subscription_id': subscription_id, 'usage': usage, 'cost': cost}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
