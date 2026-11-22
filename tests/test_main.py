#!/usr/bin/env python3
"""Unit tests for the main Flask application."""

import unittest
from main import app

class TestHealthCheck(unittest.TestCase):
    """Tests for the /health endpoint."""

    def setUp(self):
        """Set up the test client."""
        self.client = app.test_client()

    def test_health_check_returns_ok(self):
        """Test that /health returns 200 and status ok."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ok")

    def test_health_check_returns_json(self):
        """Test that /health returns JSON content type."""
        response = self.client.get("/health")
        self.assertEqual(response.content_type, "application/json")

if __name__ == "__main__":
    unittest.main()
