import { Device } from '../model/device.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';

export class AbstractAccessory {

    logger: Logger;
    config: TahomaConfig;
    device: Device;

    name: string;
    deviceUrl: string;
    services: any[];

    constructor(logger: Logger, config: TahomaConfig, device: Device) {
        this.logger = logger;
        this.config = config;
        this.device = device;

        this.name = device.label;
        this.deviceUrl = device.deviceURL;
        this.device = device;

        this.services = [];
    }

    getServices(): Array<any> {
        return this.services;
    }

    onStateUpdate(name: string, value: any): void {
        /**
         *    Track here update of any state for this accessory
         *    You might then update corresponding Homekit Characteristic as follow :
         *    this.service.getCharacteristic(Characteristic.TargetPosition).updateValue(value);
         **/
    }

    executeCommand(commands: any, callback: () => void): void {
        let cmdName = '';
    }


}
