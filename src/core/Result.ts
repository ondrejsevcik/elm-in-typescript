export type Result<OkType, ErrorType> = Ok<OkType> | Err<ErrorType>;

interface Ok<T> {
  $: 'Ok',
  a: T
}

interface Err<T> {
  $: 'Err',
  a: T
}

export function OK<T>(a: T): Ok<T> {
  return {
    $: 'Ok',
    a: a
  };
};

export function ERR<T>(a: T): Err<T> {
  return {
    $: 'Err',
    a: a,
  };
}

export function isOk<_>(result: Result<_,_>): boolean {
  if (result.$ === 'Ok') {
    return true;
  } else {
    return false;
  }
}
