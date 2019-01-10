import { JsonObject, join, normalize, relative, strings } from '@angular-devkit/core';
import {
  MergeStrategy,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  schematic,
  template,
  url,
  externalSchematic,
} from '@angular-devkit/schematics';
import { Schema as E2eOptions } from '../e2e/schema';
import {
  addProjectToWorkspace,
  getWorkspace,
} from '@schematics/angular/utility/config';
import { NodeDependencyType, addPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { validateProjectName } from '@schematics/angular/utility/validation';
import {
  Builders,
  ProjectType,
  WorkspaceProject,
  WorkspaceSchema,
} from '@schematics/angular/utility/workspace-models';
import { Schema as ApplicationOptions } from './schema';

function addDependenciesToPackageJson() {
  return (host: Tree) => {
    [
      {
        type: NodeDependencyType.Dev,
        name: '@angular/compiler-cli',
        version: latestVersions.Angular,
      },
      {
        type: NodeDependencyType.Dev,
        name: '@angular-devkit/build-angular',
        version: latestVersions.DevkitBuildAngular,
      },
      {
        type: NodeDependencyType.Dev,
        name: 'typescript',
        version: latestVersions.TypeScript,
      },
    ].forEach(dependency => addPackageJsonDependency(host, dependency));

    return host;
  };
}

function addAppToWorkspaceFile(options: ApplicationOptions, workspace: WorkspaceSchema): Rule {
  let projectRoot = options.projectRoot !== undefined
    ? options.projectRoot
    : `${workspace.newProjectRoot}/${options.name}`;
  if (projectRoot !== '' && !projectRoot.endsWith('/')) {
    projectRoot += '/';
  }
  const rootFilesRoot = options.projectRoot === undefined
    ? projectRoot
    : projectRoot + 'src/';

  const schematics: JsonObject = {};

  if (options.inlineTemplate === true
    || options.inlineStyle === true
    || options.style !== 'css') {
    schematics['@schematics/angular:component'] = {};
    if (options.inlineTemplate === true) {
      (schematics['@schematics/angular:component'] as JsonObject).inlineTemplate = true;
    }
    if (options.inlineStyle === true) {
      (schematics['@schematics/angular:component'] as JsonObject).inlineStyle = true;
    }
    if (options.style && options.style !== 'css') {
      (schematics['@schematics/angular:component'] as JsonObject).styleext = options.style;
    }
  }

  if (options.skipTests === true) {
    ['class', 'component', 'directive', 'guard', 'module', 'pipe', 'service'].forEach((type) => {
      if (!(`@schematics/angular:${type}` in schematics)) {
        schematics[`@schematics/angular:${type}`] = {};
      }
      (schematics[`@schematics/angular:${type}`] as JsonObject).spec = false;
    });
  }

  const project: WorkspaceProject = {
    root: projectRoot,
    sourceRoot: join(normalize(projectRoot), 'src'),
    projectType: ProjectType.Application,
    prefix: options.prefix || 'app',
    schematics,
    architect: {
      build: {
        builder: Builders.Browser,
        options: {
          outputPath: `dist/${options.name}`,
          index: `${projectRoot}src/index.html`,
          main: `${projectRoot}src/main.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.app.json`,
          assets: [
            join(normalize(projectRoot), 'src', 'favicon.ico'),
            join(normalize(projectRoot), 'src', 'assets'),
          ],
          styles: [
            `${projectRoot}src/styles/app.scss`,
          ],
          scripts: [],
        },
        configurations: {
          production: {
            fileReplacements: [{
              replace: `${projectRoot}src/environments/environment.ts`,
              with: `${projectRoot}src/environments/environment.prod.ts`,
            }],
            optimization: true,
            outputHashing: 'all',
            sourceMap: false,
            extractCss: true,
            namedChunks: false,
            aot: true,
            extractLicenses: true,
            vendorChunk: false,
            buildOptimizer: true,
            budgets: [{
              type: 'initial',
              maximumWarning: '2mb',
              maximumError: '5mb',
            }],
          },
        },
      },
      serve: {
        builder: Builders.DevServer,
        options: {
          browserTarget: `${options.name}:build`,
        },
        configurations: {
          production: {
            browserTarget: `${options.name}:build:production`,
          },
        },
      },
      'extract-i18n': {
        builder: Builders.ExtractI18n,
        options: {
          browserTarget: `${options.name}:build`,
        },
      },
      test: {
        builder: Builders.Karma,
        options: {
          main: `${projectRoot}src/test.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.spec.json`,
          karmaConfig: `${rootFilesRoot}karma.conf.js`,
          styles: [
            `${projectRoot}src/styles.${options.style}`,
          ],
          scripts: [],
          assets: [
            join(normalize(projectRoot), 'src', 'favicon.ico'),
            join(normalize(projectRoot), 'src', 'assets'),
          ],
        },
      },
      lint: {
        builder: Builders.TsLint,
        options: {
          tsConfig: [
            `${rootFilesRoot}tsconfig.app.json`,
            `${rootFilesRoot}tsconfig.spec.json`,
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
      },
    }
  };

  return addProjectToWorkspace(workspace, options.name, project);
}

function minimalPathFilter(path: string): boolean {
  const toRemoveList: RegExp[] = [/e2e\//, /editorconfig/, /README/, /karma.conf.js/,
                                  /protractor.conf.js/, /test.ts/, /tsconfig.spec.json/,
                                  /tslint.json/, /favicon.ico/];

  return !toRemoveList.some(re => re.test(path));
}

export default function (options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException(`Invalid options, "name" is required.`);
    }
    validateProjectName(options.name);
    const prefix = options.prefix || 'app';
    const appRootSelector = `${prefix}-root`;
    const componentOptions =   {
      inlineStyle: options.inlineStyle,
      inlineTemplate: options.inlineTemplate,
      spec: !options.skipTests,
      styleext: options.style,
      viewEncapsulation: options.viewEncapsulation,
    };

    const workspace = getWorkspace(host);
    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    let sourceRoot = `${appDir}/src`;
    let sourceDir = `${sourceRoot}/app`;
    let relativePathToWorkspaceRoot = appDir.split('/').map(x => '..').join('/');
    const rootInSrc = options.projectRoot !== undefined;
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = `${newProjectRoot}/src`;
      sourceRoot = appDir;
      sourceDir = `${sourceRoot}/app`;
      relativePathToWorkspaceRoot = relative(normalize('/' + sourceRoot), normalize('/'));
      if (relativePathToWorkspaceRoot === '') {
        relativePathToWorkspaceRoot = '.';
      }
    }
    const tsLintRoot = appDir;

    const e2eOptions: E2eOptions = {
      name: `${options.name}-e2e`,
      relatedAppName: options.name,
      rootSelector: appRootSelector,
      projectRoot: newProjectRoot ? `${newProjectRoot}/${options.name}-e2e` : 'e2e',
    };

    const jestOptions = {
        relatedAppName: options.name,
        projectRoot: "jest"
      };

    return chain([
      addAppToWorkspaceFile(options, workspace),
      options.skipPackageJson ? noop() : addDependenciesToPackageJson(),
      mergeWith(
        apply(url('./files/src'), [
          template({
            utils: strings,
            ...options,
            'dot': '.'
          }),
          move(sourceRoot),
        ])),
      mergeWith(
        apply(url('./files/root'), [
          template({
            utils: strings,
            ...options,
            'dot': '.',
            relativePathToWorkspaceRoot,
            rootInSrc,
          }),
          move(appDir),
        ])),
      mergeWith(
        apply(url('./files/lint'), [
          template({
            utils: strings,
            ...options,
            tsLintRoot,
            relativePathToWorkspaceRoot,
            prefix,
          }),
          // TODO: Moving should work but is bugged right now.
          // The __tsLintRoot__ is being used meanwhile.
          // Otherwise the tslint.json file could be inside of the root folder and
          // this block and the lint folder could be removed.
        ])),
      externalSchematic('@schematics/angular','module', {
        name: 'app',
        commonModule: false,
        flat: true,
        routing: options.routing,
        routingScope: 'Root',
        path: sourceDir,
        spec: false,
        project: options.name,
      }),
      mergeWith(
          apply(url('./module-files'), [
              template(options),
              move(sourceDir)
          ]), MergeStrategy.Overwrite
      ),
      schematic('container', {
        name: 'root',
        selector: appRootSelector,
        flat: true,
        path: `${sourceDir}/containers/root`,
        skipImport: true,
        project: options.name,
        ...componentOptions,
      }),
      mergeWith(
        apply(url('./other-files'), [
          componentOptions.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
          !componentOptions.spec ? filter(path => !path.endsWith('.spec.ts')) : noop(),
          template({
            utils: strings,
            ...options as any,  // tslint:disable-line:no-any
            selector: appRootSelector,
            ...componentOptions,
          }),
          move(`${sourceDir}/containers/root`),
        ]), MergeStrategy.Overwrite),
      schematic('e2e', e2eOptions),
      schematic('jest', jestOptions),
      schematic('module', {
        name: options.moduleName ? options.moduleName : options.name,
        path: `${sourceRoot}/modules`,
        project: options.name
      })
    ]);
  };
}