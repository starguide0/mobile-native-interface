type DeviceInfo = {
  name: string;
  version: string;
  storage: {
    /**
     * size is byte
     */
    ram: number;
    /**
     * size is byte
     */
    storage: number
  }
}
export type GetDevice = {
  (): DeviceInfo;
}

export type SetDeviceName = {
  (name: string): DeviceInfo;
}
