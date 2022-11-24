from mitmproxy.addonmanager import Loader
from mitmproxy.tools.web.master import WebMaster
from mitmproxy import ctx
from tornado.web import StaticFileHandler
from pathlib import Path

file_dir = Path(__file__).absolute().parent / "ui"


def load(loader: Loader):
    web_master: WebMaster = ctx.master

    # disable xsrf token
    web_master.app.settings.update({"xsrf_cookies": False})

    # add handler for static files
    web_master.app.find_handler
    web_master.app.add_handlers(
        r"^(.*)$",
        [
            (r"/hackersir/(.*)", StaticFileHandler, {"path": str(file_dir)}),
        ],
    )
