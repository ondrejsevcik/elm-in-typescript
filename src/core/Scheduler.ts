import * as Utils from './Utils';

enum Tag {
  Succeed,
  Fail,
  Binding,
  AndThen,
  OnError,
  Receive,
}

type Task<T> = Succeed<T> | Fail | Binding | Receive | AndThen<T>;

interface Succeed<T> {
  $: Tag.Succeed;
  __value: T;
}

interface Fail {
  $: Tag.Fail;
  __value: string;
}

interface Binding {
  $: Tag.Binding;
  __callback: Function;
  __kill: null | Function;
}

interface AndThen<T> {
  $: Tag.AndThen;
  __callback: Function;
  __task: Task<T>;
  __value: undefined;
}

interface Receive {
  $: Tag.Receive;
  __callback: Function;
}

interface OnError<T> {
  $: Tag.OnError;
  __callback: Function;
  __task: Task<T>;
};

export function SUCCEED<T>(value: T): Succeed<T> {
  return {
    $: Tag.Succeed,
    __value: value,
  };
}

export function FAIL(error: string): Fail
{
  return {
    $: Tag.Fail,
    __value: error
  };
}

export function BINDING(callback: Function): Binding
{
	return {
		$: Tag.Binding,
		__callback: callback,
		__kill: null
	};
}

export function ANDTHEN<T>(callback: Function, task: Task<T>): AndThen<T>
{
	return {
		$: Tag.AndThen,
		__callback: callback,
		__task: task,
                __value: undefined
	};
}

export function ONERROR<T>(callback: Function, task: Task<T>): OnError<T>
{
	return {
		$: Tag.OnError,
		__callback: callback,
		__task: task
	};
}

export function RECEIVE(callback: Function): Receive
{
	return {
		$: Tag.Receive,
		__callback: callback
	};
}


// PROCESSES


var guid = 0;

const PROCESS = 'process';

interface Proc<T> {
  $: string;
  __id: number;
  __root: Task<T>;
  __stack: any; // don't know yet
  __mailbox: any[]; // don't know yet
}

export function rawSpawn<T>(task: Task<T>): Proc<T> {
  const proc = {
    $: PROCESS,
    __id: guid++,
    __root: task,
    __stack: null,
    __mailbox: [],
  };

  enqueue(proc);

  return proc;
}

export function rawSend<T>(proc: Proc<T>, msg)
{
	proc.__mailbox.push(msg);
	enqueue(proc);
}

/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


let working = false;
const queue: Proc<any>[] = [];

function enqueue<T>(proc: Proc<T>): void {
  queue.push(proc);
  if (working) {
    return;
  }
  working = true;
  while ((proc = queue.shift())) {
    step(proc);
  }
  working = false;
}


function step(proc): void
{
	while (proc.__root)
	{
		var rootTag = proc.__root.$;
		if (rootTag === Tag.Succeed || rootTag === Tag.Fail)
		{
			while (proc.__stack && proc.__stack.$ !== rootTag)
			{
				proc.__stack = proc.__stack.__rest;
			}
			if (!proc.__stack)
			{
				return;
			}
			proc.__root = proc.__stack.__callback(proc.__root.__value);
			proc.__stack = proc.__stack.__rest;
		}
		else if (rootTag === Tag.Binding)
		{
			proc.__root.__kill = proc.__root.__callback(function(newRoot) {
				proc.__root = newRoot;
				enqueue(proc);
			});
			return;
		}
		else if (rootTag === Tag.Receive)
		{
			if (proc.__mailbox.length === 0)
			{
				return;
			}
			proc.__root = proc.__root.__callback(proc.__mailbox.shift());
		}
		else // if (rootTag === __1_AND_THEN || rootTag === __1_ON_ERROR)
		{
			proc.__stack = {
				$: rootTag === Tag.AndThen ? Tag.Succeed : Tag.Fail,
				__callback: proc.__root.__callback,
				__rest: proc.__stack
			};
			proc.__root = proc.__root.__task;
		}
	}
}
