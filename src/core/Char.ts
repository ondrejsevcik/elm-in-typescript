import * as Utils from './Utils';


export function toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

export function fromCode(code)
{
	return Utils.chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

export function toUpper(char)
{
	return Utils.chr(char.toUpperCase());
}

export function toLower(char)
{
	return Utils.chr(char.toLowerCase());
}

export function toLocaleUpper(char)
{
	return Utils.chr(char.toLocaleUpperCase());
}

export function toLocaleLower(char)
{
	return Utils.chr(char.toLocaleLowerCase());
}

export function isAlphaNum(_char) {
  return (
    isLower(_char) ||
    (isUpper(_char) || isDigit(_char))
  );
}
export function isAlpha(_char) {
  return isLower(_char) || isUpper(_char);
}

export function isDigit(_char) {
  var code = toCode(_char);
  return code <= 57 && 48 <= code;
};

export function isLower(_char) {
  var code = toCode(_char);
  return 97 <= code && code <= 122;
};

export function isUpper(_char) {
  var code = toCode(_char);
  return code <= 90 && 65 <= code;
};
