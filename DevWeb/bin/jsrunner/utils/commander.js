
class Option {
  constructor(flags, description) {
    this.flags = flags;
    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
    this.optional = flags.includes('['); // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
    const optionFlags = _parseOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.description = description || '';
  }

  /**
   * Return option name.
   *
   * @return {string}
   * @api private
   */

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {string}
   * @api private
   */

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }
  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @api private
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }
}

function camelcase(flag) {
  return flag.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

function _parseOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1])) shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

class Command {
  constructor() {
    this.options = [];
  }

  option(flags, description, defaultValue) {
    const option = new Option(flags, description);
    const name = option.attributeName();
    if (defaultValue !== undefined) {
      this._setOptionValue(name, defaultValue);
    }
    this.options.push(option);
    return this;
  }

  parse(argv) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    // Default to using process.argv
    if (argv === undefined) {
      argv = process.argv;
    }
    const userArgs = argv.slice(2);
    this.parseOptions(userArgs);

    return this;
  }

  opts() {
    // Preserve original behaviour so backwards compatible when still using properties
    const result = {};
    const len = this.options.length;

    for (let i = 0; i < len; i++) {
      const key = this.options[i].attributeName();
      result[key] = this[key];
    }
    return result;
  }

  _setOptionValue(key, value) {
    this[key] = value;
  }

  _findOption(arg) {
    return this.options.find(option => option.is(arg));
  }

  parseOptions(argv) {
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    // parse options
    while (args.length) {
      const arg = args.shift();

      // literal
      if (arg === '--') {
        break;
      }
      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        // recognised option, call listener to assign value with possible custom processing
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) {
              throw new Error(`error: option '${option.flags}' argument missing`);
            }
            this._setOptionValue(`${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this._setOptionValue(`${option.name()}`, value);
          } else { // boolean flag
            this._setOptionValue(`${option.name()}`);
          }
          continue;
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this._setOptionValue(`${option.name()}`, arg.slice(index + 1));
        }
      }
    }
  }
}

exports = module.exports = new Command();
exports.program = exports; // More explicit access to global command.

/**
 * Expose classes
 */

exports.Command = Command;
exports.Option = Option;