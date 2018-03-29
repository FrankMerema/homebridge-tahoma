import { ServerChoice } from '../constants/server-choice';
import { AlarmConfig } from './Alarm-config.model';

export interface TahomaConfig {
    user: string;
    password: string;
    service?: ServerChoice.Cozytouch | ServerChoice.TaHoma;

    exclude?: Array<string>;
    exposeScenarios?: boolean;
    alarm?: AlarmConfig;

    alwaysPoll?: boolean;
    pollingPeriod?: number;
    refreshPeriod?: number;
}
