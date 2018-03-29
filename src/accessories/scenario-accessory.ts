import { ExecutionState } from '../constants/execution-state';
import { Logger } from '../utils/logger';

export class ScenarioAccessory {

    private oid: string;
    private name: string;
    private logger: Logger;
    private api: any;

    private services: Array<any> = [];
    private state: any;
    private lastExecId: string;


    constructor(name: string, oid: string, logger: Logger, api: any, hapService: any, hapCharacteristic: any) {
        this.oid = oid;
        this.name = name;
        this.logger = logger;
        this.api = api;

        this.initialize(name, hapService, hapCharacteristic);
    }

    getServices(): Array<any> {
        return this.services;
    }

    private initialize(name: string, hapService: any, hapCharacteristic: any): void {
        const service = new hapService.Switch(name);
        this.state = service.getCharacteristic(hapCharacteristic.On);
        this.state.on('set', (value: any, callback: (error: any) => void) => this.executeScenario(value, callback));

        this.services.push(service);
    }

    private executeScenario(value: any, callback: (error?: any) => void): void {
        if (this.isCommandInProgress()) {
            this.api.cancelCommand(this.lastExecId, () => {
            });
        }

        if (value) {
            this.api.execute(this.oid, null, (status: any, error: any, data: any) => {
                if (!error) {
                    if (status === ExecutionState.INITIALIZED) {
                        this.lastExecId = data.execId;
                    }
                    if (status === ExecutionState.FAILED || status === ExecutionState.COMPLETED) {
                        this.logger.info(`[Scenario] ${this.name} ${error === null ? status : error}`);
                        this.state.updateValue(0);
                    }
                }
            });
        }
        callback();
    }

    private isCommandInProgress(): boolean {
        return (this.lastExecId in this.api.executionCallback);
    }
}
