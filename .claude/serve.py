import http.server, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress request logs

httpd = http.server.HTTPServer(('', PORT), Handler)
print(f'Serving {ROOT} on http://localhost:{PORT}', flush=True)
httpd.serve_forever()
