import re
import typing

from mitmproxy import addonmanager
from mitmproxy import ctx
from mitmproxy import http
from mitmproxy.utils import human
from mitmproxy.proxy.protocol.http import HTTPMode
from pacAddons import get_pac
from pacAddons import pac_parser


class UpstreamPacManager:
    pac = None
    hosts_visited = {}

    def load(self, loader: addonmanager.Loader) -> None:
        loader.add_option(name="pac_address",
                          typespec=str,
                          default="",
                          help="PAC Address (use a valid url)", )
        ctx.log.debug("AddOn: Upstream Pac Manager - Loaded")

    def running(self):
        pac_address = ctx.options.pac_address
        try:
            self.pac = get_pac.get_pac(pac_address)
        except Exception as error:
            # error.args[0] is the error message
            ctx.log.alert('Upstream PAC Manager failed to configure pac with error: {}'.format(error.args[0]))
            pass

    def requestheaders(self, flow: http.HTTPFlow):
        if self.pac is None:
            return
        address = self.proxy_address(flow)
        if address[0] == 'Continue':  # No flow Host, resuming flow as before
            return
        ctx.log.debug('[UpstreamPacManager] request_headers from {} to {}'.format(human.format_address(flow.client_conn.ip_address), flow.server_conn.address))
        if self.handle_direct_proxy(flow, address, 'request_headers'):  # DIRECT proxy
            return
        self.setUpstreamProxyIfNeedded(address, 'request_headers event')
        self.handle_upstream_proxy(flow, address, 'request_headers event')

    def http_connect(self, flow: http.HTTPFlow):
        if self.pac is None:
            return
        address = self.proxy_address(flow)
        ctx.log.debug('[UpstreamPacManager] http_connect from {} to {}'.format(human.format_address(flow.client_conn.ip_address), flow.server_conn.address))
        if self.handle_direct_proxy(flow, address, 'http_connect'):
            return
        self.setUpstreamProxyIfNeedded(address, 'http_connect event')
        self.handle_upstream_proxy(flow, address, 'http_connect event')

    def proxy_address(self, flow: http.HTTPFlow) -> typing.Tuple[str, int]:
        if flow.request.host is None:
            ctx.log.debug(
                '[UpstreamPacManager] no available host for current flow {}, resuming flow'.format(flow.client_conn))
            return 'Continue', 1
        if self.hosts_visited.__contains__(flow.request.host):
            ctx.log.debug(
                '[UpstreamPacManager] cached proxy "{}" for url "{}".'.format(self.hosts_visited[flow.request.host],
                                                                              flow.request.url))
            return self.hosts_visited[flow.request.host]
        proxies_string = self.pac.find_proxy_for_url(flow.request.url, flow.request.host)
        ctx.log.debug('[UpstreamPacManager] Auto-proxy configuration selected "{}" for url "{}".'.format(proxies_string,
                                                                                                         flow.request.url))
        parsed_proxies = pac_parser.parse_pac_value(proxies_string)
        proxy_elements = re.split('://|:', parsed_proxies[0])
        if len(proxy_elements) == 1:  # DIRECT proxy
            self.hosts_visited[flow.request.host] = (proxy_elements[0], 0)
            return proxy_elements[0], 0
        self.hosts_visited[flow.request.host] = (proxy_elements[1], int(proxy_elements[2]))
        return proxy_elements[1], int(proxy_elements[2])

    def handle_direct_proxy(self, flow: http.HTTPFlow, address: typing.Tuple[str, int], event):
        ctx.log.debug(
            '[UpstreamPacManager] handle direct proxy: current flow mode is {} and options mode is {}. event is {}'.format(
                flow.live.mode, ctx.options.mode, event))
        if address[1] == 0:  # DIRECT proxy
            if flow.live.mode == HTTPMode.upstream:
                flow.live.mode = HTTPMode.regular
                flow.mode = HTTPMode.regular
            return True

    def handle_upstream_proxy(self, flow: http.HTTPFlow, address: typing.Tuple[str, int], event):
        ctx.log.debug(
            '[UpstreamPacManager] handle upstream proxy: current flow mode is {} and upstream is {}. event is {}'.format(
                flow.live.mode, ctx.options.mode, event))
        if flow.live.mode == HTTPMode.regular or (
                flow.live.mode == HTTPMode.upstream and self.hosts_visited[flow.request.host] is not address):
            flow.mode = HTTPMode.upstream
            flow.live.mode = HTTPMode.upstream
            flow.live.change_upstream_proxy_server(address)
            ctx.log.debug('[UpstreamPacManager] changed upstream proxy to: {}:{}'.format(address[0], address[1]))

    def setUpstreamProxyIfNeedded(self, address, event):
        if not ctx.options.mode.__contains__('upstream'):
            # mode exists in the options, we just have to reset it.
            ctx.master.options.__setattr__("mode", "upstream:" + address[0] + ":" + str(address[1]))
            ctx.log.debug('[UpstreamPacManager] set upstream proxy if needded: {}, event: {}'.format(address, event))


addons = [
    UpstreamPacManager()
]
