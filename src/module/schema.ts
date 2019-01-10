export interface Schema {
    name: string;
    path: string;
    project: string;
    routing: boolean;
    routingScope: string;
    spec: boolean;
    flat: boolean;
    commonModule: boolean;
    module?: string;
    sandbox: boolean;
    container: boolean;
}