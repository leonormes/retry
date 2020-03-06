module.exports = function (config) {
	config.set({
		mutator: 'typescript',
		packageManager: 'npm',
		reporters: ["html", "clear-text", "progress", "dashboard"],
		testRunner: 'mocha',
		mochaOptions: {
			spec: ['dist/test/**/*.js'],
		},
		transpilers: [ 'typescript' ],
		testFramework: 'mocha',
		coverageAnalysis: 'perTest',
		tsconfigFile: 'tsconfig.json',
		mutate: ['src/**/*.ts'],
	});
};
