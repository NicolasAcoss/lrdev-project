import re
import sys
import base64
import chardet
from datetime import datetime
from mitmproxy import ctx
from mitmproxy.net.http import Message

# The pattern will handle the next two messages
# "'utf-X' codec can't decode byte 0xaa in position 4: invalid start byte"
# "'utf-X' codec can't decode bytes in position 313-314: invalid continuation byte"
invalid_byte_pattern = re.compile("in position (\\d+)(?:-(\\d+):|:)")

# Mostly Based on binaryornot (ver 0.4.4) 3rt party https://github.com/audreyr/binaryornot
_control_chars = b'\n\r\t\f\b'
_printable_ascii = _control_chars + bytes(range(32, 127))
_printable_high_ascii = bytes(range(127, 256))

HOSTS_TO_IGNORE = {re.compile(x, re.IGNORECASE) for x in ctx.options.ignore_hosts} if ctx.options.ignore_hosts else None

def detect_bytes(origin_data: bytes, length: int = 1024) -> dict:
    if not origin_data:
        return {'is_binary': False, 'detected_encoding': {'confidence': 1, 'encoding': 'ascii'}}

    data = origin_data[:length]
    # Now check for a high percentage of ASCII control characters
    # Binary if control chars are > 30% of the string
    low_chars = data.translate(None, _printable_ascii)
    nontext_ratio1 = float(len(low_chars)) / float(len(data))
    ctx.log.debug('nontext_ratio1: '.format(nontext_ratio1))

    high_chars = data.translate(None, _printable_high_ascii)
    nontext_ratio2 = float(len(high_chars)) / float(len(data))
    ctx.log.debug('nontext_ratio2: {}'.format(nontext_ratio2))

    is_likely_binary = (
            (nontext_ratio1 > 0.3 and nontext_ratio2 < 0.05) or
            (nontext_ratio1 > 0.8 and nontext_ratio2 > 0.8)
    )
    ctx.log.debug('is_likely_binary: {}'.format(is_likely_binary))

    # then check for binary for possible encoding detection with chardet
    detected_encoding = chardet.detect(data)
    ctx.log.debug('detected_encoding: {}'.format(detected_encoding))

    # finally use all the check to decide binary or text
    decodable_as_unicode = False
    if detected_encoding['confidence'] > 0.9 and detected_encoding['encoding'] != 'ascii':
        try:
            data.decode(encoding=detected_encoding['encoding'])
            decodable_as_unicode = True
            ctx.log.debug('success: decodable_as_unicode: {}'.format(decodable_as_unicode))
        except LookupError:
            ctx.log.debug('failure: LookupError trying to encode with {}'.format(detected_encoding['encoding']))
        except UnicodeDecodeError:
            ctx.log.debug('failure: UnicodeDecodeError trying to encode with {}'.format(detected_encoding['encoding']))

    if not decodable_as_unicode and not is_likely_binary:
        ctx.log.debug('failure: decodable_as_unicode: {}, fallback to utf8'.format(decodable_as_unicode))
        detected_encoding['encoding'] = "utf8"

    if is_likely_binary:
        if decodable_as_unicode:
            return {'is_binary': False, 'detected_encoding': detected_encoding}
        else:
            return {'is_binary': True}
    else:
        if decodable_as_unicode:
            return {'is_binary': False, 'detected_encoding': detected_encoding}
        else:
            if b'\x00' in data or b'\xff' in data:
                # Check for NULL bytes last
                ctx.log.debug('has nulls:' + repr(b'\x00' in data))
                return {'is_binary': True}
        return {'is_binary': False, 'detected_encoding': detected_encoding}


# End of binaryornot 3rt party https://github.com/audreyr/binaryornot


