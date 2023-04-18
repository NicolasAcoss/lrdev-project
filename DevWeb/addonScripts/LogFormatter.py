from types import MethodType
from datetime import datetime
from mitmproxy import ctx
from mitmproxy.addons.dumper import indent as dumper_ident


class LogFormatter:
    once = True

    def __init__(self):
        self.once = True

    def running(self):
        if self.once:
            self.once = False
            # Monkey patching to mitmproxy log - Start
            term_log_instance = ctx.master.addons.get("termlog")
            if term_log_instance is not None:
                ctx.log.debug("Enable termlog formatting")
                orig_log = term_log_instance.log

                def devweb_log(self, e):
                    current_time = datetime.now().time()
                    current_time_formatted = "[{}.{:02.0f}]".format(current_time.strftime("%H:%M:%S"),
                                                                    current_time.microsecond / 10000.0)
                    e.msg = "{} {}: {}".format(current_time_formatted, e.level.capitalize(), e.msg)
                    orig_log(e)

                term_log_instance.log = MethodType(devweb_log, term_log_instance)

            dumper_instance = ctx.master.addons.get("dumper")
            if dumper_instance is not None:
                ctx.log.debug("Enable dumper formatting")
                orig_echo = dumper_instance.echo

                def devweb_echo(self, text, ident=None, **style):
                    if ident:
                        text = dumper_ident(ident, text)
                        ident = None

                    #               The echo using styling coloring errors with red.
                    status = "Error" if style.get('fg') == "red" else "Info"
                    current_time = datetime.now().time()
                    current_time_formatted = "[{}.{:02.0f}]".format(current_time.strftime("%H:%M:%S"),
                                                                    current_time.microsecond / 10000.0)
                    text = "{} {}: {}".format(current_time_formatted, status, text)
                    try:
                        # Mitmproxy Issue https://github.com/mitmproxy/mitmproxy/issues/4070
                        orig_echo(text, ident, **style)
                    except UnicodeEncodeError as uce:
                        text = "{} {}: non printable characters detected. ignoring exception {}".\
                            format(current_time_formatted, status, uce)
                        orig_echo(text, ident, **style)

                dumper_instance.echo = MethodType(devweb_echo, dumper_instance)

            # Monkey patching to mitmproxy log - End

    def done(self):
        self.once = False


addons = [
    LogFormatter()
]
