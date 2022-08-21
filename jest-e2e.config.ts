/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import jestConfig from "./jest.config";

const { testMatch, ...jestRestConfig } = jestConfig;

export default {
  ...jestRestConfig,
  maxConcurrency: 1,
  maxWorkers: 1,
  testRegex: ".e2e.spec.ts$",
};
