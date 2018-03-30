import { DeviceState } from './device-state.model';

export interface Device {
    controllableName: string;
    deviceURL: string;
    label: string;
    states: Array<DeviceState>;
    uiClass: string;
}
