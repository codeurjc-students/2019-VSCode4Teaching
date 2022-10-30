module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./test/unitSuite'],
  testResultsProcessor: 'jest-sonar-reporter',
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  transformIgnorePatterns: ['/node_modules/(?!axios/)'],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  }
};
