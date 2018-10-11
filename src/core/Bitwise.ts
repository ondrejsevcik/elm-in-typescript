var _Bitwise_and = function(a, b)
{
	return a & b;
}

var _Bitwise_or = function(a, b)
{
	return a | b;
}

var _Bitwise_xor = function(a, b)
{
	return a ^ b;
}

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = function(offset, a)
{
	return a << offset;
}

var _Bitwise_shiftRightBy = function(offset, a)
{
	return a >> offset;
}

var _Bitwise_shiftRightZfBy = function(offset, a)
{
	return a >>> offset;
}
