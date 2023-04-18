import collections
import json
import os
from collections import OrderedDict

from mitmproxy import ctx
from mitmproxy import version
from mitmproxy import addonmanager


class HarWriter:
    entry_counter: int = None
    HAR: OrderedDict = None

    def __init__(self):
        self.HAR: OrderedDict = collections.OrderedDict()
        self.HAR['log'] = collections.OrderedDict()
        self.HAR['log']['version'] = "1.3"
        self.HAR['log']['creator'] = {"name": "DevWeb Proxy Recorder",
                                      "version": "2022.2.0",
                                      "comment": "Proxy Engine (%s)" % version.MITMPROXY}
        self.HAR['log']['pages'] = []
        self.HAR['log']['entries'] = []
        self.entry_counter = 0

    def load(self, loader: addonmanager.Loader):
        loader.add_option(name="har_dump_file_path",
                          typespec=str,
                          default=os.path.join(os.getcwd(), 'tmp.har'),
                          help="HAR dump path.", )
        ctx.log.debug("AddOn: HAR File Writer - Loaded")

    def add_single_entry(self, entry: OrderedDict):
        self.HAR["log"]["entries"].append(entry)
        self.entry_counter += 1

    def add_entries(self, key: str, entries: OrderedDict):
        self.HAR['log'][key] = entries

    def add_settings(self, settings_key: str, description: OrderedDict):
        if not self.HAR['log'].__contains__("_settings"):
            self.HAR['log']['_settings'] = collections.OrderedDict()
        self.HAR['log']['_settings'][settings_key] = description

    def final(self):
        ctx.log.debug("finalizing har writer")
        self.write_file_to_disk()

    def write(self):
        ctx.log.debug("finalizing the har file")
        self.write_file_to_disk()

    def write_file_to_disk(self):
        from pathlib import Path
        target_file_path = os.path.expanduser(ctx.options.har_dump_file_path)
        with open(target_file_path, mode="w", encoding="utf8") as har_file:
            json_encoder = json.JSONEncoder(indent=2, default=str, ensure_ascii=False)
            for chunk in json_encoder.iterencode(self.HAR):
                har_file.write(chunk)
            har_file.flush()

        total = Path(target_file_path).stat().st_size

        ctx.log.debug("HAR dump finished (wrote %s bytes to file %s)" % (total, target_file_path))

    def get_har_entries_size(self):
        return len(self.HAR["log"]["entries"])

    def is_empty(self):
        return self.get_har_entries_size() == 0

    class ImpOrderedDict(OrderedDict):
        def last(self):
            k = next(reversed(self))
            return k, self[k]
