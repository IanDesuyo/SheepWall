import os
import json
from mitmproxy.http import HTTPFlow, Response
from mitmproxy.addons.asgiapp import WSGIApp, serve
from flask import Flask, request, render_template
from pathlib import Path

file_dir = Path(__file__).absolute().parent / "portal"


class CaptivePortal(WSGIApp):
    def __init__(self):
        self.portal_domain = os.getenv("PORTAL_DOMAIN", "example.com")
        self.allow_clients = []

        self.app = Flask("CaptivePortal", template_folder=file_dir)
        self.app.add_url_rule("/", "index", self.index, methods=["GET"])
        self.app.add_url_rule("/", "allow", self.allow, methods=["POST"])

        super().__init__(self.app, self.portal_domain, 80)

    def load(self):
        try:
            with open(file_dir / "allow_clients.json", "r+") as f:
                self.allow_clients = json.load(f)
        except:
            self.allow_clients = []

    def done(self):
        try:
            with open(file_dir / "allow_clients.json", "w+") as f:
                json.dump(self.allow_clients, f)
        except:
            pass

    async def request(self, flow: HTTPFlow) -> None:
        if self.should_serve(flow):
            return await serve(self.asgi_app, flow)

        client_ip = flow.client_conn.peername[0]
        if client_ip not in self.allow_clients:
            # redirect to portal
            flow.response = Response.make(
                302,
                headers={
                    "Location": f"http://{self.portal_domain}",
                    "Cache-Control": "no-cache",
                },
            )

    def index(self):
        return render_template("index.html")

    def allow(self):
        client_ip = request.remote_addr
        self.allow_clients.append(client_ip)

        return render_template("success.html", client_ip=client_ip)


addons = [CaptivePortal()]
