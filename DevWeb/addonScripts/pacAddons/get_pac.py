from urllib import request
from urllib.error import URLError
from .pac_parser import PACFile


def get_pac(url=None, js=None, timeout=2, allowed_content_types=None, **kwargs):
    """
    Convenience function for finding and getting a parsed PAC file (if any) that's ready to use.

    :param str url: Download PAC from a URL.
        If provided, `from_os_settings` and `from_dns` are ignored.
    :param str js: Parse the given string as a PAC file.
        If provided, `from_os_settings` and `from_dns` are ignored.
    :param timeout: Time to wait for host resolution and response for each URL.
    :param allowed_content_types: If the response has a ``Content-Type`` header,
        then consider the response to be a PAC file only if the header is one of these values.
        If not specified, the allowed types are
        ``application/x-ns-proxy-autoconfig`` and ``application/x-javascript-config``.
    :return: The first valid parsed PAC file according to the criteria, or `None` if nothing was found.
    :rtype: PACFile|None
    :raises MalformedPacError: If something that claims to be a PAC file was obtained but could not be parsed.
    """
    if url:
        downloaded_pac = download_pac([url], timeout=timeout,
                                      allowed_content_types=allowed_content_types)
        if not downloaded_pac:
            return
        return PACFile(downloaded_pac, **kwargs)
    if js:
        return PACFile(js, **kwargs)


def download_pac(candidate_urls, timeout=1, allowed_content_types=None):
    """
    Try to download a PAC file from one of the given candidate URLs.

    :param list[str] candidate_urls: URLs that are expected to return a PAC file.
        Requests are made in order, one by one.
    :param timeout: Time to wait for host resolution and response for each URL.
        When a timeout or DNS failure occurs, the next candidate URL is tried.
    :param allowed_content_types: If the response has a ``Content-Type`` header,
        then consider the response to be a PAC file only if the header is one of these values.
        If not specified, the allowed types are
        ``application/x-ns-proxy-autoconfig`` and ``application/x-javascript-config``.
    :return: Contents of the PAC file, or `None` if no URL was successful.
    :rtype: str|None
    """
    if not allowed_content_types:
        allowed_content_types = {'application/x-ns-proxy-autoconfig', 'application/x-javascript-config', 'text/html'}
    # Bypassing proxy environment variables
    proxy_support = request.ProxyHandler({})
    opener = request.build_opener(proxy_support)
    request.install_opener(opener)

    for pac_url in candidate_urls:
        try:
            resp = request.urlopen(pac_url, timeout=timeout)
            content_type = resp.headers.get('content-type', '').lower()
            if content_type and True not in [allowed_type in content_type for allowed_type in allowed_content_types]:
                raise ValueError(
                    'Could not configure pac due to content type \"{}\" from url \"{}\"'.format(content_type, pac_url))
            if resp.status == 200:
                return resp.read().decode('utf-8')
        except URLError:
            raise URLError('could not resolve pac url {}'.format(pac_url))
        except (TimeoutError, UnicodeDecodeError, ConnectionError) as err:
            raise err
