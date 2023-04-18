"""
This inline script can be used to dump flows as HAR files.
"""
import urllib.parse
import HTTPHandlers
import util
from HarWriter import *
from mitmproxy import addonmanager
from mitmproxy import ctx
from mitmproxy import http
from mitmproxy.net.http import cookies


def name_value(obj):
    """
        Convert (key, value) pairs to HAR format.
    """
    return [{"name": k, "value": v} for k, v in obj.items()]


def format_response_cookies(fields):
    """

    Args:
        fields:

    Returns:

    """
    return format_cookies((c[0], c[1][0], c[1][1]) for c in fields)


def format_request_cookies(fields):
    """

    Args:
        fields:

    Returns:

    """
    return format_cookies(cookies.group_cookies(fields))


def format_cookies(cookie_list):
    """

    Args:
        cookie_list:

    Returns:

    """
    rv = []

    for name, value, attrs in cookie_list:
        cookie_har = {"name": name, "value": value, }

        # HAR only needs some attributes
        for key in ["path", "domain", "comment"]:
            if key in attrs:
                cookie_har[key] = attrs[key]

        # These keys need to be boolean!
        for key in ["httpOnly", "secure"]:
            cookie_har[key] = bool(key in attrs)

        # Expiration time needs to be formatted
        expire_ts = cookies.get_expiration_ts(attrs)
        if expire_ts is not None:
            cookie_har["expires"] = util.format_datetime(expire_ts)

        rv.append(cookie_har)

    return rv


