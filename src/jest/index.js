"use strict";
Object.defineProperty(exports,"__esModule", {value: true});

const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const config_1 = require("@schematics/angular/utility/config");

function default_1(options) {
    return host => {
        return schematics_1.chain([
            schematics_1.mergeWith(
                schematics_1.apply(schematics_1.url('./files'),[
                    schematics_1.move(`${options.projectRoot}`)
                ])
            )
        ]);
    }
}

exports.default = default_1;