// Establish connection with app
// Gecko 에서 디바이스의 port 를 연동 시켜 디바이스의 정의된 인터페이스 함수를 호출 시키거나 네이티브에서 웹으로 이벤트를 발생 시킨다.
const port = browser.runtime.connectNative("browser");

port.onMessage.addListener(r => {
  window.postMessage(r);
});

/**
 * {@link NativeBridgeInterface} 정의 내용 인터페이스 사용
 * TODO: 게코와 다른 방법이 있는지 검토
 * @type {{setDeviceName: *, getDevice: *}}
 */
const nativeInterface = {
  getDevice: ()=>port.postMessage({key: 'getDevice'}),
  setDeviceName: (name)=>port.postMessage({key: 'setDeviceName', value: name}),
};

window.wrappedJSObject.nativeInterface = cloneInto(
    nativeInterface,
    window,
    { cloneFunctions: true }
);
