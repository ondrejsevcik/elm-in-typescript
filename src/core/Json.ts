import * as List from './List';
import * as StringUtils from './StringUtils';
import * as Char from './Char';
import * as Basics from './Basics';
import * as Utils from './Utils';
import * as Result from './Result';
import * as Arrayy from './Arrayy';

enum DecoderType {
  SUCCEED = 0,
  FAIL = 1,
  INT = 2,
  BOOL = 3,
  FLOAT = 4,
  VALUE = 5,
  STRING = 6,
  LIST = 7,
  NULL = 9,
  ARRAY = 8,
  FIELD = 10,
  INDEX = 11,
  KEY_VALUE = 12,
  MAP = 13,
  AND_THEN = 14,
  ONE_OF = 15,
}

type JsonStatus = 0;

type JsonType<T> = Succeed<T> | Fail;

interface Succeed<T> {
  $: DecoderType.SUCCEED,
  __msg: T
}

interface Fail {
  $: DecoderType.FAIL,
  __msg: string
}

export function SUCCEED<T>(msg: T): Succeed<T> {
  return {
    $: DecoderType.SUCCEED,
    __msg: msg,
  };
}

export function FAIL(msg: string): Fail {
  return {
    $: DecoderType.FAIL,
    __msg: msg,
  };
}

function FAILURE(a, b) {
      return {$: 'Failure', a: a, b: b};
}

function INDEX(a, b) {
      return {$: 'Index', a: a, b: b};
}

function FIELD(a, b) {
      return {$: 'Field', a: a, b: b};
}

function ONEOF(a) {
      return {$: 'OneOf', a: a};
};

export function errorToString(error): string
{
  return errorToStringHelp(error, List.NIL);
}

export function errorToStringHelp(error, context) {
  errorToStringHelp: while (true) {
    switch (error.$) {
      case 'Field':
        var f = error.a;
        var err = error.b;
        var isSimple = (function() {
          var _n1: Utils.Maybe<Utils.TupleTwo<String,string>> = StringUtils.uncons(f);
          if (_n1.$ === 'Nothing') {
            return false;
          } else {
            var _n2 = _n1.a;
            var _char = _n2.a;
            var rest = _n2.b;
            return (
              isAlpha(_char) &&
              StringUtils.all(isAlphaNum, rest)
            );
          }
        })();
        let fieldName = isSimple ? '.' + f : "['" + (f + "']");
        var $temp$error = err;
        var $temp$context = List.CONS(fieldName, context);
        error = $temp$error;
        context = $temp$context;
        continue errorToStringHelp;
      case 'Index':
        var i = error.a;
        var err = error.b;
        var indexName = '[' + (StringUtils.fromNumber(i) + ']');
        var $temp$error = err;
        var $temp$context = List.CONS(indexName, context);
        error = $temp$error;
        context = $temp$context;
        continue errorToStringHelp;
      case 'OneOf':
        var errors = error.a;
        if (!errors.b) {
          return (
            'Ran into a Json.Decode.oneOf with no possibilities' +
            (function() {
              if (!context.b) {
                return '!';
              } else {
                return (
                  ' at json' +
                  StringUtils.join('', List.reverse(context))
                );
              }
            })()
          );
        } else {
          if (!errors.b.b) {
            var err = errors.a;
            var $temp$error = err;
            var $temp$context2 = context;
            error = $temp$error;
            context = $temp$context2;
            continue errorToStringHelp;
          } else {
            var starter = (function() {
              if (!context.b) {
                return 'Json.Decode.oneOf';
              } else {
                return (
                  'The Json.Decode.oneOf at json' +
                  StringUtils.join('', List.reverse(context))
                );
              }
            })();
            var introduction =
              starter +
              (' failed in the following ' +
                (StringUtils.fromNumber(List.length(errors)) +
                  ' ways:'));
            let tail = List.indexedMap<string>(ONEOF, errors)
            return StringUtils.joinList(
              '\n\n',
              List.CONS<string>(introduction, tail),
            );
          }
        }
      default:
        var msg = error.a;
        var json = error.b;
        var introduction = (function() {
          if (!context.b) {
            return 'Problem with the given value:\n\n';
          } else {
            return (
              'Problem with the value at json' +
              (StringUtils.join('', List.reverse(context)) +
                ':\n\n    ')
            );
          }
        })();
        return introduction + (indent(encode(4, json)) + ('\n\n' + msg));
    }
  }
}

