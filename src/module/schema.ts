import { RoutingScope } from '@schematics/angular/module/schema';

export interface Schema {
  commonModule?: boolean;
  flat?: boolean;
  lintFix?: boolean;
  module?: string;
  name: string;
  path?: string;
  project?: string;
  prefix?: string;
  route?: string;
  routing?: boolean;
  routingScope?: RoutingScope;
  sandbox?: boolean;
  container?: boolean;
}
