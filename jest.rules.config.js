module.exports = {
  testMatch: ['<rootDir>/test/rules/**/*.test.ts'],
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
};