function isAlpha(_char: String): boolean {
  return isLower(_char) || isUpper(_char);
}

function isLower(_char: String): boolean {
  var code = Char.toCode(_char);
  return (97 <= code) && (code <= 122);
}

function isUpper(_char: String): boolean {
	var code = Char.toCode(_char);
	return (code <= 90) && (65 <= code);
}

function isAlphaNum(_char: String) {
  return isLower(_char) || (isUpper(_char) || isDigit(_char));
}

function isDigit(_char: String): boolean {
	var code = Char.toCode(_char);
	return (code <= 57) && (48 <= code);
};

export function indent(str: string): string {
  return str.split('\n').join('\n    ');
}

interface IStringDecoder {
  $: 6,
}

export const decodeInt = { $: DecoderType.INT };
export const decodeBool = { $: DecoderType.BOOL };
export const decodeFloat = { $: DecoderType.FLOAT };
export const decodeValue = { $: DecoderType.VALUE };
export const decodeString: IStringDecoder = { 
  $: DecoderType.STRING 
};

export function decodeList(decoder) {
  return {
    $: DecoderType.LIST,
    __decoder: decoder,
    b: decoder // probably obsolete
  };
}

export function decodeArray(decoder) {
  return { 
    $: DecoderType.ARRAY,
    __decoder: decoder 
  }; 
}

export function decodeNull(value) {
  return {
    $: DecoderType.NULL,
    __value: value 
  }; 
}

export function decodeField(field, decoder)
{
	return {
		$: DecoderType.FIELD,
		__field: field,
          d: field, //probably obsolete
		__decoder: decoder,
          b: decoder, // probably obsolete
	};
}

export function decodeIndex(index, decoder)
{
	return {
		$: DecoderType.INDEX,
		__index: index,
		__decoder: decoder
	};
}

export function decodeKeyValuePairs(decoder)
{
	return {
		$: DecoderType.KEY_VALUE,
		__decoder: decoder
	};
}

export function mapMany(f, decoders)
{
	return {
		$: DecoderType.MAP,
		__func: f,
          f: f, // probably obsolete
		__decoders: decoders,
          g: decoders // probably obsolete
	};
}

export function andThen(callback, decoder)
{
	return {
		$: DecoderType.AND_THEN,
		__decoder: decoder,
		__callback: callback
	};
}

export function oneOf(decoders)
{
	return {
		$: DecoderType.ONE_OF,
		__decoders: decoders
	};
}


// DECODING OBJECTS

export function map1(f, d1)
{
	return mapMany(f, [d1]);
}

export function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

export function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}


export function runOnString(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return runHelp(decoder, value);
	}
	catch (e)
	{
		return Result.ERR(FAILURE('This is not valid JSON! ' + e.message, wrap(string)));
	}
}

export function run(decoder, value)
{
	return runHelp(decoder, unwrap(value));
}

