import Mutex, {MutexOption} from "./Mutex";
import {pipe} from "fp-ts/function";
import {NativeBridgeInterface} from "./methods";
import Station from "./Station";
import Bowser from "bowser";

const createMutex = (name: string) => <F extends (...args: any[]) => any>(func: F) => {
  const mutex = new Mutex(func);
  const targetFunction: {
    (...args: any[]): any,
    mutexOption?: MutexOption;
  } = (...data: Parameters<F>) => mutex.call(name, data, targetFunction.mutexOption);
  return targetFunction;
}

const mobileStation = new Station();

/**
 * 네티이브에서 전달하는 전역 메시지 핸들러를 등록한다.
 */
window.addEventListener('message', (event: MessageEvent) => {
  const {data} = event;
  const {methodName} = data;

  mobileStation.get(methodName)?.resolve(data);
  mobileStation.delete(methodName);
})

type RecordFunctionValueToMutexPromise<T> = {
  [K in keyof T]: {
  (...arg: (T[K] extends (...args: infer P) => any ? P : never)): Promise<(T[K] extends (...args: any) => infer R ? R : any)>;
} & { mutexOption?: MutexOption; };
}

const browserInfo = Bowser.getParser(navigator.userAgent);

/**
 * 반환하는 함수에 대한 리스트
 * - 반환값이 있는 함수만 Station 에 응답값을 기다린다.
 */
const hasReturnList = ['setDeviceName'];

const mobile = Object.entries(window.nativeInterface ?? {}).reduce((acc, [key, value]) => {
  if(browserInfo.getBrowser().name === 'Firefox') {
    const isReturnType = hasReturnList.includes(key);
    acc[key] = pipe(value, mobileStation.registerKey(isReturnType ? key : ''), createMutex(key));
  }
  return acc;
}, {} as RecordFunctionValueToMutexPromise<NativeBridgeInterface>);


export default mobile;
