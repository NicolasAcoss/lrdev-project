import collections
import time

import util
from HarWriter import *
from mitmproxy import ctx
from mitmproxy import http
from mitmproxy import websocket

HAR = collections.OrderedDict()


class WebSocketHarDumper:
    harWriter: HarWriter
    connections: list
    messages: list
    disconnections: list
    errors: list

    def __init__(self, har_writer):
        self.errors = []
        self.harWriter = har_writer
        self.connections = []
        self.messages = []
        self.disconnections = []
        ctx.log.debug("AddOn: WebSocket Dumper - Loaded")

    # Websocket lifecycle
    def websocket_handshake(self, flow: http.HTTPFlow):
        """
            Called when a client wants to establish a WebSocket connection. The
            WebSocket-specific headers can be manipulated to alter the
            handshake. The flow object is guaranteed to have a non-None request
            attribute.
        """
        ctx.log.debug(
            "[Ws handshake]:\n "
            "flow id: [{}]\n server id: [{}]\n client id: [{}]\n request:{}\n reply: {}\n response: {} \n  \n".format(
                flow.id,
                flow.server_conn.id,
                flow.client_conn.id,
                flow.request,
                flow.reply,
                flow.response))

    def websocket_start(self, flow: websocket.WebSocketFlow):
        """
            A websocket connection has commenced.
        """
        ctx.log.debug("[Ws start]: {}".format(flow.id))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id
        entry["clientAddress"] = flow.client_conn.address
        entry["serverAddress"] = flow.server_conn.address
        entry["clientExtensions"] = flow.client_extensions
        entry["clientKey"] = flow.client_key
        entry['time'] = util.format_datetime(flow.client_conn.timestamp_start)
        entry["clientProtocol"] = flow.client_protocol
        self.connections.append(entry)

    def websocket_message(self, flow: websocket.WebSocketFlow):
        """
            Called when a WebSocket message is received from the client or
            server. The most recent message will be flow.messages[-1]. The
            message is user-modifiable. Currently there are two types of
            messages, corresponding to the BINARY and TEXT frame types.
        """
        message = flow.messages[-1]
        ctx.log.debug("[ws message] from {} to {}:\n[{}]".format("client" if message.from_client else "server",
                                                                 "server" if message.from_client else "client",
                                                                 message.content))
        ctx.log.debug("[ws message]:\n flow id: [{}]\n server id: [{}]\n client id: [{}]\n".format(
            flow.id,
            flow.server_conn.id,
            flow.client_conn.id))

        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id
        entry['source'] = util.get_message_source(message)
        detect_data = util.get_content_as_string(message.content)
        entry['content'] = detect_data['content']
        if message.type == 1:
            entry['contentType'] = "Text"
        else:
            entry['contentType'] = "Binary"
            entry["encoding"] = detect_data['detected_encoding']['encoding']
        # message.timestamp is in integer (casted from float) so, we took the time.time()
        entry['startedDateTime'] = util.format_datetime(time.time())
        self.messages.append(entry)

    def websocket_end(self, flow: websocket.WebSocketFlow):
        """
            A websocket connection has ended.
        """

        ctx.log.debug(
            "[ws connection has been disconnected] from {} to {} flow.id: {}\n server id: {}\n client id: {}\n".format(
                flow.client_conn.address,
                flow.server_conn.address,
                flow.id,
                flow.server_conn.id,
                flow.client_conn.id))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id

        if flow.error is None:
            entry["closeSender"] = flow.close_sender
            entry["closeCode"] = flow.close_code
            entry["closeReason"] = flow.close_reason
        else:
            entry["closeSender"] = "server" if "server" in flow.error.msg else "client"
            entry["closeReason"] = flow.error.msg

        entry["startedDateTime"] = util.format_datetime(flow.client_conn.timestamp_end)
        self.disconnections.append(entry)

    def websocket_error(self, flow: websocket.WebSocketFlow):
        """
            A websocket connection has ended.
        """
        ctx.log.debug("[ws connection has received an error]: {}\n".format(flow.error.msg))
        ctx.log.debug("[ws error]:\n flow id: [{}]\n server id: [{}]\n client id: [{}]\n".format(flow.id,
                                                                                                 flow.server_conn.id,
                                                                                                 flow.client_conn.id))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id
        entry["message"] = flow.error.msg
        entry["startedDateTime"] = util.format_datetime(flow.error.timestamp)
        self.errors.append(entry)

    def final(self):
        ctx.log.debug("Starting pushing websocket entries to har")
        entries = collections.OrderedDict()
        entries["connections"] = self.connections
        entries["messages"] = self.messages
        entries["disconnections"] = self.disconnections
        entries["errors"] = self.errors
        if len(self.connections) > 0:
            self.harWriter.add_entries("_webSocketEntries", entries)
