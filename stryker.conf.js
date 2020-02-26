module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress", "dashboard"],
    testRunner: "command",
    transpilers: ["typescript"],
    coverageAnalysis: "all",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/**/*.ts"]
  });
};
