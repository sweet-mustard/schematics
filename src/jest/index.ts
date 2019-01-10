import { Schema as JestOptions } from './schema';
import {chain, mergeWith, apply, url, move, Tree} from '@angular-devkit/schematics';

export default function(options: JestOptions) {
    return (host: Tree) => {
        return chain([
            mergeWith(
                apply(url('./files'), [
                    move(`${options.projectRoot}`)
                ])
            )
        ])
    }
}