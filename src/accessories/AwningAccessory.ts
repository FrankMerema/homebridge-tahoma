import { OverkizApi } from '../api/overkiz-api';
import { Device } from '../model/device.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';
import { AbstractAccessory } from './AbstractAccessory';

export class AwningClass extends AbstractAccessory {
    private config: TahomaConfig;

    constructor(logger: Logger, api: OverkizApi, device: Device, config: TahomaConfig,
                service: HAPNodeJS.Service, characteristic: HAPNodeJS.Characteristic) {
        super(logger, api, device, service, characteristic);

        this.config = config;

        // this.executeCommand({}, () => {
        //
        // });
    }
}
