module.exports = {
    root: true,
    extends: [
        'expo',
        '@react-native',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-native'],
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'react-native/no-unused-styles': 'warn',
        'react-native/no-inline-styles': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
};