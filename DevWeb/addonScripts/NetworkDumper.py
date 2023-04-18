from mitmproxy import ctx
from mitmproxy import http
from mitmproxy import addonmanager
from mitmproxy.exceptions import TcpException


class NetworkDumper:
    ScriptAddons = []
    started = False

    def __init__(self) -> None:
        super().__init__()
        self.counter = 0

    def load(self, entry: addonmanager.Loader):
        # Monkey Patch handle edge case that mitmproxy crash on Reset TCP Connection by client
        # Follow issue on MitmProxy GitHub: https://github.com/mitmproxy/mitmproxy/issues/3943
        from mitmproxy.proxy.protocol.http import HttpLayer
        orig_handle_upstream_connect = HttpLayer.handle_upstream_connect

        def devweb_handle_upstream_connect(self, flow: http.HTTPFlow):
            try:
                return orig_handle_upstream_connect(self, flow)
            except TcpException as tcp_exception:
                tcp_exception_text = str(tcp_exception)
                if 'An existing connection was forcibly closed by the remote host' not in tcp_exception_text:
                    raise tcp_exception
                self.log(
                    'NetworkDumper - ignore exception {}'.format(tcp_exception),
                    "debug")
                pass
            return False

        HttpLayer.handle_upstream_connect = devweb_handle_upstream_connect
        # Monkey Patch - End (https://github.com/mitmproxy/mitmproxy/issues/3943)

        # Monkey Patch - Start
        # Sometimes at the very end of recording the ask function return None.
        # We're catching it raising Kill exception. this will be handled correctly by caller
        # Might related to issue https://github.com/mitmproxy/mitmproxy/issues/3572
        from mitmproxy.controller import Channel
        from mitmproxy import exceptions
        orig_ask = Channel.ask

        def devweb_ask(self, mtype, m):
            return_value = orig_ask(self, mtype, m)
            if return_value is None:
                raise exceptions.Kill()
            return return_value

        Channel.ask = devweb_ask
        # Monkey Patch - End (https://github.com/mitmproxy/mitmproxy/issues/3572)

        ctx.log.debug("AddOn: Network Dumper - Loaded")

    def request(self, flow: http.HTTPFlow):
        # since special requests are sent as dummy urls, we intercept them
        # and set the status code to 200 with an event message to prevent log file errors.
        url = flow.request.url
        if "shutdown.devweb" in url:
            ctx.log.debug("Closing proxy")
            flow.response = http.HTTPResponse.make(
                200,  # Status OK
                b"ShutDown Event",  # (optional) content
                {"Content-Type": "text/html"}  # (optional) headers
            )
            # Start of workaround. issue [3572] (https://github.com/mitmproxy/mitmproxy/issues/3572)
            ctx.master.addons.trigger("done")
            # End of workaround. issue [3572] (https://github.com/mitmproxy/mitmproxy/issues/3572)
            ctx.master.shutdown()
        if 'transaction.start' in url or 'transaction.end' in url:
            flow.response = http.HTTPResponse.make(
                200,  # Status OK
                f"Transaction Event: {flow.request.host}",
                {"Content-Type": "text/html"}
            )
            return
        if 'action.start' in url or 'action.end' in url:
            flow.response = http.HTTPResponse.make(
                200,  # Status OK
                f"Action Event: {flow.request.host}",
                {"Content-Type": "text/html"}
            )
            return
        if 'step.description' in url or 'step.comment' in url:
            flow.response = http.HTTPResponse.make(
                200,  # Status OK
                f"Step Event: {flow.request.host}",
                {"Content-Type": "text/html"}
            )
            return
        if 'log.info' in url or 'log.debug' in url or 'log.warning' in url or 'log.error' in url:
            flow.response = http.HTTPResponse.make(
                200,  # Status OK
                f"Log Event: {flow.request.host}",
                {"Content-Type": "text/html"}
            )
            return

    #  TODO: maybe load dumpers per flag in options
    def running(self):
        if self.started is False:
            self.started = True
            ctx.log.info("Press any key to stop the recording")
        # TODO: Due to issue in mitmproxy 3.0.4 that calls this event twice - remove once resolved

    def init_addons(self):
        from WebSocketHarDumper import WebSocketHarDumper
        from HttpHarDumper import HttpHarDumper
        from HarWriter import HarWriter

        writer = HarWriter()
        web_socket_har_dumper = WebSocketHarDumper(writer)
        http_har_dumper = HttpHarDumper(writer)
        self.ScriptAddons = [web_socket_har_dumper, http_har_dumper, writer]

    def done(self):
        if self.counter > 0:
            return
        self.counter += 1
        for i in self.ScriptAddons:
            if hasattr(i, "final"):
                i.final()


networkDumper = NetworkDumper()
networkDumper.init_addons()
addons = networkDumper.ScriptAddons
addons += [networkDumper]