def convert_to_utf_x(data: bytes, detected_encoding: dict) -> str:
    """
    Will convert the bytes to text using the detected encoding
    :param data: in bytes
    :param detected_encoding: a dictionary with the keys 'confidence' and 'encoding'
    :return: string representation of bytes
    """
    ctx.log.debug("detected encoding details are {} for data: {}".format(detected_encoding, str(data)))
    if detected_encoding['confidence'] > 0.9 and detected_encoding['encoding'] == 'ascii':
        return data.decode('ascii')

    charset = detected_encoding['encoding']
    data = bytearray(data)
    while True:
        try:
            return data.decode(charset, 'strict')
        except UnicodeDecodeError as decode_error:
            decode_error_text = str(decode_error)
            locations = invalid_byte_pattern.findall(decode_error_text)
            if len(locations) > 0:
                # Filter empty string
                indexes = list(filter(lambda text: text, locations[0]))
                # Convert numbers in type string to type integer
                indexes = [int(item) for item in indexes]
                # we change data byte array so it will better to change from the end
                indexes.reverse()
                for index in indexes:
                    invalid_byte = data[index]
                    # ctx.log.debug("replacing (invalid {} byte) {}".format(charset, str(hex(invalid_byte))))
                    character_in_charset_representation = chr(invalid_byte).encode(charset)
                    data[index:index + 1] = character_in_charset_representation
                continue  # will go back to decoding

            ctx.log.error("internal error ({} decoding): {}".format(charset, decode_error_text))
            break
    return data.decode('utf8', 'backslashreplace')


def get_content_as_string(content: bytes) -> dict:
    """
    This function will return the byte as formatted/decoded string.
    If the content is binary it will decode it to base64
    If the content is text it will decode it with suitable charset
    :param content: this is the data in byte array
    :return: dictionary {'is_binary': boolean, 'content': string, 'detected_encoding': dictionary}
    """
    if type(content) is str:
        return {
            'is_binary': False,
            'detected_encoding': "utf8",
            'content': content
        }
    content_details = detect_bytes(content)
    if content_details['is_binary']:
        ctx.log.debug('Content is binary, decoding as base64')
        return {
            'is_binary': True,
            'detected_encoding': {'encoding': 'base64'},
            'content': base64.b64encode(content).decode()}
    else:
        detected_encoding = content_details['detected_encoding']
        ctx.log.debug('Content is text, detected encoding details {}'.format(detected_encoding))
        return {
            'is_binary': False,
            'detected_encoding': detected_encoding,
            'content': convert_to_utf_x(content, detected_encoding)}


def get_content_safely(message: Message) -> bytes:
    try:
        return message.get_content(strict=True)
    except ValueError as value_error:
        ctx.log.debug("Cannot decode content: {}, data will be presented as-is".format(value_error.__str__()))
        return message.raw_content


def format_datetime(date):
    """

    Args:
        date:

    Returns:

    """
    new_date_text = str(date)
    ctx.log.debug("util.format_datetime: date class type: " + str(type(date)) + " with value: " + str(date))
    try:
        if isinstance(date, int):
            # Convert date to float from int
            date = float(date)

        new_date = ''
        if isinstance(date, datetime):
            new_date = date
        elif isinstance(date, float):
            new_date = datetime.fromtimestamp(date)
        else:
            ctx.log.error(
                "Error: expiry date provided in the cookie is not in the correct format " + str(type(date)))
            pass

        new_date_text = new_date.isoformat(timespec='microseconds')
        if new_date.tzname() is None:
            new_date_text = new_date_text + 'Z'
    except Exception:
        ctx.log.error("Unexpected error " + sys.exc_info()[0])
        pass
    finally:
        return new_date_text


def format_unix_timestamp(timestamp):
    ctx.log.debug(f'format unix timestamp {str(timestamp)} of type {str(type(timestamp))}')
    new_date_text = timestamp
    try:
        timestamp = float(timestamp)/1000
        new_date = datetime.fromtimestamp(timestamp)
        new_date_text = new_date.isoformat(timespec='microseconds')
        if new_date.tzname() is None:
            new_date_text = new_date_text + 'Z'
    except Exception:
        ctx.log.warning(f'could not format unix timestamp {timestamp}')
        pass
    finally:
        return new_date_text



