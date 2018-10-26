"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const config_1 = require("@schematics/angular/utility/config");
const dependencies_1 = require("@schematics/angular/utility/dependencies");
const latest_versions_1 = require("@schematics/angular/utility/latest-versions");
const validation_1 = require("@schematics/angular/utility/validation");
// TODO: use JsonAST
// function appendPropertyInAstObject(
//   recorder: UpdateRecorder,
//   node: JsonAstObject,
//   propertyName: string,
//   value: JsonValue,
//   indent = 4,
// ) {
//   const indentStr = '\n' + new Array(indent + 1).join(' ');
//   if (node.properties.length > 0) {
//     // Insert comma.
//     const last = node.properties[node.properties.length - 1];
//     recorder.insertRight(last.start.offset + last.text.replace(/\s+$/, '').length, ',');
//   }
//   recorder.insertLeft(
//     node.end.offset - 1,
//     '  '
//     + `"${propertyName}": ${JSON.stringify(value, null, 2).replace(/\n/g, indentStr)}`
//     + indentStr.slice(0, -2),
//   );
// }
function addDependenciesToPackageJson() {
  return host => {
    [
      {
        type: dependencies_1.NodeDependencyType.Dev,
        name: "@angular/compiler-cli",
        version: latest_versions_1.latestVersions.Angular
      },
      {
        type: dependencies_1.NodeDependencyType.Dev,
        name: "@angular-devkit/build-angular",
        version: latest_versions_1.latestVersions.DevkitBuildAngular
      },
      {
        type: dependencies_1.NodeDependencyType.Dev,
        name: "typescript",
        version: latest_versions_1.latestVersions.TypeScript
      }
    ].forEach(dependency =>
      dependencies_1.addPackageJsonDependency(host, dependency)
    );
    return host;
  };
}
function addAppToWorkspaceFile(options, workspace) {
  // TODO: use JsonAST
  // const workspacePath = '/angular.json';
  // const workspaceBuffer = host.read(workspacePath);
  // if (workspaceBuffer === null) {
  //   throw new SchematicsException(`Configuration file (${workspacePath}) not found.`);
  // }
  // const workspaceJson = parseJson(workspaceBuffer.toString());
  // if (workspaceJson.value === null) {
  //   throw new SchematicsException(`Unable to parse configuration file (${workspacePath}).`);
  // }
  let projectRoot =
    options.projectRoot !== undefined
      ? options.projectRoot
      : `${workspace.newProjectRoot}/${options.name}`;
  if (projectRoot !== "" && !projectRoot.endsWith("/")) {
    projectRoot += "/";
  }
  const rootFilesRoot =
    options.projectRoot === undefined ? projectRoot : projectRoot + "src/";
  const schematics = {};
  if (
    options.inlineTemplate === true ||
    options.inlineStyle === true ||
    options.style !== "css"
  ) {
    schematics["@schematics/angular:component"] = {};
    if (options.inlineTemplate === true) {
      schematics["@schematics/angular:component"].inlineTemplate = true;
    }
    if (options.inlineStyle === true) {
      schematics["@schematics/angular:component"].inlineStyle = true;
    }
    if (options.style && options.style !== "css") {
      schematics["@schematics/angular:component"].styleext = options.style;
    }
  }
  if (options.skipTests === true) {
    [
      "class",
      "component",
      "directive",
      "guard",
      "module",
      "pipe",
      "service"
    ].forEach(type => {
      if (!(`@schematics/angular:${type}` in schematics)) {
        schematics[`@schematics/angular:${type}`] = {};
      }
      schematics[`@schematics/angular:${type}`].spec = false;
    });
  }
  const project = {
    root: projectRoot,
    sourceRoot: core_1.join(core_1.normalize(projectRoot), "src"),
    projectType: "application",
    prefix: options.prefix || "app",
    schematics,
    architect: {
      build: {
        builder: "@angular-devkit/build-angular:browser",
        options: {
          outputPath: `dist/${options.name}`,
          index: `${projectRoot}src/index.html`,
          main: `${projectRoot}src/main.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.app.json`,
          assets: [
            core_1.join(core_1.normalize(projectRoot), "src", "favicon.ico"),
            core_1.join(core_1.normalize(projectRoot), "src", "assets")
          ],
          styles: [`${projectRoot}src/styles.${options.style}`],
          scripts: []
        },
        configurations: {
          production: {
            fileReplacements: [
              {
                replace: `${projectRoot}src/environments/environment.ts`,
                with: `${projectRoot}src/environments/environment.prod.ts`
              }
            ],
            optimization: true,
            outputHashing: "all",
            sourceMap: false,
            extractCss: true,
            namedChunks: false,
            aot: true,
            extractLicenses: true,
            vendorChunk: false,
            buildOptimizer: true
          }
        }
      },
      serve: {
        builder: "@angular-devkit/build-angular:dev-server",
        options: {
          browserTarget: `${options.name}:build`
        },
        configurations: {
          production: {
            browserTarget: `${options.name}:build:production`
          }
        }
      },
      "extract-i18n": {
        builder: "@angular-devkit/build-angular:extract-i18n",
        options: {
          browserTarget: `${options.name}:build`
        }
      },
      test: {
        builder: "@angular-devkit/build-angular:karma",
        options: {
          main: `${projectRoot}src/test.ts`,
          polyfills: `${projectRoot}src/polyfills.ts`,
          tsConfig: `${rootFilesRoot}tsconfig.spec.json`,
          karmaConfig: `${rootFilesRoot}karma.conf.js`,
          styles: [`${projectRoot}src/styles.${options.style}`],
          scripts: [],
          assets: [
            core_1.join(core_1.normalize(projectRoot), "src", "favicon.ico"),
            core_1.join(core_1.normalize(projectRoot), "src", "assets")
          ]
        }
      },
      lint: {
        builder: "@angular-devkit/build-angular:tslint",
        options: {
          tsConfig: [
            `${rootFilesRoot}tsconfig.app.json`,
            `${rootFilesRoot}tsconfig.spec.json`
          ],
          exclude: ["**/node_modules/**"]
        }
      }
    }
  };
  // tslint:disable-next-line:no-any
  // const projects: JsonObject = (<any> workspaceAst.value).projects || {};
  // tslint:disable-next-line:no-any
  // if (!(<any> workspaceAst.value).projects) {
  //   // tslint:disable-next-line:no-any
  //   (<any> workspaceAst.value).projects = projects;
  // }
  return config_1.addProjectToWorkspace(workspace, options.name, project);
}
function default_1(options) {
  return (host, context) => {
    if (!options.name) {
      throw new schematics_1.SchematicsException(
        `Invalid options, "name" is required.`
      );
    }
    validation_1.validateProjectName(options.name);
    const prefix = options.prefix || "app";
    const appRootSelector = `${prefix}-root`;
    const componentOptions = {
      inlineStyle: options.inlineStyle,
      inlineTemplate: options.inlineTemplate,
      spec: !options.skipTests,
      styleext: options.style,
      viewEncapsulation: options.viewEncapsulation
    };
    const workspace = config_1.getWorkspace(host);
    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    let sourceRoot = `${appDir}/src`;
    let sourceDir = `${sourceRoot}/app`;
    let relativePathToWorkspaceRoot = appDir
      .split("/")
      .map(x => "..")
      .join("/");
    const rootInSrc = options.projectRoot !== undefined;
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = `${newProjectRoot}/src`;
      sourceRoot = appDir;
      sourceDir = `${sourceRoot}/app`;
      relativePathToWorkspaceRoot = core_1.relative(
        core_1.normalize("/" + sourceRoot),
        core_1.normalize("/")
      );
      if (relativePathToWorkspaceRoot === "") {
        relativePathToWorkspaceRoot = ".";
      }
    }
    const tsLintRoot = appDir;
    const e2eOptions = {
      name: `${options.name}-e2e`,
      relatedAppName: options.name,
      rootSelector: appRootSelector
    };
    if (options.projectRoot !== undefined) {
      e2eOptions.projectRoot = "e2e";
    }
    const jestOptions = {
      relatedAppName: options.name,
      projectRoot: "jest"
    };
    return schematics_1.chain([
      addAppToWorkspaceFile(options, workspace),
      options.skipPackageJson
        ? schematics_1.noop()
        : addDependenciesToPackageJson(),
      schematics_1.mergeWith(
        schematics_1.apply(schematics_1.url("./files/src"), [
          schematics_1.template(
            Object.assign({ utils: core_1.strings }, options, {
              dot: ".",
              latestVersions: latest_versions_1.latestVersions
            })
          ),
          schematics_1.move(sourceRoot)
        ])
      ),
      schematics_1.mergeWith(
        schematics_1.apply(schematics_1.url("./files/root"), [
          schematics_1.template(
            Object.assign({ utils: core_1.strings }, options, {
              dot: ".",
              relativePathToWorkspaceRoot,
              rootInSrc
            })
          ),
          schematics_1.move(appDir)
        ])
      ),
      schematics_1.mergeWith(
        schematics_1.apply(schematics_1.url("./files/lint"), [
          schematics_1.template(
            Object.assign({ utils: core_1.strings }, options, {
              tsLintRoot,
              relativePathToWorkspaceRoot,
              prefix
            })
          )
        ])
      ),

      schematics_1.externalSchematic("@schematics/angular", "module", {
        name: "app",
        commonModule: false,
        flat: true,
        routing: options.routing,
        routingScope: "Root",
        path: `${sourceDir}`,
        spec: false,
        project: options.name
      }),
      schematics_1.mergeWith(
          schematics_1.apply(schematics_1.url('./module-files'),[
              schematics_1.template(
                  options
              ),
              schematics_1.move(sourceDir)
          ]),
          schematics_1.MergeStrategy.Overwrite
      ),
      schematics_1.schematic(
        "container",
        Object.assign(
          {
            name: "root",
            selector: appRootSelector,
            flat: true,
            path: `${sourceDir}/containers/root`,
            skipImport: true,
            project: options.name
          },
          componentOptions
        )
      ),
      schematics_1.mergeWith(
        schematics_1.apply(schematics_1.url("./other-files"), [
          componentOptions.inlineTemplate
            ? schematics_1.filter(path => !path.endsWith(".html"))
            : schematics_1.noop(),
          !componentOptions.spec
            ? schematics_1.filter(path => !path.endsWith(".spec.ts"))
            : schematics_1.noop(),
          schematics_1.template(
            Object.assign(
              { utils: core_1.strings },
              options,
              { selector: appRootSelector },
              componentOptions
            )
          ),
            schematics_1.move(`${sourceDir}/containers/root`)
        ]),
        schematics_1.MergeStrategy.Overwrite
      ),
      schematics_1.schematic("e2e", e2eOptions),
      schematics_1.schematic("jest",jestOptions),
      schematics_1.schematic("module", {
        name: options.moduleName ? options.moduleName : options.name,
        path: `${sourceRoot}/modules`,
        project: options.name
      })
    ]);
  };
}
exports.default = default_1;
