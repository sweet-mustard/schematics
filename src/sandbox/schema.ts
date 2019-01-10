export interface Schema {
    name: string;
    path: string;
    project: string;
    flat: boolean;
    spec: boolean;
    lintFix: boolean;
}