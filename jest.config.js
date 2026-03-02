/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@passl/core$': '<rootDir>/packages/core/src',
    '^@passl/(.*)$': '<rootDir>/packages/$1/src'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.base.json'
    }]
  }
};
