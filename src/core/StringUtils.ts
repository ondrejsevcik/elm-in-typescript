import * as List from './List';
import * as Utils from './Utils';

export function uncons(
  str: string,
): Utils.Maybe<Utils.TupleTwo<String, string>> {
  var word = str.charCodeAt(0);
  if (word) {
    let a: Utils.TupleTwo<String,string> = 0xd800 <= word && word <= 0xdbff
        ? Utils.Tuple2(Utils.chr(str[0] + str[1]), str.slice(2))
        : Utils.Tuple2(Utils.chr(str[0]), str.slice(1));
    return Utils.Just(a);
  } else {
    return Utils.Nothing;
  }
}

export function map(func, str: string): string
{
	var len = str.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(Utils.chr(str[i] + str[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(Utils.chr(str[i]));
		i++;
	}
	return array.join('');
}

export function reverse(str: string): string
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

export function foldl(func, state, str: string)
{
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}
		state = func(Utils.chr(char), state);
	}
	return state;
}

export function join(sep: string, strings: string[]): string {
  return strings.join(sep);
}
export function joinList(sep: string, chunks: List.ListItem<string>): string {
  return join(sep, List.toArray(chunks));
}

export function trimLeft(str: string): string
{
	return str.replace(/^\s+/, '');
}

export function trimRight(str: string): string
{
	return str.replace(/\s+$/, '');
}

export function words(str: string): List.ListItem<string>
{
	return List.fromArray(str.trim().split(/\s+/g));
}

export function lines(str: string)
{
	return List.fromArray(str.split(/\r\n|\r|\n/g));
}

export function split(sep: string, str: string): List.ListItem<string> {
  return List.fromArray(str.split(sep));
}


export function any(isGood, str: string)
{
	var i = str.length;
	while (i--)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = str[i] + char;
		}
		if (isGood(Utils.chr(char)))
		{
			return true;
		}
	}
	return false;
}

export var all = function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(Utils.chr(char)))
		{
			return false;
		}
	}
	return true;
}

export function contains(sub: string, str: string): boolean
{
	return str.indexOf(sub) > -1;
}

export function startsWith(sub: string, str: string): boolean {
  return str.indexOf(sub) === 0;
}

export function endsWith(sub: string, str: string): boolean {
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}

export function indexes(sub: string, str: string): List.ListItem<number> {
	var subLen = sub.length;

	if (subLen < 1)
	{
		return List.NIL;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

  return List.fromArray<number>(is);
}


// TO STRING

export function fromNumber(num: number): string
{
	return num + '';
}


// INT CONVERSIONS

export function toInt(str: string): Utils.Maybe<number>
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return Utils.Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? Utils.Nothing
		: Utils.Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

export function toFloat(s: string): Utils.Maybe<number>
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return Utils.Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? Utils.Just(n) : Utils.Nothing;
}

export function fromList<T>(chars: List.ListItem<T>): string
{
	return List.toArray(chars).join('');
}

