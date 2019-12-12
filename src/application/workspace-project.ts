import { experimental } from '@angular-devkit/core';
import {
  AppShellBuilderTarget,
  BrowserBuilderTarget,
  E2EBuilderTarget,
  ExtractI18nBuilderTarget,
  LibraryBuilderTarget,
  LintBuilderTarget,
  ProjectType,
  ServeBuilderTarget,
  ServerBuilderTarget
} from '@schematics/angular/utility/workspace-models';

export interface WorkspaceProject<TProjectType extends ProjectType = ProjectType.Application>
  extends experimental.workspace.WorkspaceProject {
  /**
   * Project type.
   */
  projectType: ProjectType;
  /**
   * Tool options.
   */
  architect?: WorkspaceTargets<TProjectType>;
  /**
   * Tool options.
   */
  targets?: WorkspaceTargets<TProjectType>;
}
export interface WorkspaceTargets<TProjectType extends ProjectType = ProjectType.Application> {
  build?: TProjectType extends ProjectType.Library ? LibraryBuilderTarget : BrowserBuilderTarget;
  server?: ServerBuilderTarget;
  lint?: LintBuilderTarget;
  test?: TestBuilderTarget;
  serve?: ServeBuilderTarget;
  e2e?: E2EBuilderTarget;
  'app-shell'?: AppShellBuilderTarget;
  'extract-i18n'?: ExtractI18nBuilderTarget;
  [key: string]: any;
}

export declare type TestBuilderTarget = any;
