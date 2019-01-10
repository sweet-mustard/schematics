import { Rule, SchematicsException, Tree, apply, chain, filter, mergeWith, move, noop, template, url } from "@angular-devkit/schematics";
import { Schema as SandboxOptions } from './schema';
import { strings } from "@angular-devkit/core";
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath, getProject } from '@schematics/angular/utility/project';
import { applyLintFix } from "@schematics/angular/utility/lint-fix";

export default function(options: SandboxOptions): Rule {
    return (host: Tree) => {
        if(!options.project){
            throw new SchematicsException('Option (project) is required.');
        }

        const project = getProject(host,options.project);

        if(options.path === undefined){
            options.path = buildDefaultPath(project);
        }

        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;

        const templateSource = apply(url('./files'), [
            options.spec ? noop() : filter(path => !path.endsWith('.spec.ts')),
            template({
                ...strings,
                'if-flat': (s: string) => options.flat ? '' : s,
                ...options,
            }),
            move(parsedPath.path),
        ]);

        return chain([
            mergeWith(templateSource),
            options.lintFix ? applyLintFix(options.path): noop(),
        ]);
    };
}