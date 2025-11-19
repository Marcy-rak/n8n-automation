#!/usr/bin/env python3
"""
Simple HTTP server for testing the Gift Advisor frontend locally.

Usage:
    python3 serve.py [port]

Default port is 8000.

Example:
    python3 serve.py 3000
"""

import http.server
import socketserver
import sys
import os

# Get port from command line argument or use default
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

# Enable CORS for development
class CORSRequestHandler(Handler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Custom logging format
        print(f"[{self.log_date_time_string()}] {format%args}")

with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    print("=" * 60)
    print("  🎁 Gift Advisor Frontend Server")
    print("=" * 60)
    print(f"\n  Server running at: http://localhost:{PORT}")
    print(f"  Open in browser:   http://localhost:{PORT}/index.html")
    print(f"\n  Press Ctrl+C to stop the server\n")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
        sys.exit(0)
