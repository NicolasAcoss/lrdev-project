from mitmproxy.proxy.protocol.http import HttpLayer
from mitmproxy.proxy.protocol.http import HTTPMode
from mitmproxy import http
from mitmproxy import ctx
from mitmproxy import addonmanager
import re


class UpstreamProxyManager:
    excluded_host_compiled_pattern = []

    def load(self, loader: addonmanager.Loader) -> None:
        loader.add_option(name="excluded_hosts",
                          typespec=str,
                          default="",
                          help="Upstream excluded hosts (use semi-colon for multiply hosts)", )
        ctx.log.debug("AddOn: Upstream Excluded Hosts Manager - Loaded")

    def running(self):
        # The next part will convert the *.domain.net to regexp pattern ^.*?\\.domain\\.net$
        excluded_hosts_escaped = re.escape(ctx.options.excluded_hosts)
        excluded_hosts_patterns = excluded_hosts_escaped.replace("\\*", ".*?")
        # Splitting the regexp patterns into a list
        for current_pattern in excluded_hosts_patterns.split(";"):
            # This part will make sure the pattern will fit the best
            # .*?\\.domain\\.net will become ^.*?\\.domain\\.net$
            adjusted_pattern = "^" + current_pattern + "$"
            ctx.log.debug(
                "UpstreamProxyManager - excluded host regular expression pattern {}".format(adjusted_pattern))
            self.excluded_host_compiled_pattern.append(re.compile(adjusted_pattern))

        # NTM - http.HttpLayer create http.HTTPFlow
        # NTM - flow.live is the http.HttpLayer instance (might come as Http2 or Http1)

        # Monkey patching - handle https cases
        excluded_host_compiled_pattern = self.excluded_host_compiled_pattern
        origin_handle_upstream_connect = HttpLayer.handle_upstream_connect
        origin_handle_regular_connect = HttpLayer.handle_regular_connect

        def devweb_handle_upstream_connect(self, flow: http.HTTPFlow):
            self.log(
                'UpstreamProxyManager - {} in devweb_handle_upstream_connect'.format(flow.request.host),
                "debug")
            for current_excluded_host_pattern in excluded_host_compiled_pattern:
                if current_excluded_host_pattern.match(flow.request.host):
                    self.log(
                        'UpstreamProxyManager - {} ({}) is in excluded upstream proxy'.format(
                            flow.request.host, flow.request.scheme),
                        "debug")
                    return origin_handle_regular_connect(self, flow)

            return origin_handle_upstream_connect(self, flow)

        HttpLayer.handle_upstream_connect = devweb_handle_upstream_connect

    def request(self, flow: http.HTTPFlow) -> None:
        # handle http cases
        for current_excluded_host_pattern in self.excluded_host_compiled_pattern:
            if current_excluded_host_pattern.match(flow.request.host) and flow.live.mode == HTTPMode.upstream:
                ctx.log.debug(
                    "UpstreamProxyManager - host:{} ({}) change mode to regular".format(
                        flow.request.host, flow.request.scheme))
                flow.live.mode = HTTPMode.regular


addons = [
    UpstreamProxyManager()
]
