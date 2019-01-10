import { strings } from '@angular-devkit/core';
import {
    Rule,
    apply,
    mergeWith,
    template,
    url
} from '@angular-devkit/schematics';
import { latestVersions } from '@schematics/angular/utility/latest-versions';
import { Schema as WorkspaceOptions } from './schema';

export default function(options: WorkspaceOptions): Rule {
    return mergeWith(apply(url('./files'), [
        template({
            utils: strings,
            ...options,
            'dot': '.',
            latestVersions
        })
    ]))
}