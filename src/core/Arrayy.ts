import * as List from './List';
import * as Basics from './Basics';
import * as JsArray from './JsArray';

export const initialize = function(len, fn) {
  if (len <= 0) {
    return empty;
  } else {
    var tailLen = len % branchFactor;
    var tail = JsArray.initialize(tailLen, len - tailLen, fn);
    var initialFromIndex = len - tailLen - branchFactor;
    return initializeHelp(fn, initialFromIndex, len, List.NIL, tail);
  }
}

export function ARRAY_ELM_BUILTIN(a, b, c, d) {
  return {$: 'Array_elm_builtin', a: a, b: b, c: c, d: d};
};

const branchFactor = 32;

const shiftStep = Math.ceil(
  Basics.logBase(2, branchFactor),
);

const empty = ARRAY_ELM_BUILTIN(0, shiftStep, JsArray.empty, JsArray.empty);

export const Leaf = function(a) {
  return {$: 'Leaf', a: a};
};
export const SubTree = function(a) {
  return {$: 'SubTree', a: a};
};


export function initializeHelp(fn, fromIndex, len, nodeList, tail) {
  initializeHelp: while (true) {
    if (fromIndex < 0) {
      return builderToArray(false, {
        nodeList: nodeList,
        nodeListSize: (len / branchFactor) | 0,
        tail: tail,
      });
    } else {
      var leaf = Leaf(
        JsArray.initialize(branchFactor, fromIndex, fn),
      );
      var $temp$fn = fn,
        $temp$fromIndex = fromIndex - branchFactor,
        $temp$len = len,
        $temp$nodeList = List.CONS(leaf, nodeList),
        $temp$tail = tail;
      fn = $temp$fn;
      fromIndex = $temp$fromIndex;
      len = $temp$len;
      nodeList = $temp$nodeList;
      tail = $temp$tail;
      continue initializeHelp;
    }
  }
};

export const builderToArray = function(reverseNodeList, builder) {
  if (!builder.nodeListSize) {
    return ARRAY_ELM_BUILTIN(
      JsArray.length(builder.tail),
      shiftStep,
      JsArray.empty,
      builder.tail,
    );
  } else {
    var treeLen = builder.nodeListSize * branchFactor;
    var depth = Math.floor(
      Basics.logBase(branchFactor, treeLen - 1),
    );
    var correctNodeList = reverseNodeList
      ? List.reverse(builder.nodeList)
      : builder.nodeList;
    var tree = treeFromBuilder(
      correctNodeList,
      builder.nodeListSize,
    );
    return ARRAY_ELM_BUILTIN(
      JsArray.length(builder.tail) + treeLen,
      Basics.max(5, depth * shiftStep),
      tree,
      builder.tail,
    );
  }
}

export const treeFromBuilder = function(nodeList, nodeListSize) {
  treeFromBuilder: while (true) {
    var newNodeSize = Math.ceil(
      nodeListSize / branchFactor,
    );
    if (newNodeSize === 1) {
      return JsArray.initializeFromList(
        branchFactor,
        nodeList,
      ).a;
    } else {
      var $temp$nodeList = compressNodes(
          nodeList,
          List.NIL,
        ),
        $temp$nodeListSize = newNodeSize;
      nodeList = $temp$nodeList;
      nodeListSize = $temp$nodeListSize;
      continue treeFromBuilder;
    }
  }
}

export const compressNodes = function(nodes, acc) {
  compressNodes: while (true) {
    var _n0 = JsArray.initializeFromList(
      branchFactor,
      nodes,
    );
    var node = _n0.a;
    var remainingNodes = _n0.b;
    var newAcc = List.CONS(SubTree(node), acc);
    if (!remainingNodes.b) {
      return List.reverse(newAcc);
    } else {
      var $temp$nodes = remainingNodes,
        $temp$acc = newAcc;
      nodes = $temp$nodes;
      acc = $temp$acc;
      continue compressNodes;
    }
  }
}
