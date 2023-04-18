import shutil
import subprocess
import tempfile
import os
import platform
import time
from os.path import expanduser
from mitmproxy import addonmanager
from mitmproxy import ctx


# most of the code is adapted from https://github.com/mitmproxy/mitmproxy/blob/master/mitmproxy/addons/browser.py
# check for changes and update as needed
browsersExecutables = {
    "chrome": {
        "Darwin": [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        ],
        "Windows": [
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Application\chrome.exe",
            r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        ],
        "Linux": [
            "google-chrome",
            "google-chrome-stable",
            "google-chrome-unstable",
        ]
    },
    "chromium": {
        "Darwin": [
            "Chromium",
            "chromium-browser",
        ],
        "Windows": [
            "chromium.exe",
            "chromium-browser.exe",
            expanduser("~") + r"\AppData\Local\Chromium\Application\chrome.exe",
            "chrome.exe",
        ],
        "Linux": [
            "chromium",
            "chromium-browser",
        ]
    },
    "safari": {
        "Darwin": [
            "/Applications/Safari.app/Contents/MacOS/Safari",
        ]
    }
}


def find_executable_location(browser_type: str):
    if browser_type in browsersExecutables:
        browser_executables = browsersExecutables[browser_type]
        if platform.system() in browser_executables:
            for browser in browser_executables[platform.system()]:
                if shutil.which(browser):
                    return browser
    return None


def build_browser_command(browser_type: str, temp_dir: tempfile.TemporaryDirectory) -> []:
    cmd = find_executable_location(browser_type)
    if not cmd:
        return []
    if browser_type in ['chrome', 'chromium']:
        return [
            cmd,
            "--user-data-dir=%s" % temp_dir.name,
            "--proxy-server=%s:%s" % (
                ctx.options.listen_host or "127.0.0.1",
                ctx.options.listen_port
            ),
            "--disable-fre",
            "--no-default-browser-check",
            "--no-first-run",
            "--disable-extensions",
            "--incognito",
            "--disable-application-cache",
            "--aggressive-cache-discard",
            "--disable-background-networking",
            "--disable-sync",
            "--metrics-recording-only",
            "about:blank",
        ]
    elif browser_type == 'firefox':
        return []
    elif browser_type == 'safari':
        return [cmd]
    return []


class BrowserLauncher:
    def __init__(self):
        self.num = 0
        self.browser = None
        self.temp_dir = None
        self.browserStarted = False

    def load(self, loader: addonmanager.Loader) -> None:
        loader.add_option(name="launch_browser_type",
                          typespec=str,
                          default="",
                          help="Launch Browser Type, supported value are [chrome, chromium]", )
        ctx.log.debug("AddOn: Launch Browser - Loaded")

    def running(self):
        """
            Called when the proxy is completely up and running. At this point,
            We launch the browser.
        """
        if self.browserStarted:
            return

        if self.browser:
            if self.browser.poll() is None:
                ctx.log.alert("Browser already running")
                return
            else:
                return
        if ctx.options.launch_browser_type == "":
            # Workaround as the first time the LaunchBrowser call to start() the option 'launch_browser_type' is empty.
            # So, we will skip the times the 'launch_browser_type' is empty.
            return

        ctx.log.debug("Selected browser to launch is: {}".format(ctx.options.launch_browser_type))
        self.temp_dir = tempfile.TemporaryDirectory()
        command_line = build_browser_command(ctx.options.launch_browser_type, self.temp_dir)
        if len(command_line) == 0:
            ctx.log.alert("Unable to locate {}".format(ctx.options.launch_browser_type))
            return

        temp_env = os.environ
        if platform.system() == "Linux" and \
                ctx.options.launch_browser_type == "chrome" and \
                "LD_LIBRARY_PATH" in temp_env:
            # Google Chrome on Linux use LD_LIBRARY_PATH if exists.
            # MITM Proxy set the LD_LIBRARY_PATH with his configuration so before we start google chrome on Linux
            # we remove it
            ctx.log.debug("Removing environment variable LD_LIBRARY_PATH")
            del temp_env["LD_LIBRARY_PATH"]

        self.browser = subprocess.Popen(
            command_line,
            env=temp_env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        self.browserStarted = True

        # Sleep is needed to check if the browser crashed and we would like to show stderr/stdout. This is not done
        # in separated thread due to issue in mitmproxy, that ctx is not working in separate thread due to the event
        # loop. Note: crashes that occurs after 1 second of execution will not show in the logger.
        time.sleep(1)
        if self.browser.poll() is not None:
            stdout, stderr = self.browser.communicate()
            if stderr != b'':
                self.browserStarted = False
                ctx.log.alert("browser failed to start, exit code: {}".format(self.browser.poll()))
                ctx.log.alert(stderr.decode("utf-8").rstrip())
                if stdout != b'':
                    ctx.log.alert(stdout.decode("utf-8").rstrip())

    def done(self):
        try:
            if self.browser:
                self.browser.kill()
                self.temp_dir.cleanup()
        except:
            pass
        self.browser = None
        self.temp_dir = None


addons = [
    BrowserLauncher()
]
