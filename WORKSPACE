http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/0.20.3.zip",
    strip_prefix = "rules_typescript-0.20.3",
)

http_archive(
    name = "angular",
    url = "https://github.com/angular/angular/archive/7.0.1.zip",
    strip_prefix = "angular-7.0.1",
)

load("@angular//packages/bazel:package.bzl", "rules_angular_dependencies")
rules_angular_dependencies()

load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()

load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

load("@build_bazel_rules_nodejs//:package.bzl", "rules_nodejs_dependencies")
rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")
node_repositories()

yarn_install(
  name = "npm",
  package_json = "//:package.json",
  yarn_lock = "//:yarn.lock",
)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()