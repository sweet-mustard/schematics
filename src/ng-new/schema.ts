export interface Schema {
  directory?: string;
  name: string;
  skipInstall?: boolean;
  linkCli?: boolean;
  skipGit?: boolean;
  commit?: CommitUnion;
  newProjectRoot?: string;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: string;
  version: string;
  routing?: boolean;
  prefix?: string;
  style?: string;
  skipTests?: boolean;
  experimentalIvy?: boolean;
  createApplication?: boolean;
  strict?: boolean;
  packageManager: string;
  moduleName?: string;
}

export declare type CommitUnion = boolean | CommitObject;
export interface CommitObject {
  email: string;
  message?: string;
  name: string;
}
