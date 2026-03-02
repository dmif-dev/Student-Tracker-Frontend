/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
        'utils/**/*.ts',
        'services/**/*.ts',
        'models/**/*.ts',
        'constants/**/*.ts',
        'validators/**/*.ts'
    ],
    coverageThreshold: {
        global: {
            lines: 80
        }
    }
};
