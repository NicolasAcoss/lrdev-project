import collections
import time
import typing

import util
from mitmproxy import tcp, ctx
from mitmproxy.utils import strutils
from mitmproxy import addonmanager

from addonScripts import HarWriter


class TcpHarDumper:
    harWriter: HarWriter = None
    connections: list
    messages: list
    disconnections: list
    errors: list

    def __init__(self, har_writer: HarWriter):
        self.errors = []
        self.harWriter = har_writer
        self.connections = []
        self.messages = []
        self.disconnections = []
        ctx.log.debug("AddOn: TCP Dumper - Loaded")

    def load(self, loader: addonmanager.Loader):
        pass

    def configure(self, updated: typing.Set[str]):
        pass

    def tcp_start(self, flow: tcp.TCPFlow):
        """
            A TCP connection has started.
        """
        ctx.log.debug(
            "[Tcp connection has been established] from {} to {}\n".format(flow.client_conn.address,
                                                                           flow.server_conn.address))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id
        entry["client_address"] = flow.client_conn.address
        entry["server_address"] = flow.server_conn.address
        self.connections.append(entry)

    def tcp_end(self, flow: tcp.TCPFlow):
        """
            A TCP connection has started.
        """
        ctx.log.debug(
            "[Tcp connection has ended] from {} to {}\n".format(flow.client_conn.address,
                                                                flow.server_conn.address))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id

        entry["startedDateTime"] = util.format_datetime(time.time())
        self.disconnections.append(entry)

    def tcp_error(self, flow: tcp.TCPFlow):
        """
            A TCP connection has started.
        """
        ctx.log.debug(
            "[Error received on TCP connection] from {} to {}\n:{}".format(flow.client_conn.address,
                                                                           flow.server_conn.address, flow.error))
        entry = collections.OrderedDict()
        entry["_serverConnectionId"] = flow.server_conn.id
        entry["message"] = flow.error.msg
        entry["startedDateTime"] = util.format_datetime(flow.error.timestamp)
        self.errors.append(entry)

    def tcp_message(self, flow: tcp.TCPFlow):
        message = flow.messages[-1]
        ctx.log.debug(
            "[tcp_message{}] from {} to {}:\n{}".format(
                " (modified)",
                "client" if message.from_client else "server",
                "server" if message.from_client else "client",
                strutils.bytes_to_escaped_str(message.content)))

        entry = collections.OrderedDict()
        entry['source'] = util.get_message_source(message)
        entry['content'] = message.content
        entry['startedDateTime'] = util.format_datetime(message.timestamp)
        self.messages.append(entry)

    def final(self):
        ctx.log.debug("Starting pushing TCP entries to har")
        entries = collections.OrderedDict()
        entries["connections"] = self.connections
        entries["messages"] = self.messages
        entries["disconnections"] = self.disconnections
        entries["errors"] = self.errors
        if len(self.connections) > 0:
            self.harWriter.add_entries("_tcpEntries", entries)
