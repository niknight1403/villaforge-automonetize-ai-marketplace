#!/usr/bin/env python3
"""Main entry point for the AI Marketplace service.

This module currently contains a minimal Flask application that
provides a health‑check endpoint. The real marketplace logic will be
implemented in subsequent phases.
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health_check():
    """Return a simple JSON response indicating the service is up."""
    return jsonify(status="ok", uptime="unknown"), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
