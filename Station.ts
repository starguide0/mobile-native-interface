import {type PromiseRejectFunction, type PromiseResolveFunction} from "./promise";


/**
 * ```
 *                 (Promise)  +---------+           (mobile call)   +--------+
 *  (keyA, FuncA) <---------> |         | --> FuncA --------------> |        |
 *  (keyB, FuncB) <---------> | Station | --> FuncB --------------> | Mobile |
 *       ...      <---------> |         | -->  ...  --------------> |        |
 *                            +---------+                           +--------+
 *                                 ^                                    |
 *                          +--------------+      ({key:'...',})        |
 *                          |   listener   | <--------------------------+
 *                          |   Function   |
 *                          +--------------+
 * ```
 * 모바일호출하는 인터페이스를 MobileStation 에 key 와 함께 전달하면 MobileStation 은 promise 를 반환한다.
 * 내부적으로는 Promise 에서 생성된 resolve, reject 를 Map 에 등록한다고 모바일 호출 함수를 실행 시킨다.
 * 모바일에서 처리한 결과는 listener function 으로 호출된다.
 *
 * - gecko 는 window event 로 'message' 로 전달한다.
 *
 * listener 로 전달하는 모바일 응답에 대한 데이터에 기준이 되는 Key 를 Map 에서 찾아 실행시킨다. 따라서 MobileStation
 * 를 사용할 경우 응답이 되는 키를 반드시 받아야 하고 모바일에서는 해당 key 를 어떻게 데이터로 전달해 줄 것인지 사전 정의가
 * 되어 있어야 한다.
 *
 * !!! 유의 사항 !!!
 * 모바일 호출 인터페이스가 반환 값의 유무에 따라서 station 에 등록시킬지 결정 된다
 */
export default class Station {
  private static instance: Station;
  private readonly station: Map<string, { resolve: PromiseResolveFunction<any>, reject: PromiseRejectFunction }>;

  /**
   * Singleton pattern
   */
  constructor() {
    if (Station.instance) return Station.instance;
    Station.instance = this;
    this.station = new Map();
  }

  /**
   * 대기열의 키 생성하고 추후 함수 실행시 해당 키로 Promise 의 resolve, reject 를 대기열에 등록한다.
   * @param key 대기열 키, 빈열 일경우 대기열 사용 안함.
   * @return 실행 시킬 함수를 파라메터로 받아 실행 뒤 Promise 를 생성하여 대기열에 넣는 함수
   */
  registerKey(key: string) {
    return <F extends (...any: any[]) => any>(mobileFunction: F) =>
      (...args: Parameters<F>) => new Promise<any>((resolve, reject) => {
        if (!mobileFunction) return Promise.reject(`파라메터에 호출 함수가 정의되지 않았습니다.`);

        if (key && this.station.has(key)) {
          this.station.get(key).reject(`${key} 는 이미 호출된 상태 입니다.`);
          return;
        }
        if (key) this.station.set(key, {resolve, reject});
        mobileFunction(...args);
      })
  }

  /**
   * 대기열의 함수를 생성하고 추후 함수 실행시 해당 키로 Promise 의 resolve, reject 를 대기열에 등록한다.
   * @param mobileFunction 모바일 네이티브에 데이터를 저장함
   * @return 실행 시킬 함수를 파라메터로 받아 실행 뒤 Promise 를 생성하여 대기열에 넣는 함수
   */
  registerFunction<F extends (...any: any[]) => any>(mobileFunction: F) {
    return (key: string) =>
      (...args: Parameters<F>) => new Promise<any>((resolve, reject) => {
        if (!mobileFunction) return Promise.reject(`파라메터에 호출 함수가 정의되지 않았습니다.`);

        if (key && this.station.has(key)) {
          this.station.get(key).reject(`${key} 는 이미 호출된 상태 입니다.`);
          return;
        }
        if (key) this.station.set(key, {resolve, reject});
        mobileFunction(...args);
      })
  }

  /**
   * 키에 해당하는 대기열의 promise resolve/reject 값을 읽어온다.
   * @param key 대기열 키
   */
  get(key: string) {
    return this.station.get(key);
  }

  /**
   * 통신 키값의 대기열을 삭제한다.
   * @param key 대기열 키
   */
  delete(key: string) {
    return this.station.delete(key);
  }

  /**
   * 통신 대기열을 모두 초기화 한다.
   */
  clear() {
    this.station.clear();
  }
}
