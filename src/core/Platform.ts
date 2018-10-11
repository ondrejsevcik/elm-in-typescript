import * as Basics from './Basics';
import * as Debug from './Debug';
import * as Json from './Json';
import * as Scheduler from './Scheduler';
import * as List from './List';
import * as Process from './Process';
import * as Result from './Result';

// PROGRAMS


export function worker(impl, flagDecoder, args?) {
  return function() {
    return initialize(
      flagDecoder,
      args,
      impl.init,
      impl.update,
      impl.subscriptions,
      function() {
        return function() {};
      },
    );
  };
}



// INITIALIZE A PROGRAM


function initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = Json.run(flagDecoder, Json.wrap(args ? args['flags'] : undefined));
	Result.isOk(result) || Debug.crash(2, Json.errorToString(result.a), undefined, undefined, undefined);
	var managers = {};
	result = init(result.a);
	var model = result.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		result = update(msg, model);
		stepper(model = result.a, viewMetadata);
		dispatchEffects(managers, result.b, subscriptions(model));
	}

	dispatchEffects(managers, result.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// EFFECT MANAGERS


const effectManagers = {};


function setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = instantiateManager(manager, sendToApp);
	}

	return ports;
}


function instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return Scheduler.ANDTHEN(loop, Scheduler.RECEIVE(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return onSelfMsg(router, value, state);
			}

			return cmdMap && subMap
				? onEffects(router, value.i, value.j, state)
				: onEffects(router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = Scheduler.rawSpawn(Scheduler.ANDTHEN(loop, info.b));
}



// BAGS


function leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function batch(list)
{
	return {
		$: 2,
		m: list
	};
}


// PIPE BAGS INTO EFFECT MANAGERS


function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		Scheduler.rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: List.NIL, j: List.NIL }
		});
	}
}


function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			gatherEffects(isCmd, bag.o, effectsDict, {
				p: bag.n,
				q: taggers
			});
			return;
	}
}


function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.q)
		{
			x = temp.p(x);
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].e
		: effectManagers[home].f;

	return map(applyTaggers, value)
}


function insert(isCmd, newEffect, effects)
{
	effects = effects || { i: List.NIL, j: List.NIL };

	isCmd
		? (effects.i = List.CONS(newEffect, effects.i))
		: (effects.j = List.CONS(newEffect, effects.j));

	return effects;
}



// PORTS


function checkPortName(name)
{
	if (effectManagers[name])
	{
		Debug.crash(3, name, undefined, undefined, undefined)
	}
}



// OUTGOING PORTS


export function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		e: outgoingPortMap,
		r: converter,
		a: setupOutgoingPort
	};
	return leaf(name);
}


const outgoingPortMap = function(tagger, value) { return value; }


function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].r;

	// CREATE MANAGER

	var init = Process.sleep(0);

	effectManagers[name].b = init;
	effectManagers[name].c = function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = Json.unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	}

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


export function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		f: incomingPortMap,
		r: converter,
		a: setupIncomingPort
	};
	return leaf(name);
}


const incomingPortMap = function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
}


function setupIncomingPort(name, sendToApp)
{
	var subs = List.NIL;
	var converter = effectManagers[name].r;

	// CREATE MANAGER

	var init = Scheduler.SUCCEED(null);

	effectManagers[name].b = init;
	effectManagers[name].c = function(router, subList, state)
	{
		subs = subList;
		return init;
	}

	// PUBLIC API

	function send(incomingValue)
	{
		var result = Json.run(converter, Json.wrap(incomingValue));

		Result.isOk(result) || Debug.crash(4, name, result.a, undefined, undefined);

		var value = result.a;
		for (var temp: Basics.ElmCustomType = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}


export const CmdNone = batch(List.NIL);