def get_message_source(message) -> str:
    if message.from_client:
        return "client"
    else:
        return "server"


# DevWeb R&D Comment:
# This part created to handle issue in urlib parse query string documented in https://bugs.python.org/issue20116
# Start of part Based on https://github.com/python/cpython/blob/master/Lib/urllib/parse.py


_dev_web_implicit_encoding = 'ascii'

_dev_web_implicit_errors = 'strict'


def _dev_web_noop(obj):
    return obj


def _dev_web_encode_result(obj, encoding=_dev_web_implicit_encoding,
                           errors=_dev_web_implicit_errors):
    return obj.encode(encoding, errors)


def _dev_web_decode_args(args, encoding=_dev_web_implicit_encoding,
                         errors=_dev_web_implicit_errors):
    return tuple(x.decode(encoding, errors) if x else '' for x in args)


def _dev_web_coerce_args(*args):
    # Invokes decode if necessary to create str args
    # and returns the coerced inputs along with
    # an appropriate result coercion function
    #   - noop for str inputs
    #   - encoding function otherwise
    str_input = isinstance(args[0], str)
    for arg in args[1:]:
        # We special-case the empty string to support the
        # "scheme=''" default argument to some functions
        if arg and isinstance(arg, str) != str_input:
            raise TypeError("Cannot mix str and non-str arguments")
    if str_input:
        return args + (_dev_web_noop,)
    return _dev_web_decode_args(args) + (_dev_web_encode_result,)


# LR R&D Comment:
# This function created to handle issue in urlib parse_qsl documented in https://bugs.python.org/issue20116
def dev_web_parse_qsl(qs, keep_blank_values=False, strict_parsing=False,
                      encoding='utf-8', errors='replace', max_num_fields=None):
    """Parse a query given as a string argument.
        Arguments:
        qs: percent-encoded query string to be parsed
        keep_blank_values: flag indicating whether blank values in
            percent-encoded queries should be treated as blank strings.
            A true value indicates that blanks should be retained as blank
            strings.  The default false value indicates that blank values
            are to be ignored and treated as if they were  not included.
        strict_parsing: flag indicating what to do with parsing errors. If
            false (the default), errors are silently ignored. If true,
            errors raise a ValueError exception.
        encoding and errors: specify how to decode percent-encoded sequences
            into Unicode characters, as accepted by the bytes.decode() method.
        max_num_fields: int. If set, then throws a ValueError
            if there are more than n fields read by parse_qsl().
        Returns a list, as G-d intended.
    """
    qs, _coerce_result = _dev_web_coerce_args(qs)

    # If max_num_fields is defined then check that the number of fields
    # is less than max_num_fields. This prevents a memory exhaustion DOS
    # attack via post bodies with many fields.
    if max_num_fields is not None:
        num_fields = 1 + qs.count('&')
        if max_num_fields < num_fields:
            raise ValueError('Max number of fields exceeded')

    delimiter = '&'
    if ';' in qs:
        delimiter = ';'

    pairs = qs.split(delimiter)
    r = []
    for name_value in pairs:
        if not name_value and not strict_parsing:
            continue
        nv = name_value.split('=', 1)
        if len(nv) != 2:
            if strict_parsing:
                raise ValueError("bad query field: %r" % (name_value,))
            # Handle case of a control-name with no equal sign
            if keep_blank_values:
                nv.append('')
            else:
                continue
        if len(nv[1]) or keep_blank_values:
            name = nv[0]
            name = _coerce_result(name)
            value = nv[1]
            value = _coerce_result(value)
            r.append((name, value))
    return r

# End of part Based on https://github.com/python/cpython/blob/master/Lib/urllib/parse.py


def is_ignore_hosts(host) -> bool:
    """ this function checking for matches between hosts and ignore_hosts list """
    if not HOSTS_TO_IGNORE: # HOSTS_TO_IGNORE is None
        return False
    for rex in HOSTS_TO_IGNORE:
        if rex.match(host):
            return True
    return False
