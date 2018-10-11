import {dictToList, setToList} from "./Utils";

function toString(value)
{
	return toAnsiString(false, value);
}

function toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return charColor(ansi, "'" + addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return stringColor(ansi, '"' + addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output1 = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output1.push(toAnsiString(ansi, value[k]));
			}
			return '(' + output1.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return ctorColor(ansi, 'Set')
				+ fadeColor(ansi, '.fromList') + ' '
				+ toAnsiString(ansi, setToList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return ctorColor(ansi, 'Dict')
				+ fadeColor(ansi, '.fromList') + ' '
				+ toAnsiString(ansi, dictToList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return ctorColor(ansi, 'Array')
				+ fadeColor(ansi, '.fromList') + ' '
				+ toAnsiString(ansi, value);
		}

		if (tag === '::' || tag === '[]')
		{
			var output2 = '[';

			value.b && (output2 += toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output2 += ',' + toAnsiString(ansi, value.a);
			}
			return output2 + ']';
		}

		var output3 = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output3 += ' ' + (parenless ? str : '(' + str + ')');
		}
		return ctorColor(ansi, tag) + output3;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		var output4 = '<';
		for (let i = 0; i < value.byteLength; i++)
		{
			var byte = value.getUint8(i);
			output4 += toHexDigit(byte >> 4) + toHexDigit(byte & 15 /* 0b1111 */);
		}
		return stringColor(ansi, output4 + '>');
	}

	if (typeof value === 'object')
	{
		var output5 = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output5.push(fadeColor(ansi, field) + ' = ' + toAnsiString(ansi, value[key]));
		}
		if (output5.length === 0)
		{
			return '{}';
		}
		return '{ ' + output5.join(', ') + ' }';
	}

	return internalColor(ansi, '<internals>');
}

function addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function internalColor(ansi, string)
{
	return ansi ? '\x1b[94m' + string + '\x1b[0m' : string;
}

function toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


export function crash(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function regionToString(region)
{
	if (region.__$start.__$line === region.__$end.__$line)
	{
		return 'on line ' + region.__$start.__$line;
	}
	return 'on lines ' + region.__$start.__$line + ' through ' + region.__$end.__$line;
}
