module.exports = {
    root: true,
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    ignorePatterns: ["node_modules", "dist", ".next", ".expo"],
    overrides: [
        {
            files: ["**/*.ts", "**/*.tsx"],
            parser: "@typescript-eslint/parser",
            extends: [
                "plugin:@typescript-eslint/recommended",
                "plugin:react/recommended",
                "plugin:react-hooks/recommended",
            ],
            plugins: ["@typescript-eslint", "react"],
            settings: {
                react: {
                    version: "detect",
                },
            },
            rules: {
                "react/react-in-jsx-scope": "off", // Not needed in React 17+
            },
        },
    ],
};
