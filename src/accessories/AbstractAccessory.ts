import { OverkizApi } from '../api/overkiz-api';
import { State } from '../constants/accessory-state';
import { Device } from '../model/device.model';
import { Operation } from '../model/operation.model';
import { Logger } from '../utils/logger';

export class AbstractAccessory {

    logger: Logger;
    api: OverkizApi;
    device: Device;

    name: string;
    services: Array<HAPNodeJS.Service> = [];

    lastExecId: string;

    constructor(logger: Logger, api: OverkizApi, device: Device,
                service: HAPNodeJS.Service, characteristic: HAPNodeJS.Characteristic) {
        this.logger = logger;
        this.api = api;
        this.device = device;

        this.name = device.label;
        this.device = device;

        this.services = [];

        this.initialize(service, characteristic);
    }

    private initialize(service: HAPNodeJS.Service, characteristic: HAPNodeJS.Characteristic): void {
        const informationService = new service.AccessoryInformation();
        const manufacturer = this._look_state(State.STATE_MANUFACTURER);
        const model = this._look_state(State.STATE_MODEL);
        const serial = this.device.deviceURL.match(/([^\/]+$)/)[0];

        if (manufacturer !== null) {
            informationService.setCharacteristic(characteristic.Manufacturer, manufacturer);
        }
        if (model !== null) {
            informationService.setCharacteristic(characteristic.Model, model);
        }

        informationService.setCharacteristic(characteristic.SerialNumber, serial);

        this.services.push(informationService);
    }

    getServices(): Array<HAPNodeJS.Service> {
        return this.services;
    }

    onStateUpdate(name: string, value: any): void {
        /**
         *    Track here update of any state for this accessory
         *    You might then update corresponding Homekit Characteristic as follow :
         *    this.service.getCharacteristic(Characteristic.TargetPosition).updateValue(value);
         **/
    }

    executeCommand(commands: any): Promise<any> {
        let cmdName = '';

        if (Array.isArray(commands)) {
            cmdName = 'Bulk commands';
        } else {
            cmdName = commands.name;
            commands = [commands];
        }

        if (this.isCommandInProgress()) {
            this.api.cancelCommand(this.lastExecId);
        }

        const label = `${cmdName} ${this.name}`;
        const operation: Operation = {
            label: label,
            actions: [{
                deviceUrl: this.device.deviceURL,
                commands: commands
            }]
        };

        return this.api.executeCommand(operation)
            .then(data => {
                this.lastExecId = data.response.execId;

                return data;
            })
            .catch(error => {
                this.logger.info(`[${this.name}] ${cmdName}: ${error}`);

                return error;
            });
    }

    _look_state(stateName: string): string {
        if (this.device.states != null) {
            for (let state of this.device.states) {
                if (state.name === stateName) {
                    return state.value;
                }
            }
        }
        return null;
    }

    isCommandInProgress(): boolean {
        return (this.lastExecId in this.api.executionCallback);
    }
}
