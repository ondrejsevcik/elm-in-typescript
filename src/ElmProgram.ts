import * as StringUtils from './core/StringUtils';
import * as Char from './core/Char';
import * as List from './core/List';
import * as Json from './core/Json';
import * as Utils from './core/Utils';
import * as Platform from './core/Platform';

function F3(fun) {
  return function(a) {
    return function(b) {
      return function(c) {
        return fun(a, b, c);
      };
    };
  };
}

var elm$json$Json$Decode$errorOneOf = function(i, error) {
  return (
    '\n\n(' +
    (StringUtils.fromNumber(i + 1) +
      (') ' +
        Json.indent(
          elm$json$Json$Decode$errorToString(error),
        )))
  );
}
var elm$json$Json$Decode$errorToString = function(error) {
  return elm$json$Json$Decode$errorToStringHelp(error, List.NIL);
};
var elm$json$Json$Decode$errorToStringHelp = function(error, context) {
  errorToStringHelp: while (true) {
    switch (error.$) {
      case 'Field':
        var f = error.a;
        var err = error.b;
        var isSimple = (function() {
          var _n1: { $?: any; a?: any; b?: any;} = StringUtils.uncons(f);
          if (_n1.$ === 'Nothing') {
            return false;
          } else {
            var _n2 = _n1.a;
            var _char = _n2.a;
            var rest = _n2.b;
            return (
              Char.isAlpha(_char) &&
              StringUtils.all(Char.isAlphaNum, rest)
            );
          }
        })();
        let fieldName = isSimple ? '.' + f : "['" + (f + "']");
        let $temp$error = err;
        let $temp$context = List.CONS(fieldName, context);
        error = $temp$error;
        context = $temp$context;
        continue errorToStringHelp;
      case 'Index':
        var i = error.a;
        var err = error.b;
        let indexName = '[' + (StringUtils.fromNumber(i) + ']');
        let $temp$error2 = err;
        let $temp$context2 = List.CONS(indexName, context);
        error = $temp$error2;
        context = $temp$context2;
        continue errorToStringHelp;
      case 'OneOf':
        var errors = error.a;
        if (!errors.b) {
          return (
            'Ran into a Json.Decode.oneOf with no possibilities' +
            (function() {
              if (!context.b) {
                return '!';
              } else {
                return (
                  ' at json' +
                  StringUtils.joinList('', List.reverse(context))
                );
              }
            })()
          );
        } else {
          if (!errors.b.b) {
            var err = errors.a;
            let $temp$error = err;
            let $temp$context = context;
            error = $temp$error;
            context = $temp$context;
            continue errorToStringHelp;
          } else {
            var starter = (function() {
              if (!context.b) {
                return 'Json.Decode.oneOf';
              } else {
                return (
                  'The Json.Decode.oneOf at json' +
                  StringUtils.joinList('', List.reverse(context))
                );
              }
            })();
            var introduction =
              starter +
              (' failed in the following ' +
                (StringUtils.fromNumber(List.length(errors)) +
                  ' ways:'));
            return StringUtils.joinList(
              '\n\n',
                List.CONS(
                introduction,
                List.indexedMap(
                  elm$json$Json$Decode$errorOneOf,
                  errors,
                ),
              ),
            );
          }
        }
      default:
        var msg = error.a;
        var json = error.b;
        var introduction = (function() {
          if (!context.b) {
            return 'Problem with the given value:\n\n';
          } else {
            return (
              'Problem with the value at json' +
              (StringUtils.joinList('', List.reverse(context)) +
                ':\n\n    ')
            );
          }
        })();
        return introduction + (Json.indent(Json.encode(4, json)) + ('\n\n' + msg));
    }
  }
}
function initialModel(flags) {
  return Utils.Tuple2('', Platform.CmdNone);
};
var author$project$Main$DecodeFromJs = function(a) {
  return {$: 'DecodeFromJs', a: a};
};
var author$project$Main$decodeFromJs = Platform.incomingPort(
  'decodeFromJs',
  Json.decodeValue,
);
function subscriptions(model) {
  return author$project$Main$decodeFromJs(author$project$Main$DecodeFromJs);
};
const author$project$Main$Dog = F3(function(name, weight, sex) {
  return {name: name, sex: sex, weight: weight};
});
const author$project$Main$Female = {$: 'Female'};
const author$project$Main$Male = {$: 'Male'};
const author$project$Main$Unknown = {$: 'Unknown'};
function sexFromString(sexString) {
  var _n0 = sexString.toLowerCase();
  switch (_n0) {
    case 'male':
      return author$project$Main$Male;
    case 'female':
      return author$project$Main$Female;
    default:
      return author$project$Main$Unknown;
  }
};

const sexDecoder = Json.map1(sexFromString, Json.decodeString);

const dogDecoder = Json.map3(
  author$project$Main$Dog,
  Json.decodeField('name', Json.decodeString),
  Json.decodeField('weight', Json.decodeFloat),
  Json.decodeField('sex', sexDecoder),
);

const dogsDecoder = Json.decodeList(dogDecoder);
const sentResultToJs = Platform.outgoingPort('sentResultToJs', Json.wrap);

function sexToString(sex): string {
  switch (sex.$) {
    case 'Male':
      return 'Male';
    case 'Female':
      return 'Female';
    default:
      return 'Unknown'.toUpperCase();
  }
}

var elm$core$String$concat = function(strings) {
  return StringUtils.joinList('', strings);
};

function update(msg, model) {
  var value = msg.a;
  var _n1 = Json.run(dogsDecoder, value);
  if (_n1.$ === 'Ok') {
    var dogs: List.ListItem<any> = _n1.a;
    var dogsAsText = elm$core$String$concat(
        List.map(
        function(d) {
          return elm$core$String$concat(
            List.fromArray([
              d.name,
              ' ',
              StringUtils.fromNumber(d.weight),
              ' ',
              sexToString(d.sex),
              ';',
            ]),
          );
        },
        dogs,
      ),
    );
    return Utils.Tuple2(
      model,
      sentResultToJs(dogsAsText),
    );
  } else {
    var errText = _n1.a;
    return Utils.Tuple2(
      model,
      sentResultToJs(
        elm$json$Json$Decode$errorToString(errText),
      ),
    );
  }
}

export default Platform.worker({
    init: initialModel,
    subscriptions,
    update,
  },
  Json.SUCCEED<Utils.TupleZero>(Utils.Tuple0)
)
