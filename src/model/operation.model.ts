export interface Operation {
    label: string;
    actions: Array<{ deviceUrl: string, commands: Array<any> }>;
}
