import { OverkizApi } from '../api/overkiz-api';
import { Device } from '../model/device.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';
import { AwningClass } from './AwningAccessory';

export default class RollerShutterClass extends AwningClass {

    constructor(logger: Logger, api: OverkizApi, device: Device, config: TahomaConfig,
                service: HAPNodeJS.Service, characteristic: HAPNodeJS.Characteristic) {
        super(logger, api, device, config, service, characteristic);
        console.log('YO');
    }
}
