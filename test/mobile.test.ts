import {
  beforeEach,
  expect,
  it,
  afterEach,
  assert,
  describe,
  vi,
} from 'vitest';
import mobile from "../mobile";

beforeEach(() => {
  if (!window.nativeInterface) {
    console.error('Do not supported native interface')
  }
});

describe('모바일 단말기와의 통신 인터페이스 테스트', () => {
  it('파라메터 전달, 응답 테스트', () => {
    mobile.setDeviceName('/torder/json/config.json').then((ret)=>console.log(ret))
  })

  it('연속해서 같은 네티이브 함수가 호출되었을 경우', () => {
    mobile.setDeviceName('/torder/json/config.json').then((ret)=>console.log('[1]', ret));
    mobile.setDeviceName('/torder/json/config.json').then((ret)=>console.log('[2]', ret))
    mobile.setDeviceName('/torder/json/config.json').then((ret)=>console.log('[3]', ret))
    mobile.setDeviceName('/torder/json/config.json').then((ret)=>console.log('[4]', ret))
  })

  it('mutex 시간 변경', () => {
    mobile.getDevice.mutexOption = {tryCount: 100, tickTime: 50};
    mobile.getDevice().then((ret)=>console.log('[1]', ret)); // 정상 응답
    mobile.getDevice().then((ret)=>console.log('[2]', ret)); // 정상 응답
    mobile.getDevice.mutexOption = {tryCount: 0, tickTime: 50};
    mobile.getDevice().then((ret)=>console.log('[3]', ret)).catch((ret)=>console.error('[3]', ret)); // 에러 발생해야 함.
    mobile.getDevice.mutexOption = {tryCount: 100, tickTime: 50};
    mobile.getDevice().then((ret)=>console.log('[4]', ret)); // 데이터 있어야 함
  });
})
