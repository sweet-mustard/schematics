import { join, JsonObject, normalize, strings, JsonAstObject, parseJsonAst, JsonParseMode } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  schematic,
  SchematicContext,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/workspace';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { validateProjectName } from '@schematics/angular/utility/validation';
import { Builders, ProjectType } from '@schematics/angular/utility/workspace-models';
import { Schema as ApplicationOptions, E2EOptions } from './schema';
import { Schema as ComponentOptions } from '../component/schema';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Style } from '@schematics/angular/application/schema';
import { relativePathToWorkspaceRoot } from '@schematics/angular/utility/paths';
import { findPropertyInAstObject, insertPropertyInAstObjectInOrder } from '@schematics/angular/utility/json-utils';
import { applyLintFix } from '@schematics/angular/utility/lint-fix';
import { WorkspaceProject } from './workspace-project';

function addDependenciesToPackageJson(options: ApplicationOptions) {
  return (host: Tree, context: SchematicContext) => {
    [
      {
        type: NodeDependencyType.Dev,
        name: '@angular/compiler-cli',
        version: latestVersions.Angular
      },
      {
        type: NodeDependencyType.Dev,
        name: '@angular-devkit/build-angular',
        version: latestVersions.DevkitBuildAngular
      },
      {
        type: NodeDependencyType.Dev,
        name: 'typescript',
        version: latestVersions.TypeScript
      }
    ].forEach(dependency => addPackageJsonDependency(host, dependency));

    if (!options.skipInstall) {
      context.addTask(new NodePackageInstallTask());
    }

    return host;
  };
}

