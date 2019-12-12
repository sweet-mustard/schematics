export interface Schema {
  projectRoot?: string;
  name: string;
  enableIvy?: boolean;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  viewEncapsulation?: string;
  routing?: boolean;
  prefix?: string;
  style?: string;
  skipInstall?: boolean;
  skipTests?: boolean;
  skipPackageJson?: boolean;
  lintFix?: boolean;
  moduleName?: string;
}

export interface E2EOptions {
  rootSelector?: string;
  relatedAppName: string;
}
