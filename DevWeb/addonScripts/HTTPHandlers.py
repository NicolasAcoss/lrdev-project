import collections
import json
import util
from mitmproxy import ctx
from mitmproxy import http

'''
Handlers functions that will handle special http requests that
send special data that will be dumped into the HAR file.
'''


def transaction_event_handler(trans_type):
    def handle_transaction(self, flow: http.HTTPFlow):
        entry = handle_get_request("Transaction", trans_type, flow)
        self.transactions.append(entry)
        return

    return handle_transaction


def action_event_handler(action_type):
    def handle_action(self, flow: http.HTTPFlow):
        entry = handle_get_request("Action", action_type, flow)
        self.actions.append(entry)
        return

    return handle_action


def step_event_handler(step_type):
    def handle_step(self, flow: http.HTTPFlow):
        entry = handle_post_request("Step", step_type, flow)
        self.steps.append(entry)
        return

    return handle_step


def log_event_handler(log_type):
    def handle_log(self, flow: http.HTTPFlow):
        entry = handle_post_request("Log", log_type, flow)
        self.logs.append(entry)
        return

    return handle_log


def handle_get_request(event, event_type, flow: http.HTTPFlow):
    if f'{flow.request.host}/?name' in flow.request.url:
        if flow.request.query.get("name") is not None:
            name = flow.request.query.get("name")
            ctx.log.debug(f'{event} {event_type} \"{name}\"')
            entry = collections.OrderedDict()
            entry['name'] = name
            entry['type'] = event_type
            entry['startedDateTime'] = \
                util.format_datetime(flow.request.timestamp_start)
            if flow.request.query.get("timestamp") is not None:
                timestamp = flow.request.query.get("timestamp")
                entry['startedDateTime'] = util.format_unix_timestamp(timestamp)
            return entry


def handle_post_request(event, event_type, flow: http.HTTPFlow):
    if flow.request.text != '':
        detect_data = util.get_content_as_string(util.get_content_safely(flow.request))
        content = json.loads(detect_data['content'])
        ctx.log.debug(f'{event} {event_type}: {detect_data["content"]}')
        entry = collections.OrderedDict()
        entry['type'] = event_type
        entry['content'] = ''
        entry['startedDateTime'] = \
            util.format_datetime(flow.request.timestamp_start)
        if 'content' in content:
            entry['content'] = content['content']
        if 'timestamp' in content:
            entry['startedDateTime'] = util.format_unix_timestamp(content['timestamp'])
        return entry
