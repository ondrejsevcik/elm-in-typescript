import * as Basics from './Basics';
import * as Utils from './Utils';

export type ListItem<T> = ListNil | ListCons<T>;

interface ListNil {
  $: '[]';
  a: null;
  b: null;
}

interface ListCons<T> {
  $: '::';
  a: T;
  b: ListItem<T> | null;
}

export const NIL: ListNil = { 
  $: '[]',
  a: null,
  b: null
};

export function CONS<T>(hd: T, tl: ListItem<T>): ListCons<T> {
  return { 
    $: '::',
    a: hd,
    b: tl 
  };
}

export function fromArray<T>(arr: T[]): ListItem<T>
{
        let out: ListItem<T> = NIL;
	for (let i = arr.length; i--; )
	{
		out = CONS(arr[i], out);
	}
	return out;
}

export function length<T>(xs: ListItem<T>): number {
  return foldl(
    function(_n0, i) {
      return i + 1;
    },
    0,
    xs,
  );
}

export function indexedMap<T>(f, xs: ListItem<T>) {
  return map2(f, range(0, length(xs) - 1), xs);
}

function range(lo, hi) {
  return rangeHelp(lo, hi, NIL);
};

function rangeHelp(lo, hi, list) {
  rangeHelp: while (true) {
    if (Utils.cmp(lo, hi) < 1) {
      let $temp$lo = lo;
      let $temp$hi = hi - 1;
      let $temp$list = CONS(hi, list);
      lo = $temp$lo;
      hi = $temp$hi;
      list = $temp$list;
      continue rangeHelp;
    } else {
      return list;
    }
  }
}

export function toArray<T>(xs: ListItem<T>): T[] {
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

export function map<Source, Target>(
  mappingFn: (source: Source) => Target,
  xs: ListItem<Source>,
): ListItem<Target> {
  return foldr(
    function(x, acc) {
      return CONS(mappingFn(x), acc);
    },
    NIL,
    xs,
  );
}

export const map2 = function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(f(xs.a, ys.a));
	}
	return fromArray(arr);
}

export const map3 = function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(f(xs.a, ys.a, zs.a));
	}
	return fromArray(arr);
};

export const sortBy = function(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return Utils.cmp(f(a), f(b));
	}));
}

export const sortWith = function(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a, b);
		return ord === Basics.EQ ? 0 : ord === Basics.LT ? -1 : 1;
	}));
}

export const reverse = function (list) {
      return foldl(CONS, NIL, list);
};

export const foldr = function(fn, acc, ls) {
  return elm$core$List$foldrHelper(fn, acc, 0, ls);
}

const elm$core$List$foldrHelper = function(fn, acc, ctr, ls) {
  if (!ls.b) {
    return acc;
  } else {
    var a = ls.a;
    var r1 = ls.b;
    if (!r1.b) {
      return fn(a, acc);
    } else {
      var b = r1.a;
      var r2 = r1.b;
      if (!r2.b) {
        return fn(a, fn(b, acc));
      } else {
        var c = r2.a;
        var r3 = r2.b;
        if (!r3.b) {
          return fn(a, fn(b, fn(c, acc)));
        } else {
          var d = r3.a;
          var r4 = r3.b;
          var res =
            ctr > 500
              ? foldl(fn, acc, reverse(r4))
              : elm$core$List$foldrHelper(fn, acc, ctr + 1, r4);
          return fn(a, fn(b, fn(c, fn(d, res))));
        }
      }
    }
  }
}

export function foldl(func, acc, list) {
  foldl: while (true) {
    if (!list.b) {
      return acc;
    } else {
      var x = list.a;
      var xs = list.b;
      var $temp$func = func;
      let $temp$acc = func(x, acc);
      let $temp$list = xs;
      func = $temp$func;
      acc = $temp$acc;
      list = $temp$list;
      continue foldl;
    }
  }
}
