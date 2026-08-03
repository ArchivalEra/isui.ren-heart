#!/usr/bin/env python3
"""serve.py — 本地预览服务器（正确处理 .wasm MIME，无缓存）
用法: python3 serve.py [端口，默认 8080]   （在 web-rust/ 下运行，服务 dist/）
"""
import http.server
import mimetypes
import socketserver
import sys

mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('application/javascript', '.js')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='dist', **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # SPA fallback：未命中路径回退 index.html（/heart、/home 等路由）
    def do_GET(self):
        try:
            super().do_GET()
        except FileNotFoundError:
            self.path = '/index.html'
            super().do_GET()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
with socketserver.TCPServer(('', port), Handler) as httpd:
    print(f'预览: http://localhost:{port}/')
    httpd.serve_forever()
