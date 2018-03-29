import { Device } from '../model/device.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';
import { AbstractAccessory } from './abstract-accessory';

export class AwningClass extends AbstractAccessory {

    constructor(logger: Logger, config: TahomaConfig, device: Device) {
        super(logger, config, device);
    }
}
