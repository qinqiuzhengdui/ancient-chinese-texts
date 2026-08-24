import os
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer

class ResumeSaveHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/save_local_file":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                raw_path = data.get('path', '')
                content = data.get('content', '')

                if not raw_path or not content:
                    raise ValueError("Path or content is empty")

                # Decode URL encoded path (e.g., /C:/Users/... or /C:/Users/Asus/Desktop/%E9%98%AE%E6%98%9F%E6%98%8A%E7%AE%80%E5%8E%86.html)
                decoded_path = urllib.parse.unquote(raw_path)
                
                # Normalize path for Windows:
                # Remove leading slash if path starts with something like /C:/
                if os.name == 'nt' or os.sep == '\\':
                    # If it starts with /C:/ or /C:\, strip the first character
                    if decoded_path.startswith('/') or decoded_path.startswith('\\'):
                        # Check if the second character is a drive letter and third is ':'
                        if len(decoded_path) > 2 and decoded_path[2] == ':':
                            decoded_path = decoded_path[1:]
                
                # Standardize path slashes
                decoded_path = os.path.normpath(decoded_path)

                # Write to the file
                with open(decoded_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                # Send success response
                self.send_response(200)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "success", "message": f"Successfully saved to {decoded_path}"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"[SUCCESS] Saved file to: {decoded_path}")

            except Exception as e:
                self.send_response(400)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"[ERROR] Failed to save: {e}")
        else:
            self.send_response(404)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

def run(port=5001):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ResumeSaveHandler)
    print(f"Resume Helper Server running on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
