import base64
import binascii
import socket
import typing

from mitmproxy.proxy.protocol.http import HttpLayer
from mitmproxy.proxy.protocol.http import UpstreamConnectLayer
from mitmproxy import http
from mitmproxy.net.http import http1
from mitmproxy.net.http import status_codes
from mitmproxy.utils import human
from mitmproxy import ctx
from mitmproxy import addonmanager
from mitmproxy import options
from mitmproxy import log

from ntlm_auth import ntlm
from ntlm_auth import gss_channel_bindings


def is_proxy_auth_required(flow: http.HTTPFlow) -> bool:
    return flow.response.status_code == status_codes.PROXY_AUTH_REQUIRED


def get_preferred_authentication_method(flow: http.HTTPFlow):
    header_value: str = flow.response.headers["Proxy-Authenticate"]
    header_value_lower = header_value.lower()
    if 'ntlm' in header_value_lower:
        return 'NTLM'
    elif 'negotiate' in header_value_lower:
        return 'Negotiate'

    return None


def perform_ntlm_authentication(ctx_log: log, ctx_options: options, flow: http.HTTPFlow, preferred_type: str = 'NTLM'):
    body_size_limit = human.parse_size(ctx_options.body_size_limit)
    cbt_data = None
    if flow.server_conn.cert is not None:
        ctx_log('NTLM Authentication will use server certificate', "debug")
        server_certificate_hash = flow.server_conn.cert.digest("sha256")
        certificate_digest = base64.b16decode(server_certificate_hash)
        cbt_data = gss_channel_bindings.GssChannelBindingsStruct()
        cbt_data[cbt_data.APPLICATION_DATA] = b'tls-server-end-point:' + certificate_digest

    ntlm_context = DevWebNTLMContext(ctx_log, ctx_options, preferred_type, cbt_data)
    flow.request.headers["Proxy-Authorization"] = ntlm_context.get_ntlm_start_negotiate_message()
    assembled_request = http1.assemble_request(flow.request)
    flow.server_conn.wfile.write(assembled_request)
    flow.server_conn.wfile.flush()

    if not flow.server_conn.connected():
        return
    response_message = http1.read_response(
        rfile=flow.server_conn.rfile,
        request=flow.request,
        body_size_limit=body_size_limit
    )

    flow.response = response_message

    if response_message.status_code != status_codes.PROXY_AUTH_REQUIRED:
        ctx_log(
            'Proxy NTLM Authentication expected for {} and received {}'.format(
                status_codes.RESPONSES[status_codes.PROXY_AUTH_REQUIRED],
                status_codes.RESPONSES[response_message.status_code]), "alert")
        ctx_log("Proxy NTLM Authentication response headers {}".format(response_message.headers.__str__()), "debug")
        return

    ctx_log('Challenge Proxy-Authorization id:{}, server id:{}'.format(flow.id, flow.server_conn.id), "debug")
    challenge_message = response_message.headers["Proxy-Authenticate"]
    header_value = ntlm_context.get_ntlm_challenge_response_message(challenge_message)
    if header_value is False:
        ctx_log("Proxy NTLM Authentication process failed (check username and or password)", "alert")
        return
    flow.request.headers["Proxy-Authorization"] = header_value
    assembled_request = http1.assemble_request(flow.request)
    flow.server_conn.wfile.write(assembled_request)
    flow.server_conn.wfile.flush()

    response_message = http1.read_response(
        rfile=flow.server_conn.rfile,
        request=flow.request,
        body_size_limit=body_size_limit
    )
    flow.response = response_message

    if response_message.status_code != status_codes.OK and response_message.status_code != status_codes.UNAUTHORIZED:
        ctx_log(
            'Proxy NTLM Authentication expected for {} or {} and received {}'.format(
                status_codes.RESPONSES[status_codes.OK], status_codes.RESPONSES[status_codes.UNAUTHORIZED],
                status_codes.RESPONSES[response_message.status_code]), "alert")
        ctx_log("Proxy NTLM Authentication response headers {}".format(response_message.headers.__str__()), "debug")
        return


def is_ok(status):
    return status_codes.OK <= status < status_codes.MULTIPLE_CHOICE


