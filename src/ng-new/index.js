"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
function default_1(options) {
  if (!options.name) {
    throw new schematics_1.SchematicsException(
      `Invalid options, "name" is required.`
    );
  }
  if (!options.directory) {
    options.directory = options.name;
  }
  const workspaceOptions = {
    name: options.name,
    version: options.version,
    experimentalAngularNext: options.experimentalIvy,
    newProjectRoot: options.newProjectRoot || "projects"
  };
  const applicationOptions = {
    projectRoot: "",
    name: options.name,
    experimentalIvy: options.experimentalIvy,
    inlineStyle: options.inlineStyle,
    inlineTemplate: options.inlineTemplate,
    prefix: options.prefix,
    viewEncapsulation: options.viewEncapsulation,
    routing: options.routing,
    style: options.style,
    skipTests: options.skipTests,
    skipPackageJson: false,
    moduleName: options.moduleName
  };
  return schematics_1.chain([
    schematics_1.mergeWith(
      schematics_1.apply(schematics_1.empty(), [
        schematics_1.schematic("workspace", workspaceOptions),
        schematics_1.schematic("application", applicationOptions),
        schematics_1.move(options.directory || options.name)
      ])
    ),
    (_host, context) => {
      let packageTask;
      if (!options.skipInstall) {
        packageTask = context.addTask(
          new tasks_1.NodePackageInstallTask(options.directory)
        );
        if (options.linkCli) {
          packageTask = context.addTask(
            new tasks_1.NodePackageLinkTask("@angular/cli", options.directory),
            [packageTask]
          );
        }
      }
      if (!options.skipGit) {
        const commit =
          typeof options.commit == "object"
            ? options.commit
            : !!options.commit
              ? {}
              : false;
        context.addTask(
          new tasks_1.RepositoryInitializerTask(options.directory, commit),
          packageTask ? [packageTask] : []
        );
      }
    }
  ]);
}
exports.default = default_1;
