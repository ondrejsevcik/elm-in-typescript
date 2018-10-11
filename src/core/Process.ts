import * as Utils from './Utils';
import * as Scheduler from './Scheduler';

export function sleep(time: number) {
  return Scheduler.BINDING(function(callback) {
    var id = setTimeout(function() {
      callback(Scheduler.SUCCEED(Utils.Tuple0));
    }, time);

    return function() {
      clearTimeout(id);
    };
  });
}