class NTLMUpstreamAuth:
    """
        This addon handles authentication to systems upstream from us for the
        upstream proxy and reverse proxy mode. There are 3 cases:

        - Upstream proxy CONNECT requests should have authentication added, and
          subsequent already connected requests should not.
        - Upstream proxy regular requests
        - Reverse proxy regular requests (CONNECT is invalid in this mode)
    """
    # def __init__(self):

    def load(self, loader: addonmanager.Loader) -> None:
        loader.add_option(
            name="upstream_ntlm_auth",
            typespec=typing.Optional[str],
            default=None,
            help="""
            Add HTTP NTLM authentication to upstream proxy requests. 
            Format: username:password.
            """
        )
        loader.add_option(
            name="upstream_ntlm_domain",
            typespec=typing.Optional[str],
            default=None,
            help="""
            Add HTTP NTLM domain for authentication to upstream proxy requests.
            """
        )
        loader.add_option(
            name="upstream_ntlm_compatibility",
            typespec=int,
            default=3,
            help="""
            Add HTTP NTLM compatibility for authentication to upstream proxy requests.
            Valid values are 0-5 (Default: 3)
            """
        )
        ctx.log.debug("AddOn: NTLM Upstream Authentication - Loaded")

    def running(self):
        # Monkey patching - handle https
        context = ctx

        def devweb_handle_upstream_connect(self, flow: http.HTTPFlow):
            self.log(
                'NTLMUpstreamAuth - in devweb_handle_upstream_connect: {}'.format(flow.request.host),
                "debug")
            if not flow.response:
                self.establish_server_connection(
                    flow.request.host,
                    flow.request.port,
                    flow.request.scheme
                )
                self.send_request(flow.request)
                flow.response = self.read_response_headers()
                flow.response.data.content = b"".join(
                    self.read_response_body(flow.request, flow.response)
                )
            if is_proxy_auth_required(flow):
                # if not is_proxy_auth_required(flow) or flow.response.headers["Proxy-Authenticate"] is None:
                #     return False
                preferred_type = get_preferred_authentication_method(flow)
                if preferred_type is None:
                    self.log('The server does not support NTLM/Negotiate', 'alert')
                    return
                # Close current connection and establish new one
                self.disconnect()
                self.connect()
                flow.server_conn = self.server_conn
                perform_ntlm_authentication(self.log, context.options, flow, preferred_type)

                self.send_response(flow.response)
                if is_ok(flow.response.status_code) or flow.response.status_code == status_codes.UNAUTHORIZED:
                    layer = UpstreamConnectLayer(self, flow.request)
                    return layer()
                return False
            else:
                self.send_response(flow.response)
                if is_ok(flow.response.status_code):
                    layer = UpstreamConnectLayer(self, flow.request)
                    return layer()
                return False

        HttpLayer.handle_upstream_connect = devweb_handle_upstream_connect

    def response(self, flow: http.HTTPFlow):
        if not is_proxy_auth_required(flow) or flow.response.headers["Proxy-Authenticate"] is None:
            return
        preferred_type = get_preferred_authentication_method(flow)
        if preferred_type is None:
            ctx.log(
                'The server does not support NTLM/Negotiate', 'alert')
            return
        perform_ntlm_authentication(ctx.log, ctx.options, flow, preferred_type)


addons = [
    NTLMUpstreamAuth()
]


class DevWebNTLMContext:

    def __init__(self,
                 ctx_log: log,
                 ctx_options: options,
                 preferred_type: str = 'NTLM',
                 cbt_data: gss_channel_bindings.GssChannelBindingsStruct = None):
        auth: str = ctx_options.upstream_ntlm_auth
        domain: str = ctx_options.upstream_ntlm_domain
        ntlm_compatibility: int = ctx_options.upstream_ntlm_compatibility
        auth_details = auth.split(":")
        if domain is not None:
            domain = domain.upper()
        username = auth_details[0]
        password = auth_details[1]
        workstation = socket.gethostname().upper()
        ctx_log('ntlm context with the details: "{}\\{}", "{}"'.format(domain, username, password), "debug")

        self.ctx_log = ctx_log
        self.preferred_type = preferred_type
        self.ntlm_context = ntlm.NtlmContext(
            username=username,
            password=password,
            domain=domain,
            workstation=workstation,
            ntlm_compatibility=ntlm_compatibility,
            cbt_data=cbt_data)

    def get_ntlm_start_negotiate_message(self) -> str:
        negotiate_message = self.ntlm_context.step()
        negotiate_message_base_64_in_bytes = base64.b64encode(negotiate_message)
        negotiate_message_base_64_ascii = negotiate_message_base_64_in_bytes.decode("ascii")
        negotiate_message_base_64_final = u'%s %s' % (self.preferred_type, negotiate_message_base_64_ascii)
        self.ctx_log('{} Authentication, negotiate message: {}'
                     .format(self.preferred_type, negotiate_message_base_64_final), "debug")
        return negotiate_message_base_64_final

    # challenge_message come from reading header Proxy-Authenticate
    def get_ntlm_challenge_response_message(self, challenge_message: str) -> typing.Any:
        challenge_message = challenge_message.replace(self.preferred_type + " ", "", 1)
        try:
            challenge_message_ascii_bytes = base64.b64decode(challenge_message, validate=True)
        except binascii.Error as err:
            self.ctx_log('{} Authentication fail with error {}'.format(self.preferred_type, err.__str__()), "debug")
            return False
        authenticate_message = self.ntlm_context.step(challenge_message_ascii_bytes)
        negotiate_message_base_64 = u'%s %s' % (self.preferred_type,
                                                base64.b64encode(authenticate_message).decode('ascii'))
        self.ctx_log('{} Authentication, response to challenge message: {}'
                     .format(self.preferred_type, negotiate_message_base_64), "debug")
        return negotiate_message_base_64
