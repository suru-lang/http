# HTTPS のクライアントを確かめるための TLS の相手(CI の「HTTPS を確かめる」で動かします)
#   python3 TLS相手.py 口番   … 今のフォルダの srv.pem・srv.key で localhost:口番 に待つ
# GET はパスを添えて「こんにちは /パス」、POST は本文を添えた JSON を3行、chunked で返します。
import http.server, ssl, sys
class H(http.server.BaseHTTPRequestHandler):
    protocol_version="HTTP/1.1"
    def do_GET(self):
        b=("こんにちは "+self.path+"\n").encode()
        self.send_response(200); self.send_header("Content-Length",str(len(b))); self.end_headers(); self.wfile.write(b)
    def do_POST(self):
        n=int(self.headers.get("Content-Length",0)); body=self.rfile.read(n)
        self.send_response(200); self.send_header("Transfer-Encoding","chunked"); self.end_headers()
        for i in range(3):
            c=('{"i":%d,"echo":%s}\n'%(i,body.decode())).encode()
            self.wfile.write(b"%x\r\n%s\r\n"%(len(c),c))
        self.wfile.write(b"0\r\n\r\n")
s=http.server.ThreadingHTTPServer(("127.0.0.1",int(sys.argv[1])),H)
ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain("srv.pem","srv.key")
s.socket=ctx.wrap_socket(s.socket,server_side=True)
s.serve_forever()
