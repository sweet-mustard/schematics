export interface Schema {
    projectRoot: string;
    name: string;
    inlineStyle?: boolean;
    inlineTemplate?: boolean;
    viewEncapsulation: string;
    routing?: boolean;
    prefix?: string;
    style?: string;
    skipTests?: boolean;
    skipPackageJson?: boolean;
    moduleName?: string;
}