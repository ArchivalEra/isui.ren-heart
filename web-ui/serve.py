#!/usr/bin/env python3
"""serve.py — 本地预览服务器（正确处理 .wasm MIME，无缓存）
用法: python3 serve.py [端口，默认 8080]   （在 web-ui/ 下运行，服务 dist/——vite build 产物）
"""
import http.server
import mimetypes
import os
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

    # SPA fallback：/admin 等无对应文件的路径 → 回退 index.html（本地预览 /admin#heart 可访问）。
    # 注意：SimpleHTTPRequestHandler 内部对缺文件直接 send_error(404)（不向上抛异常）——
    # 须在请求前用 translate_path 判断命中，而非捕获异常
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.isdir(path) and not os.path.isfile(path):
            self.path = '/index.html'
        super().do_GET()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
with socketserver.TCPServer(('', port), Handler) as httpd:
    print(f'预览: http://localhost:{port}/')
    httpd.serve_forever()
