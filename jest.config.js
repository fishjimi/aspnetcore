module.exports = {
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                "tsconfig": "./tests/tsconfig.json",
                "diagnostics": true
            }
        ]
    },
    testEnvironment: "node",
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    testRunner: "jest-jasmine2",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
};
