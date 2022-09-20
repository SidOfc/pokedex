module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    plugins: ['solid'],
    extends: ['eslint:recommended', 'plugin:solid/recommended'],
    overrides: [{files: ['.eslintrc.cjs'], env: {node: true}}],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {},
};
