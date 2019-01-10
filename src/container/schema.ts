export interface Schema {
    path: string;
    project: string;
    name: string;
    inlineStyle: boolean;
    inlineTemplate: boolean;
    viewEncapsulation: string;
    changeDetection: string;
    prefix: string;
    styleext: string;
    spec: boolean;
    flat: boolean;
    skipImport: boolean;
    selector: string;
    module?: string;
    export: boolean;
    entryComponent: boolean;
}