class HttpHarDumper:
    har_writer: HarWriter = None
    transactions: list = None

    #   Kobi Gana:
    #   This function override is to handle issue appear in urllib parse query string
    #   see https://bugs.python.org/issue20116 for more details
    urllib.parse.parse_qsl = util.dev_web_parse_qsl

    def __init__(self, har_writer: HarWriter):
        self.har_writer = har_writer
        self.SERVERS_SEEN = set()
        self.transactions_counter = 0
        self.transactions = []
        self.actions = []
        self.steps = []
        self.logs = []
        self.handlers = {}

    def load(self, loader: addonmanager.Loader):
        ctx.log.debug("AddOn: HTTP/S Dumper - Loaded")
        # Registering the special HTTP handlers to the corresponding host.
        self.handlers["transaction.start"] = HTTPHandlers.transaction_event_handler("start")
        self.handlers["transaction.end"] = HTTPHandlers.transaction_event_handler("stop")
        self.handlers["action.start"] = HTTPHandlers.action_event_handler("start")
        self.handlers["action.end"] = HTTPHandlers.action_event_handler("end")
        self.handlers["step.description"] = HTTPHandlers.step_event_handler("description")
        self.handlers["step.comment"] = HTTPHandlers.step_event_handler("comment")
        self.handlers["log.info"] = HTTPHandlers.log_event_handler("info")
        self.handlers["log.debug"] = HTTPHandlers.log_event_handler("debug")
        self.handlers["log.warning"] = HTTPHandlers.log_event_handler("warning")
        self.handlers["log.error"] = HTTPHandlers.log_event_handler("error")

    def request(self, flow: http.HTTPFlow):
        """
           Called when a server response has been received.
        """
        if util.is_ignore_hosts(flow.request.host):
            # if hosts is exist and matches one of the ignore_hosts list values,
            # we want to return without writing him in the HAR file.
            return

        url = flow.request.url
        ctx.log.debug("Request {} '{}'".format(flow.request.method, url))

        if flow.request.host in self.handlers:
            self.handlers[flow.request.host](self, flow)

    def response(self, flow: http.HTTPFlow):
        """
           Called when a server response has been received.
        """
        if util.is_ignore_hosts(flow.request.host):
            # if hosts is exist and matches one of the ignore_hosts list values,
            # we want to return without writing him in the HAR file.
            return

        if flow.request.host in self.handlers:
            return

        if flow.server_conn and flow.server_conn.address:
            entry = self.parse_response(flow)
            self.har_writer.add_single_entry(entry)

    def parse_response(self, flow: http.HTTPFlow):
        # -1 indicates that these values do not apply to current request
        ssl_time = -1
        connect_time = -1

        if flow.server_conn and flow.server_conn not in self.SERVERS_SEEN:
            connect_time = (flow.server_conn.timestamp_tcp_setup - flow.server_conn.timestamp_start)

            if flow.server_conn.timestamp_tls_setup is not None:
                ssl_time = (flow.server_conn.timestamp_tls_setup - flow.server_conn.timestamp_tcp_setup)

                self.SERVERS_SEEN.add(flow.server_conn)
        timings_raw = {'send': flow.request.timestamp_end - flow.request.timestamp_start,
                       'receive': flow.response.timestamp_end - flow.response.timestamp_start,
                       'wait': flow.response.timestamp_start - flow.request.timestamp_end, 'connect': connect_time,
                       'ssl': ssl_time, }
        timings = dict([(k, int(1000 * v)) for k, v in timings_raw.items()])
        full_time = sum(v for v in timings.values() if v > -1)
        started_date_time = util.format_datetime(flow.request.timestamp_start)
        # Response body size and encoding
        response_body_size = len(flow.response.raw_content)
        response_body_decoded_size = len(flow.response.content)
        response_body_compression = response_body_decoded_size - response_body_size
        entry = collections.OrderedDict()
        entry["startedDateTime"] = started_date_time
        entry["time"] = full_time
        entry["_serverConnectionId"] = flow.server_conn.id
        entry["request"] = collections.OrderedDict()
        entry["request"]["method"] = flow.request.method
        entry["request"]["url"] = flow.request.url
        entry["request"]["httpVersion"] = flow.request.http_version
        if isinstance(flow.request.headers, list):
            entry["request"]["headers"] = flow.request.headers
        else:
            entry['request']['headers'] = name_value(flow.request.headers)

        entry["request"]["queryString"] = name_value(flow.request.query or {})
        entry["request"]["cookies"] = format_request_cookies(flow.request.cookies.fields)
        entry["request"]["headersSize"] = len(str(flow.request.headers))
        entry["request"]["bodySize"] = len(flow.request.get_content(strict=False))

        entry["response"] = collections.OrderedDict()
        entry["response"]["status"] = flow.response.status_code
        entry["response"]["statusText"] = flow.response.reason
        entry["response"]["httpVersion"] = flow.response.http_version
        entry["response"]["headers"] = name_value(flow.response.headers)
        entry["response"]["cookies"] = format_response_cookies(flow.response.cookies.fields)

        content_object = collections.OrderedDict()
        content_object["size"] = response_body_size
        content_object["mimeType"] = \
            flow.response.headers.get('Content-Type',
                                      flow.response.headers.get('Content-type',
                                                                flow.response.headers.get('content-type', None)))
        content_object["compression"] = response_body_compression
        entry["response"]["redirectURL"] = \
            flow.response.headers.get('Location', flow.response.headers.get('location', ''))
        entry["response"]["headersSize"] = len(str(flow.response.headers))
        entry["response"]["bodySize"] = response_body_size

        entry["cache"] = {}
        entry["timings"] = timings

        # Store binary data as base64
        detect_data = util.get_content_as_string(util.get_content_safely(flow.response))
        content_object["text"] = detect_data['content']
        if detect_data['is_binary']:
            content_object["encoding"] = detect_data['detected_encoding']['encoding']
        entry["response"]["content"] = content_object

        if flow.request.method in ["POST", "PUT", "PATCH"]:
            params = [{"name": a, "value": b} for a, b in flow.request.urlencoded_form.items(multi=True)]
            detect_data = util.get_content_as_string(util.get_content_safely(flow.request))
            entry["request"]["postData"] = {
                "mimeType": flow.request.headers.get("Content-Type", ""),
                "text": detect_data['content'],
                "params": params
            }
            if detect_data['is_binary']:
                entry["request"]["postData"]["encoding"] = detect_data['detected_encoding']['encoding']

        if flow.server_conn.connected():
            entry["serverIPAddress"] = str(flow.server_conn.ip_address[0])

        return entry

    # Gets the proxy configurations from mitmproxy's ctx.options
    # Writes these settings to the HAR file if they exist.
    def parse_proxy_settings(self):
        proxy_settings = collections.OrderedDict()
        is_pac_configured = self.parse_pac_address(proxy_settings)
        if not is_pac_configured:
            self.parse_upstream_proxy(proxy_settings)

    # returns boolean so we can check whether pac was configured, and if so
    # we will not copy the proxy settings.
    def parse_pac_address(self, proxy_settings):
        if ctx.options.__contains__("pac_address"):
            pac_address = ctx.options.pac_address
            proxy_settings["pacAddress"] = pac_address
            self.har_writer.add_settings("_proxy", proxy_settings)
            return True
        return False

    def parse_upstream_proxy(self, proxy_settings):
        proxy_server = ctx.options.mode.split(':', 1)
        if len(proxy_server) == 2:
            proxy_settings["proxyServer"] = proxy_server[1]
            proxy_settings["excludedHosts"] = ""
            if ctx.options.__contains__("excluded_hosts"):
                proxy_settings["excludedHosts"] = ctx.options.excluded_hosts
            self.parse_upstream_authentication(proxy_settings)
            self.har_writer.add_settings("_proxy", proxy_settings)

    def parse_upstream_authentication(self, proxy_settings):
        if ctx.options.__contains__("upstream_ntlm_auth"):
            proxy_settings["proxyAuthenticationType"] = "ntlm"
            if ctx.options.__contains__("upstream_ntlm_domain"):
                proxy_settings["proxyDomain"] = ctx.options.upstream_ntlm_domain
        elif ctx.options.upstream_auth is not None:
            proxy_settings["proxyAuthenticationType"] = "basic"

    def final(self):
        self.parse_proxy_settings()
        if len(self.transactions) > 0:
            self.har_writer.add_entries("_transactions", self.transactions)
        if len(self.actions) > 0:
            self.har_writer.add_entries("_actions", self.actions)
        if len(self.steps) > 0:
            self.har_writer.add_entries("_steps", self.steps)
        if len(self.logs) > 0:
            self.har_writer.add_entries("_logs", self.logs)
        ctx.log.debug("Finished creating HTTP / HTTPS / HTTP/2 har report")


class ImpOrderedDict(collections.OrderedDict):
    def last(self):
        k = next(reversed(self))
        return k, self[k]
