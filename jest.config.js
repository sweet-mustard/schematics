module.exports = {
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    coverageReporters: [
        "lcov"
    ],
    transform: {
        "\\.(ts)$": "ts-jest"
    },
    testMatch: [
        "**/__tests__/**/*.(ts|js)?(x)",
        "**/?(*.)+(spec|test).(ts|js)?(x)"
    ],
    testPathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/src/.*(files)"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!@ngrx|angular2-ui-switch|ng-dynamic)"
    ]
};