function readTsLintConfig(host: Tree, path: string): JsonAstObject {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not read ${path}.`);
  }

  const config = parseJsonAst(buffer.toString(), JsonParseMode.Loose);
  if (config.kind !== 'object') {
    throw new SchematicsException(`Invalid ${path}. Was expecting an object.`);
  }

  return config;
}

function mergeWithRootTsLint(parentHost: Tree) {
  return (host: Tree) => {
    const tsLintPath = '/tslint.json';
    if (!host.exists(tsLintPath)) {
      return;
    }

    const rootTslintConfig = readTsLintConfig(parentHost, tsLintPath);
    const appTslintConfig = readTsLintConfig(host, tsLintPath);

    const recorder = host.beginUpdate(tsLintPath);
    rootTslintConfig.properties.forEach(prop => {
      if (findPropertyInAstObject(appTslintConfig, prop.key.value)) {
        // property already exists. Skip!
        return;
      }

      insertPropertyInAstObjectInOrder(recorder, appTslintConfig, prop.key.value, prop.value.value, 2);
    });

    const rootRules = findPropertyInAstObject(rootTslintConfig, 'rules');
    const appRules = findPropertyInAstObject(appTslintConfig, 'rules');

    if (!appRules || appRules.kind !== 'object' || !rootRules || rootRules.kind !== 'object') {
      // rules are not valid. Skip!
      return;
    }

    rootRules.properties.forEach(prop => {
      insertPropertyInAstObjectInOrder(recorder, appRules, prop.key.value, prop.value.value, 4);
    });

    host.commitUpdate(recorder);

    // this shouldn't be needed but at the moment without this formatting is not correct.
    const content = readTsLintConfig(host, tsLintPath);
    host.overwrite(tsLintPath, JSON.stringify(content.value, undefined, 2));
  };
}

function addAppToWorkspaceFile(options: ApplicationOptions, appDir: string): Rule {
  let projectRoot = appDir;
  if (projectRoot) {
    projectRoot += '/';
  }

  const schematics: JsonObject = {};

  if (options.inlineTemplate === true || options.inlineStyle === true || options.style !== Style.Css) {
    const componentSchematicsOptions: JsonObject = {};
    if (options.inlineTemplate === true) {
      componentSchematicsOptions.inlineTemplate = true;
    }
    if (options.inlineStyle === true) {
      componentSchematicsOptions.inlineStyle = true;
    }

    componentSchematicsOptions.style = Style.Scss;

    schematics['@schematics/angular:component'] = componentSchematicsOptions;
    schematics['@sweet-mustard/schematics:component'] = componentSchematicsOptions;
    schematics['@sweet-mustard/schematics:container'] = componentSchematicsOptions;
  }

  if (options.skipTests === true) {
    ['class', 'component', 'directive', 'guard', 'module', 'pipe', 'service'].forEach(type => {
      if (!(`@schematics/angular:${type}` in schematics)) {
        schematics[`@schematics/angular:${type}`] = {};
      }
      (schematics[`@schematics/angular:${type}`] as JsonObject).spec = false;
    });

    ['component', 'container'].forEach(type => {
      if (!(`@sweet-mustard/schematics:${type}` in schematics)) {
        schematics[`@sweet-mustard/schematics:${type}`] = {};
      }
      (schematics[`@sweet-mustard/schematics:${type}`] as JsonObject).spec = false;
    });
  }

  const sourceRoot = join(normalize(projectRoot), 'src');

  const project: WorkspaceProject = {
    root: normalize(projectRoot),
    sourceRoot,
    projectType: ProjectType.Application,
    prefix: options.prefix || 'app',
    schematics,
    architect: {
      build: {
        builder: Builders.Browser,
        options: {
          outputPath: `dist/${options.name}`,
          index: `${sourceRoot}/index.html`,
          main: `${sourceRoot}/main.ts`,
          polyfills: `${sourceRoot}/polyfills.ts`,
          tsConfig: `${projectRoot}tsconfig.app.json`,
          aot: true,
          assets: [`${sourceRoot}/favicon.ico`, `${sourceRoot}/assets`],
          styles: [`${sourceRoot}/styles/app.scss`],
          scripts: []
        },
        configurations: {
          production: {
            fileReplacements: [
              {
                replace: `${sourceRoot}/environments/environment.ts`,
                with: `${sourceRoot}/environments/environment.prod.ts`
              }
            ],
            optimization: true,
            outputHashing: 'all',
            sourceMap: false,
            extractCss: true,
            namedChunks: false,
            aot: true,
            extractLicenses: true,
            vendorChunk: false,
            buildOptimizer: true,
            budgets: [
              {
                type: 'initial',
                maximumWarning: '2mb',
                maximumError: '5mb'
              },
              {
                type: 'anyComponentStyle',
                maximumWarning: '6kb',
                maximumError: '10kb'
              }
            ]
          }
        }
      },
      serve: {
        builder: Builders.DevServer,
        options: {
          browserTarget: `${options.name}:build`
        },
        configurations: {
          production: {
            browserTarget: `${options.name}:build:production`
          }
        }
      },
      'extract-i18n': {
        builder: Builders.ExtractI18n,
        options: {
          browserTarget: `${options.name}:build`
        }
      },
      test: {
        builder: '@angular-builders/jest:run',
        options: {
          configPath: './jest.config.js'
        }
      },
      lint: {
        builder: Builders.TsLint,
        options: {
          tsConfig: [`${projectRoot}tsconfig.app.json`, `${projectRoot}tsconfig.spec.json`],
          exclude: ['**/node_modules/**']
        }
      }
    }
  };

  return updateWorkspace(workspace => {
    if (workspace.projects.size === 0) {
      workspace.extensions.defaultProject = options.name;
    }

    workspace.projects.add({
      name: options.name,
      ...project
    });
  });
}

export default function(options: ApplicationOptions): Rule {
  return async (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }
    validateProjectName(options.name);
    const appRootSelector = `${options.prefix}-root`;
    const componentOptions: Partial<ComponentOptions> = {
      inlineStyle: options.inlineStyle,
      inlineTemplate: options.inlineTemplate,
      skipTests: options.skipTests,
      style: options.style,
      viewEncapsulation: options.viewEncapsulation
    };

    const workspace = await getWorkspace(host);
    let newProjectRoot = (workspace.extensions.newProjectRoot as string | undefined) || '';
    const isRootApp = options.projectRoot !== undefined;
    let appDir = isRootApp ? (options.projectRoot as string) : join(normalize(newProjectRoot), options.name);
    let sourceRoot = `${appDir}/src`;
    let sourceDir = `${appDir}/src/app`;

    const e2eOptions: E2EOptions = {
      relatedAppName: options.name,
      rootSelector: appRootSelector
    };

    return chain([
      addAppToWorkspaceFile(options, appDir),
      mergeWith(
        apply(url('./files'), [
          applyTemplates({
            utils: strings,
            ...options,
            relativePathToWorkspaceRoot: relativePathToWorkspaceRoot(appDir),
            appName: options.name,
            isRootApp,
            dot: '.'
          }),
          isRootApp ? mergeWithRootTsLint(host) : noop(),
          move(appDir)
        ]),
        MergeStrategy.Overwrite
      ),
      externalSchematic('@schematics/angular', 'module', {
        name: 'app',
        commonModule: false,
        flat: true,
        routing: options.routing,
        routingScope: 'Root',
        path: sourceDir,
        project: options.name
      }),
      mergeWith(
        apply(url('./module-files'), [
          applyTemplates({
            utils: strings,
            ...options,
            relativePathToWorkspaceRoot: relativePathToWorkspaceRoot(appDir),
            appName: options.name,
            isRootApp
          }),
          move(sourceDir)
        ]),
        MergeStrategy.Overwrite
      ),
      schematic('container', {
        name: 'root',
        selector: appRootSelector,
        flat: true,
        path: `${sourceDir}/containers/root`,
        skipImport: true,
        project: options.name,
        ...componentOptions
      }),
      mergeWith(
        apply(url('./other-files'), [
          componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html.template')) : noop(),
          componentOptions.skipTests ? filter(path => !path.endsWith('.spec.ts.template')) : noop(),
          applyTemplates({
            utils: strings,
            ...options,
            selector: appRootSelector,
            ...componentOptions
          }),
          move(`${sourceDir}/containers/root`)
        ]),
        MergeStrategy.Overwrite
      ),
      externalSchematic('@schematics/angular', 'e2e', e2eOptions),
      schematic('module', {
        name: options.moduleName ? options.moduleName : options.name,
        path: `${sourceRoot}/modules`,
        prefix: options.prefix,
        project: options.name
      }),
      options.skipPackageJson ? noop() : addDependenciesToPackageJson(options),
      options.lintFix ? applyLintFix(appDir) : noop()
    ]);
  };
}
