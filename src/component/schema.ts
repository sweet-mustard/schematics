export interface Schema {
    path?: string;
    project?: string;
    name: string;
    inlineStyle?: boolean;
    inlineTemplate?: boolean;
    viewEncapsulation?: string;
    changeDetection?: string;
    prefix?: string;
    styleext?: string;
    style?: string;
    spec?: boolean;
    skipTests?: boolean;
    flat?: boolean;
    skipImport?: boolean;
    selector?: string;
    skipSelector?: boolean;
    module?: string;
    export?: boolean;
    entryComponent?: boolean;
    lintFix?: boolean;
}
