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
function addAppToWorkspaceFile(options, workspace) {
  return (host, context) => {
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
    // tslint:disable-next-line:no-any
    const project = {
      root: projectRoot,
      projectType: "application",
      architect: {
        e2e: {
          builder: "@angular-devkit/build-angular:protractor",
          options: {
            protractorConfig: `${projectRoot}protractor.conf.js`,
            devServerTarget: `${options.relatedAppName}:serve`
          },
          configurations: {
            production: {
              devServerTarget: `${options.relatedAppName}:serve:production`
            }
          }
        },
        lint: {
          builder: "@angular-devkit/build-angular:tslint",
          options: {
            tsConfig: `${projectRoot}tsconfig.e2e.json`,
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
    // TODO: throw if the project already exist.
    workspace.projects[options.name] = project;
    host.overwrite(
      config_1.getWorkspacePath(host),
      JSON.stringify(workspace, null, 2)
    );
  };
}
const projectNameRegexp = /^[a-zA-Z][.0-9a-zA-Z]*(-[.0-9a-zA-Z]*)*$/;
const unsupportedProjectNames = ["test", "ember", "ember-cli", "vendor", "app"];
function getRegExpFailPosition(str) {
  const parts = str.indexOf("-") >= 0 ? str.split("-") : [str];
  const matched = [];
  parts.forEach(part => {
    if (part.match(projectNameRegexp)) {
      matched.push(part);
    }
  });
  const compare = matched.join("-");
  return str !== compare ? compare.length : null;
}
function validateProjectName(projectName) {
  const errorIndex = getRegExpFailPosition(projectName);
  if (errorIndex !== null) {
    const firstMessage = core_1.tags.oneLine`
      Project name "${projectName}" is not valid. New project names must
      start with a letter, and must contain only alphanumeric characters or dashes.
      When adding a dash the segment after the dash must also start with a letter.
    `;
    const msg = core_1.tags.stripIndent`
      ${firstMessage}
      ${projectName}
      ${Array(errorIndex + 1).join(" ") + "^"}
    `;
    throw new schematics_1.SchematicsException(msg);
  } else if (unsupportedProjectNames.indexOf(projectName) !== -1) {
    throw new schematics_1.SchematicsException(
      `Project name "${projectName}" is not a supported name.`
    );
  }
}
function default_1(options) {
  return host => {
    validateProjectName(options.name);
    const workspace = config_1.getWorkspace(host);
    let newProjectRoot = workspace.newProjectRoot;
    let appDir = `${newProjectRoot}/${options.name}`;
    if (options.projectRoot !== undefined) {
      newProjectRoot = options.projectRoot;
      appDir = newProjectRoot;
    }
    return schematics_1.chain([
      addAppToWorkspaceFile(options, workspace),
      schematics_1.mergeWith(
        schematics_1.apply(schematics_1.url("./files"), [
          schematics_1.template(
            Object.assign({ utils: core_1.strings }, options, {
              dot: ".",
              appDir
            })
          ),
          schematics_1.move(appDir)
        ])
      )
    ]);
  };
}
exports.default = default_1;