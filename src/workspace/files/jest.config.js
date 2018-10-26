module.exports = {
    preset: "jest-preset-angular",
    setupTestFrameworkScriptFile: "<rootDir>/jest/setupJest.ts",
    coverageReporters: [
        "lcov"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!@ngrx|angular2-ui-switch|ng-dynamic)"
    ]
}
