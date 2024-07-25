
안드로이드 gecko Extension 를 통해 native 인터페이스를 연결 시킨다.
아래 코드는 WebExtension 를 사용하기 위해 안드로이드 자체 가지고 있는 manifest.json 를 읽어와 활성화 하는 방법이다.
```java
// Let's check if the extension is already installed first
GeckoRuntime geckoRuntime = GeckoRuntime.create(context);
geckoRuntime.getWebExtensionController().list().then(extensionList -> {
    if (extensionList != null) {
        for (WebExtension extension : extensionList) {
            if (extension.id.equals("example@test.com")
                    && extension.metaData.version.equals("1.0")) {
                // Extension already installed, no need to install it again
                return GeckoResult.fromValue(extension);
            }
        }
    }

    // Install if it's not already installed.
    return geckoRuntime.getWebExtensionController().installBuiltIn("resource://android/assets/messaging/");
}).accept(
        // Set the delegate that will receive messages coming from this WebExtension.
        extension -> geckoSession.getWebExtensionController().setMessageDelegate(extension, messageDelegate, "browser"),
        // Something bad happened, let's log an error
        e -> Log.e("MessageDelegate", "Error registering WebExtension", e)
);
```

```java
WebExtension.PortDelegate portDelegate = new WebExtension.PortDelegate() {
  //해당 WebExtension.Port 인스턴스를 통해 메시지가 전송될 때마다 호출됩니다.
  public void onPortMessage(final @NonNull Object message, final @NonNull WebExtension.Port port){
    // web extension 의 port 를 통해 연결된 인터페이스 로직 정의
    // ...
  }
  
  public void onDisconnect(final @NonNull WebExtension.Port port) {
    // After this method is called, this port is not usable anymore.
    if (port == mPort) {
        mPort = null;
    }
  }
}
```
WebExtension 를 통해 네이티브를 접근하여 웹-네이티브 간의 연결 통로를 한다.
```javascript
const port = browser.runtime.connectNative("browser");
port.onMessage.addListener(r => {
  window.postMessage(r);
});
const nativeInterface = {
  getDevice: ()=>port.postMessage({key: 'getDevice'}),
  setDeviceName: (name)=>port.postMessage({key: 'setDeviceName', value: name}),
};

window.wrappedJSObject.nativeInterface = cloneInto(
    nativeInterface,
    window,
    { cloneFunctions: true }
);
```

웹을 통해서 가져오는 방식으로 사용 할 수 있다.
