import * as List from './List';
import * as Basics from './Basics';
import * as Debug from './Debug';

export type Maybe<T> = IJust<T> | INothing;

interface INothing {
  $: 'Nothing';
}

interface IJust<T> {
  $: 'Just';
  a: T;
}

export const Nothing: INothing = {
  $: 'Nothing',
};

export function Just<T>(a: T): IJust<T> {
  return {$: 'Just', a: a};
}


// EQUALITY

function eq(x, y)
{
	for (
		var pair, stack = [], isEqual = eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push(Tuple2(x,y));
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && Debug.crash(5, null, null, null, null);
		return false;
	}

	if (x.$ === 'Set_elm_builtin')
	{
		x = setToList(x);
		y = setToList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = dictToList(x);
		y = dictToList(y);
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

export function dictToList(dict: Object): string[] {
    return Object.keys(dict);
}

export function setToList(sett) {
    return Array.from(sett);
}

// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

export function cmp(x, y, ord: Basics.ComparsionOperator = undefined)
{
	if (typeof x !== 'object')
	{
		return x === y ? Basics.EQ : x < y ? Basics.LT : Basics.GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}

	if (x.$[0] === '#')
	{
		return (ord = cmp(x.a, y.a))
			? ord
			: (ord = cmp(x.b, y.b))
				? ord
				: cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? Basics.GT : y.b ? Basics.LT : Basics.EQ);
}

var compare = function(x, y)
{
	var n = cmp(x, y);
	return n < 0 ? Basics.LT : n ? Basics.GT : Basics.EQ;
}


// COMMON VALUES

type TupleTypes = '#0' | '#2' | '#3';

export interface TupleZero {
  $: '#0';
}
export interface TupleTwo<TypeA, TypeB> {
  $: '#2';
  a: TypeA;
  b: TypeB;
}
export interface TupleThree<TypeA, TypeB, TypeC> {
  $: '#3';
  a: TypeA;
  b: TypeB;
  c: TypeC;
}

export const Tuple0: TupleZero = {$: '#0'};

export function Tuple2<A, B>(a: A, b: B): TupleTwo<A, B> {
  return {
    $: '#2',
    a: a,
    b: b,
  };
}
export function Tuple3<A, B, C>(a: A, b: B, c: C): TupleThree<A, B, C> {
  return {
    $: '#3',
    a: a,
    b: b,
    c: c,
  };
}

export function chr(c: string): String {
  return new String(c);
}

// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


function ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = List.CONS(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = List.CONS(xs.a, ys);
	}
	return root;
}
