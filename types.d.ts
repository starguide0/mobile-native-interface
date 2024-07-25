import {NativeBridgeInterface} from "./methods";

declare global {
  interface Window {
    nativeInterface: NativeBridgeInterface,
  }
}