export function runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case DecoderType.BOOL:
			return (typeof value === 'boolean')
				? Result.OK(value)
				: expecting('a BOOL', value);

		case DecoderType.INT:
			if (typeof value !== 'number') {
				return expecting('an INT', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return Result.OK(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return Result.OK(value);
			}

			return expecting('an INT', value);

		case DecoderType.FLOAT:
			return (typeof value === 'number')
				? Result.OK(value)
				: expecting('a FLOAT', value);

		case DecoderType.STRING:
			return (typeof value === 'string')
				? Result.OK(value)
				: (value instanceof String)
					? Result.OK(value + '')
					: expecting('a STRING', value);

		case DecoderType.NULL:
			return (value === null)
				? Result.OK(decoder.__value)
				: expecting('null', value);

		case DecoderType.VALUE:
			return Result.OK(wrap(value));

		case DecoderType.LIST:
			if (!Array.isArray(value))
			{
				return expecting('a LIST', value);
			}
			return runArrayDecoder(decoder.__decoder, value, List.fromArray);

		case DecoderType.ARRAY:
			if (!Array.isArray(value))
			{
				return expecting('an ARRAY', value);
			}
			return runArrayDecoder(decoder.__decoder, value, toElmArray);

		case DecoderType.FIELD:
			var field = decoder.__field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = runHelp(decoder.__decoder, value[field]);
			return (Result.isOk(result)) ? result : Result.ERR(FIELD(field, result.a));

		case DecoderType.INDEX:
			var index = decoder.__index;
			if (!Array.isArray(value))
			{
				return expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = runHelp(decoder.__decoder, value[index]);
			return (Result.isOk(result)) ? result : Result.ERR(INDEX(index, result.a));

		case DecoderType.KEY_VALUE:
			if (typeof value !== 'object' || value === null || Array.isArray(value))
			{
				return expecting('an OBJECT', value);
			}

                        var keyValuePairs: List.ListItem<any> = List.NIL;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (value.hasOwnProperty(key))
				{
					var result = runHelp(decoder.__decoder, value[key]);
					if (!Result.isOk(result))
					{
						return Result.ERR(FIELD(key, result.a));
					}
					keyValuePairs = List.CONS(Utils.Tuple2(key, result.a), keyValuePairs);
				}
			}
			return Result.OK(List.reverse(keyValuePairs));

		case DecoderType.MAP:
			var answer = decoder.__func;
			var decoders = decoder.__decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (!Result.isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return Result.OK(answer);

		case DecoderType.AND_THEN:
			var result = runHelp(decoder.__decoder, value);
			return (!Result.isOk(result))
				? result
				: runHelp(decoder.__callback(result.a), value);

		case DecoderType.ONE_OF:
                        var errors: List.ListItem<string> = List.NIL;
			for (var temp = decoder.__decoders; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = runHelp(temp.a, value);
				if (Result.isOk(result))
				{
					return result;
				}
				errors = List.CONS(result.a, errors);
			}
			return Result.ERR(ONEOF(List.reverse(errors)));

		case DecoderType.FAIL:
			return Result.ERR(FAILURE(decoder.__msg, wrap(value)));

		case DecoderType.SUCCEED:
			return Result.OK(decoder.__msg);
	}
}

export function runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = runHelp(decoder, value[i]);
		if (!Result.isOk(result))
		{
			return Result.ERR(INDEX(i, result.a));
		}
		array[i] = result.a;
	}
	return Result.OK(toElmValue(array));
}

export function toElmArray(array)
{
	return Arrayy.initialize(array.length, function(i) { return array[i]; });
}

function expecting(type, value) {
  return Result.ERR(FAILURE('Expecting ' + type, wrap(value)));
}


// EQUALITY

function equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case DecoderType.SUCCEED:
		case DecoderType.FAIL:
			return x.__msg === y.__msg;

		case DecoderType.BOOL:
		case DecoderType.INT:
		case DecoderType.FLOAT:
		case DecoderType.STRING:
		case DecoderType.VALUE:
			return true;

		case DecoderType.NULL:
			return x.__value === y.__value;

		case DecoderType.LIST:
		case DecoderType.ARRAY:
		case DecoderType.KEY_VALUE:
			return equality(x.__decoder, y.__decoder);

		case DecoderType.FIELD:
			return x.__field === y.__field && equality(x.__decoder, y.__decoder);

		case DecoderType.INDEX:
			return x.__index === y.__index && equality(x.__decoder, y.__decoder);

		case DecoderType.MAP:
			return x.__func === y.__func && listEquality(x.__decoders, y.__decoders);

		case DecoderType.AND_THEN:
			return x.__callback === y.__callback && equality(x.__decoder, y.__decoder);

		case DecoderType.ONE_OF:
			return listEquality(x.__decoders, y.__decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

export function encode(indentLevel, value)
{
	return JSON.stringify(unwrap(value), null, indentLevel) + '';
}

const __0_JSON = 0;

export function wrap(value) { 
  return {
    $: __0_JSON,
    a: value 
  }; 
}

export function unwrap(value) {
  return value.a; 
}

