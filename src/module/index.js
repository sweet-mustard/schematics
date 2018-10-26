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
const ts = require("typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const config_1 = require("@schematics/angular/utility/config");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const project_1 = require("@schematics/angular/utility/project");
const latest_versions_1 = require("@schematics/angular/utility/latest-versions");
function addDeclarationToNgModule(options) {
  return host => {
    if (!options.module) {
      return host;
    }
    const modulePath = core_1.normalize("/" + options.module);
    const text = host.read(modulePath);
    if (text === null) {
      throw new schematics_1.SchematicsException(
        `File ${modulePath} does not exist.`
      );
    }
    const sourceText = text.toString("utf-8");
    const source = ts.createSourceFile(
      modulePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true
    );
    const importModulePath = core_1.normalize(
      `/${options.path}/` +
        (options.flat ? "" : core_1.strings.dasherize(options.name) + "/") +
        core_1.strings.dasherize(options.name) +
        ".module"
    );
    const relativeDir = core_1.relative(
      core_1.dirname(modulePath),
      core_1.dirname(importModulePath)
    );
    const relativePath =
      (relativeDir.startsWith(".") ? relativeDir : "./" + relativeDir) +
      "/" +
      core_1.basename(importModulePath);
    const changes = ast_utils_1.addImportToModule(
      source,
      modulePath,
      core_1.strings.classify(`${options.name}Module`),
      relativePath
    );
    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof change_1.InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);
    return host;
  };
}
function removeSweetMustardFiles(options) {
  return schematics_1.chain([
    (tree, context) => {
      tree.delete(`${options.path}/${options.name}/containers/swmu.txt`);
      tree.delete(`${options.path}/${options.name}/components/swmu.txt`);
    }
  ]);
}
function default_1(options) {
  return host => {
    const workspace = config_1.getWorkspace(host);
    if (!options.project) {
      throw new schematics_1.SchematicsException(
        "Option (project) is required."
      );
    }
    const project = workspace.projects[options.project];
    if (options.path === undefined) {
      options.path = project_1.buildDefaultPath(project);
    }
    if (options.module) {
      options.module = find_module_1.findModuleFromOptions(host, options);
    }
    const parsedPath = parse_name_1.parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;
    const templateSource = schematics_1.apply(schematics_1.url("./files"), [
      options.spec
        ? schematics_1.noop()
        : schematics_1.filter(path => !path.endsWith(".spec.ts")),
      options.routing
        ? schematics_1.noop()
        : schematics_1.filter(path => !path.endsWith("-routing.module.ts")),
      options.sandbox
        ? schematics_1.noop()
        : schematics_1.filter(
            path =>
              !path.endsWith(".sandbox.ts") &&
              !path.endsWith(".sandbox.spec.ts")
          ),
      schematics_1.template(
        Object.assign(
          {},
          core_1.strings,
          { "if-flat": s => (options.flat ? "" : s) },
          options
        )
      ),
      schematics_1.template(
        Object.assign({ utils: core_1.strings }, options, {
          dot: ".",
          latestVersions: latest_versions_1.latestVersions
        })
      ),
      schematics_1.move(parsedPath.path)
    ]);

    if (options.container) {
      return schematics_1.chain([
        schematics_1.branchAndMerge(
          schematics_1.chain([
            addDeclarationToNgModule(options),
            schematics_1.mergeWith(templateSource)
          ])
        ),
        schematics_1.schematic("container", {
          path: `${options.path}/${options.name}/containers`,
          name: options.name,
          project: options.project,
          skipImport: true
        })
      ]);
    } else {
      return schematics_1.chain([
        schematics_1.branchAndMerge(
          schematics_1.chain([
            addDeclarationToNgModule(options),
            schematics_1.mergeWith(templateSource)
          ])
        )
      ]);
    }
  };
}
exports.default = default_1;
