import {apply, applyTemplates, chain, filter, mergeWith, move, noop, Rule, template, Tree, url} from "@angular-devkit/schematics";
import {Schema as SandboxOptions} from './schema';
import {strings} from "@angular-devkit/core";
import {parseName} from '@schematics/angular/utility/parse-name';
import {applyLintFix} from "@schematics/angular/utility/lint-fix";
import {createDefaultPath} from "@schematics/angular/utility/workspace";

export default function(options: SandboxOptions): Rule {
    return async (host: Tree) => {
        if(options.path === undefined){
            options.path = await createDefaultPath(host, options.project as string);
        }

        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;

        options.skipTests = options.skipTests || !options.spec;

        const templateSource = apply(url('./files'), [
            options.skipTests ? filter(path => !path.endsWith('.spec.ts.template')): noop(),
            applyTemplates({
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
