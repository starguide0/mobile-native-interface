import {GetDevice, SetDeviceName} from "./Device";

export interface NativeBridgeInterface {
  getDevice: GetDevice,
  setDeviceName: SetDeviceName,
}
