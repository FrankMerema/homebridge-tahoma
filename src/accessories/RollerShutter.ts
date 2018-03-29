import { Device } from '../model/device.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';
import { AwningClass } from './awning-accessory';

function RollerShutter(logger: Logger, config: TahomaConfig, device: Device) {
    return new RollerShutterClass(logger, config, device);
}

class RollerShutterClass extends AwningClass {

    constructor(logger: Logger, config: TahomaConfig, device: Device) {
        super(logger, config, device);

    }
}

export = RollerShutter;
