import { OptionsWithUri, OptionsWithUrl } from 'request';
import { ExecutionState } from '../constants/execution-state';
import { ServerChoice } from '../constants/server-choice';
import { Command } from '../model/command.model';
import { Device } from '../model/device.model';
import { Operation } from '../model/operation.model';
import { Scenario } from '../model/scenario.model';
import { TahomaConfig } from '../model/tahoma-config.model';
import { Logger } from '../utils/logger';

const request = require('request-promise-any').defaults({jar: true});

interface MethodRequired {
    method: string;
    json: boolean;
}

type RequestOptionsMethodRequired = OptionsWithUri & MethodRequired | OptionsWithUrl & MethodRequired;

export class OverkizApi {
    private logger: Logger;
    private alwaysPoll: boolean;
    private pollingPeriod: number;
    private refreshPeriod: number;
    private service: ServerChoice;
    private user: string;
    private password: string;

    private isLoggedIn: boolean = false;
    private listenerId: string = null;

    executionCallback: Array<any> = [];
    private stateChangedEventListener: any = null;

    constructor(logger: Logger, config: TahomaConfig) {
        this.logger = logger;
        this.initialize(config);
    }

    executeCommand(body: Operation | Command): Promise<any> {
        return this.execute('apply', body);
    }

    cancelCommand(execId: string): Promise<any> {
        return this.backendCall({
            method: 'DELETE',
            url: this.urlForQuery(`/exec/current/setup/${execId}`),
            json: true
        });
    }

    execute(oid: string, body: Operation | Command): Promise<{ state: ExecutionState, response?: any, error?: any }> {
        return this.backendCall({
            method: 'POST',
            url: this.urlForQuery(`/exec/${oid}`),
            body: body,
            json: true
        }).then(response => {
            // this.executionCallback[response.execId] = callback;
            if (this.alwaysPoll) {
                this.registerListener();
            }

            return {state: ExecutionState.INITIALIZED, response: response};
        }).catch(error => {
            return {state: ExecutionState.FAILED, error: error};
        });
    }

    getActionGroups(): Promise<Array<Scenario>> {
        return this.backendCall({
            method: 'GET',
            url: this.urlForQuery('/actionGroups'),
            json: true
        });
    }

    getDevices(): Promise<Array<Device>> {
        return this.backendCall({
            method: 'GET',
            url: this.urlForQuery('/setup/devices'),
            json: true
        });
    }

    private initialize(config: TahomaConfig) {
        this.alwaysPoll = config.alwaysPoll || false;
        this.pollingPeriod = config.pollingPeriod || 2;
        this.refreshPeriod = config.refreshPeriod || (60 * 10);
        this.service = config.service || ServerChoice.TaHoma;

        this.user = config.user;
        this.password = config.password;

        if (!this.user || !this.password) throw new Error(`You must provide credentials ('user'/'password')`);
        if (!this.service) throw new Error(`Invalid service name ${this.service}`);

        //TODO polling
    }

    private urlForQuery(query: string): string {
        return `https://${this.service}/enduser-mobile-web/enduserAPI${query}`;
    }

    private backendCall(options: RequestOptionsMethodRequired): Promise<any> {
        return this.requestWithLogin(options)
            .catch(error => {
                this.logger.error(`Error ${error.statusCode}: ${error}`);
                return error;
            });
    }

    private requestWithLogin(requestOptions: RequestOptionsMethodRequired): Promise<any> {
        if (this.isLoggedIn) {
            return request(requestOptions);
        } else {
            this.logger.debug(`Connecting to ${this.service} server...`);

            return request({
                method: 'POST',
                url: this.urlForQuery('/login'),
                form: {
                    'userId': this.user,
                    'userPassword': this.password
                },
                json: true,
                resolveWithFullResponse: true
            }).then(() => {
                this.isLoggedIn = true;
                // if (this.alwaysPoll) {
                //     this.registerListener();
                // }

                return request(requestOptions);
            }).catch((error: any) => {
                if (error.statusCode === 401) {
                    this.isLoggedIn = false;
                    return this.requestWithLogin(requestOptions);
                } else {
                    this.logger.error(`There is a problem connecting to ${this.service}: ${error}`);
                    return error;
                }
            });
        }
    }

    private registerListener(): void {
        if (this.listenerId === null) {
            this.logger.debug('Register listener');
            request({
                method: 'POST',
                url: this.urlForQuery('/events/register'),
                json: true
            }).then((response: any) => {
                this.listenerId = response.id;
            });
        }
    }

    private unregisterListener(): void {
        if (this.listenerId !== null) {
            this.logger.debug('Unregister listener');
            request({
                method: 'POST',
                url: this.urlForQuery(`/events/${this.listenerId}/unregister`),
                json: true
            }).then(() => {
                this.listenerId = null;
            });
        }
    }

    private refreshState(): Promise<any> {
        return this.backendCall({
            method: 'PUT',
            url: this.urlForQuery(`/setup/devices/states/refresh`),
            json: true
        });
    }

    private requestState(deviceUrl: string, state: any): Promise<any> {
        return this.backendCall({
            method: 'GET',
            url: this.urlForQuery(`/setup/devices/${encodeURIComponent(deviceUrl)}/states/${encodeURIComponent(state)}`),
            json: true
        });
    }
}

