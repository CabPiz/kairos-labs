import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/image$": "<rootDir>/__mocks__/next/image.tsx",
    "^next/link$": "<rootDir>/__mocks__/next/link.tsx",
    "^next/font/google$": "<rootDir>/__mocks__/next/font/google.ts",
    "^server-only$": "<rootDir>/__mocks__/server-only.ts",
    "\\.css$": "<rootDir>/__mocks__/styleMock.ts",
    // next-intl ships ESM-only — substituído por mocks CJS para Jest
    "^next-intl/server$": "<rootDir>/__mocks__/next-intl-server.ts",
    "^next-intl/middleware$": "<rootDir>/__mocks__/next-intl-middleware.ts",
    "^next-intl/routing$": "<rootDir>/__mocks__/next-intl-routing.ts",
    "^next-intl$": "<rootDir>/__mocks__/next-intl.ts",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "components/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "inngest/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};

export default config;
