import * as Utils from './Utils';

export var empty = [];

export function singleton(value)
{
    return [value];
}

export function length(array)
{
    return array.length;
}

export var initialize = function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
}

export var initializeFromList = function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return Utils.Tuple2(result, ls);
}

export var unsafeGet = function(index, array)
{
    return array[index];
}

export var unsafeSet = function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
}

export var push = function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
}

export var foldl = function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = func(array[i], acc);
    }

    return acc;
}

export var foldr = function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = func(array[i], acc);
    }

    return acc;
}

export var map = function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
}

export var indexedMap = function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(offset + i, array[i]);
    }

    return result;
}

export var slice = function(from, to, array)
{
    return array.slice(from, to);
}

export var appendN = function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
}
