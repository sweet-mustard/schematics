import { normalize, strings, path } from '@angular-devkit/core';
import {
  Rule,
  SchematicsException,
  Tree,
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  template,
  url,
  schematic,
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { buildRelativePath, findModuleFromOptions } from '@schematics/angular/utility/find-module';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath, getProject } from '@schematics/angular/utility/project';
import { Schema as ModuleOptions } from './schema';


function addDeclarationToNgModule(options: ModuleOptions): Rule {
  return (host: Tree) => {
    if (!options.module) {
      return host;
    }

    const modulePath = options.module;

    const text = host.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const importModulePath = normalize(
      `/${options.path}/`
      + (options.flat ? '' : strings.dasherize(options.name) + '/')
      + strings.dasherize(options.name)
      + '.module',
    );
    const relativePath = buildRelativePath(modulePath, importModulePath);
    const changes = addImportToModule(source,
                                      modulePath,
                                      strings.classify(`${options.name}Module`),
                                      relativePath);

    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);

    return host;
  };
}

export default function (options: ModuleOptions): Rule {
  return (host: Tree) => {
    if (!options.project) {
      throw new SchematicsException('Option (project) is required.');
    }
    const project = getProject(host, options.project);

    if (options.path === undefined) {
      options.path = buildDefaultPath(project);
    }

    if (options.module) {
      options.module = findModuleFromOptions(host, options);
    }

    const parsedPath = parseName(options.path, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;

    const templateSource = apply(url('./files'), [
      options.routing ? noop() : filter(path => !path.endsWith('-routing.module.ts')),
      options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
      options.sandbox ? noop() : filter(path => !path.endsWith('.sandbox.ts') && !path.endsWith('.sandbox.spec.ts')),
      template({
        ...strings,
        'if-flat': (s: string) => options.flat ? '' : s,
        'dot': '.',
        ...options,
      }),
      move(parsedPath.path),
    ]);

    if(options.container){
        return chain([
            branchAndMerge(chain([
                addDeclarationToNgModule(options),
                mergeWith(templateSource),
            ])),
            schematic('container', {
                path: `${options.path}/${options.name}/containers`,
                name: options.name,
                project: options.project,
                skipImport: true
            })
        ])
    }else {
        return chain([
            branchAndMerge(chain([
                addDeclarationToNgModule(options),
                mergeWith(templateSource),
            ])),
        ]);
    }
  }
}
