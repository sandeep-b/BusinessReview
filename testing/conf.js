// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  suites: {
    loginSuite:"./loginTestCases/login-spec.js"
  },
  multiCapabilities: [
    //{browserName: 'firefox'},
    //{browserName: 'ie'},
    {browserName: 'chrome'}
  ],
  maxSessions: 1,
  resultJsonOutputFile: './protractor-report.json'
}