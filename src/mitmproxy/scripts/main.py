from typing import Callable, Optional
import os
import re
import logging

from mitmproxy.addons.next_layer import NextLayer
from mitmproxy import ctx, connection
from mitmproxy.net.tls import is_tls_record_magic
from mitmproxy.proxy.layers.tls import parse_client_hello
from mitmproxy.tls import ClientHello
from mitmproxy.addonmanager import Loader
from mitmproxy import ctx

def load(loader: Loader):
    domains = os.getenv("MITM_DOMAINS", "").split(",")
    regexs = [re.compile(x, re.IGNORECASE) for x in domains]
    chain = [x for x in ctx.master.addons.chain if isinstance(x, NextLayer)]

    # should only has 1 NextLayer
    if len(chain) == 1:
        layer = chain[0]

        def ignore_connection(
                server_address: Optional[connection.Address],
                data_client: bytes,
                *,
                is_tls: Callable[[bytes], bool] = is_tls_record_magic,
                client_hello: Callable[[bytes], Optional[ClientHello]] = parse_client_hello
            ) -> Optional[bool]:
                """
                Override the original function, ignoring all tls requests except for the specified domain.

                Returns:
                    True, if the connection should be ignored.
                    False, if it should not be ignored.
                    None, if we need to wait for more input data.
                """
                hostnames: list[str] = []
                
                # HTTPS go here
                if is_tls(data_client):
                    if server_address is not None:
                        hostnames.append(server_address[0])

                    try:
                        ch = client_hello(data_client)
                        
                        if ch is None:  # not complete yet
                            return None
                        
                        sni = ch.sni
                        if sni:
                            hostnames.append(sni)

                    except ValueError:
                        pass


                    should_handle = any(
                        re.search(rex, host)
                        for host in hostnames
                        for rex in regexs
                    )
                    logging.warn(f"{hostnames=} {should_handle=}")
                    return not should_handle

                # process all HTTP requests
                return False

        # override default function
        layer.ignore_connection = ignore_connection
