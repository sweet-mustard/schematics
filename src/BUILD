package(default_visibility=["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:defs.bzl", "npm_package")

ts_library(
    name = "schematics",
    srcs = glob(
        include = ["**/*.ts"],
        exclude = [
                "**/*.spec.ts",
                "**/*.spec_large.ts",
                "*/files/**/*.ts",
                "*/other-files/**/*.ts",
                "*/module-files/**/*.ts",
                "utility/test/**/*.ts"
            ]
        ),
    module_name = "@sweet-mustard/schematics",
    deps = [
        "@npm//@angular-devkit/core",
        "@npm//@angular-devkit/schematics",
        "@npm//@schematics/angular"
    ]
)

npm_package(
    name = "npm_package",
    srcs = [
        ":collection.json",
        ":package.json",
        ":README.md",
    ] + glob([
        "*/files/**/*",
        "*/other-files/**/*",
        "*/module-files/**/*",
        "*/schema.json",
    ]),
    packages = [
    ],
    deps = [
        ":schematics",
    ]
)
