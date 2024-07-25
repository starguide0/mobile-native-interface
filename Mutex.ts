import {type PromiseRejectFunction, type PromiseResolveFunction} from "./promise";

export type MutexOption = {
  /**
   * 리소스 free 여부를 체크하는 횟수
   */
  tryCount: number;

  /**
   * 리소스를 체크하는 시간 간격 msec
   */
  tickTime: number;
}

/**
 * 입력받은 함수에 mutex 를 설정하는 클래스 이다.
 */
export default class Mutex<F extends (...args: any) => any> {
  /**
   * resourceFunction 접근 플러그
   */
  private lock: boolean = false;

  /**
   * 기본적으로 설정된 mutex 옵션 값
   */
  private readonly defaultMutexOption: MutexOption;

  /**
   * mutex 되어야 하는 함수
   */
  private resourceFunction: F;


  /**
   * @param resourceFunction mutex 시킬 함수
   * @param defaultMutexOption mutex 옵션 설정, tryCount 가 Infinity 일 경우, tickTime 주기로 무한 체크한다.
   */
  constructor(resourceFunction: F, defaultMutexOption: MutexOption = {tryCount: 10, tickTime: 50}) {
    if (typeof resourceFunction !== 'function') {
      this.lock = false;
      throw new Error('callback is not function');
    }

    this.defaultMutexOption = {...defaultMutexOption};
    this.resourceFunction = resourceFunction;
  }

  /**
   * mutex 시킨 {@link resourceFunction} 함수를 호출 하는 메소드
   *
   * @param name 로그를 추적하기 위한 파라메터
   * @param data resourceFunction 에 전달할 파라메터 {@link resourceFunction}
   * @param mutexOption mutex 에 일시적으로 적용 할 옵션 값
   */
  public call<R = any>(name: string, data: Parameters<F>, mutexOption?: MutexOption) {
    return new Promise<R>((resolve, reject) => {
      const option = {
        ...this.defaultMutexOption,
        ...mutexOption,
      }
      this.acquire(name, resolve, reject, data, option);
    });
  }

  /**
   * lock 여부를 주기적으로 체크하는 로직으로 lock false 가 되면 {@link resourceFunction} 를 실행 시킨다.
   *
   * @param name 로그를 추적하기 위한 파라메터
   * @param resolve Promise 의 Resolve 값 할당.
   * @param reject Promise 의 reject 값 할당.
   * @param data resourceFunction 에 전달할 파라메터 {@link resourceFunction}
   * @param mutexOption mutex 에 대한 옵션
   * @private
   */
  private acquire(name: string, resolve: PromiseResolveFunction<ReturnType<F>>, reject: PromiseRejectFunction, data: Parameters<F>, mutexOption: MutexOption) {
    if (this.lock === true) {
      if (mutexOption.tryCount > 0) {
        mutexOption.tryCount -= 1;
        setTimeout(() => this.acquire(name, resolve, reject, data, mutexOption), mutexOption.tickTime);
      } else {
        // TODO: resourceFunction 가 Promise 일 경우 강제 중지할 필요가 있다.
        // 과연 영원한 락이 발생할 가능성이 있는가? 락을 해제 하려면 resourceFunction 실행 취소하는 기능이 필요하다. 가능한가?
        // this.lock = false;
        reject(new Error(`${name} timeout`));
      }
    } else {
      this.lock = true;
      const result = this.resourceFunction.call(null, ...(data ?? []));

      if (result instanceof Promise) {
        result.then((data)=>{
          this.lock = false;
          resolve(data)
        });
      } else {
        this.lock = false;
        resolve(result);
      }
    }
  }
}
