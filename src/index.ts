import { ScenarioAccessory } from './accessories/scenario-accessory';
import { OverkizApi } from './api/overkiz-api';
import { DeviceState } from './model/device-state.model';
import { Device } from './model/device.model';
import { TahomaConfig } from './model/tahoma-config.model';
import { Logger } from './utils/logger';

let Service: HAPNodeJS.Service;
let Characteristic: HAPNodeJS.Characteristic;

function main(homebridge: any): void {
    console.log('Homebridge API version: ' + homebridge.version);

    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerPlatform('homebridge-tahoma', 'Tahoma', TahomaPlatform, false);
}

class TahomaPlatform {

    private logger: Logger;
    private config: TahomaConfig;
    private api: OverkizApi;
    private platformAccessories: Array<any> = [];
    private exposeScenarios: boolean;
    private exclusions: Array<string>;

    constructor(log: any, config: TahomaConfig) {
        this.logger = new Logger(log);
        this.config = config;
        this.initialize(config);
    }

    accessories(callback: (accessories: any[]) => void): void {
        if (this.platformAccessories.length === 0) {
            this.loadDevices()
                .then(devices => {
                    this.platformAccessories.push(...devices);

                    if (this.exposeScenarios) {
                        this.loadScenarios()
                            .then(scenarios => {
                                this.platformAccessories.push(...scenarios);
                            });
                    }
                    callback(this.platformAccessories);
                });
        } else {
            callback(this.platformAccessories);
        }
    }

    onStatesChange(deviceUrl: string, states: Array<DeviceState>): void {
        const accessory = this.findAccessory(deviceUrl);
        if (accessory !== null && states !== null) {
            for (let state of states) {
                accessory.onStateUpdate(state.name, state.value);
            }
        }
    }

    private initialize(config: TahomaConfig): void {
        this.exposeScenarios = config.exposeScenarios || false;
        this.exclusions = config.exclude || [];
        this.exclusions.push('internal'); // Exclude internal devices
        this.api = new OverkizApi(this.logger, config);
    }

    private findAccessory(deviceUrl: string): any {
        const index = deviceUrl.indexOf('#');
        const baseUrl = index !== -1 ? deviceUrl.substring(0, index) : null;

        for (let accessory of this.platformAccessories) {
            if (accessory.deviceURL === deviceUrl) {
                return accessory;
            } else if (baseUrl !== null && accessory.deviceURL.startsWith(baseUrl)) {
                return accessory;
            }
        }

        return null;
    }

    private loadDevices(): Promise<Array<Device>> {
        return this.api.getDevices()
            .then(devices => {
                let devicesList: Array<Device> = [];
                for (let device of devices) {
                    let accessory = null;
                    const protocol = device.controllableName.split(':').shift();

                    //TODO check if DeviceAccessory is available
                    if (true) {
                        if (this.exclusions.indexOf(protocol) === -1 && this.exclusions.indexOf(device.label) === -1) {
                            if (device.uiClass === 'RollerShutter') {
                                import(`./accessories/${device.uiClass}`).then((clazz) => {
                                    accessory = clazz.default(this.logger, this.config, device);
                                });
                            }
                            //TODO create accessory
                            // accessory = {
                            //     controllableName: '',
                            //     deviceURL: '',
                            //     label: '',
                            //     states: [],
                            //     uiClass: '',
                            //     onStateUpdate: (name: string, value: string) => {
                            //     },
                            //     getServices: (): any[] => {
                            //         return [];
                            //     },
                            // };

                            // if (device.states != null) {
                            //     for (let state of device.states) {
                            //         accessory.onStateUpdate(state.name, state.value);
                            //     }
                            // }
                            devicesList.push(accessory);
                        }
                    }
                    // else {
                    //     this.logger.info(`Device type ${device.uiClass} unknown`);
                    // }
                }
                return Promise.resolve(devicesList);
            });
    }

    private loadScenarios(): Promise<any> {
        return this.api.getActionGroups()
            .then(scenarios => {
                const scenarioList = [];

                for (let scenario of scenarios) {
                    if (!Array.isArray(this.exposeScenarios) || this.exposeScenarios.indexOf(scenario.label) !== -1) {
                        const scenarioAccessory = new ScenarioAccessory(scenario.label, scenario.oid, this.logger, this.api, Service, Characteristic);
                        scenarioList.push(scenarioAccessory);
                    }
                }

                return Promise.resolve(scenarioList);
            });
    }
}


export = main;
