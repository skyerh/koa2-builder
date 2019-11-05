process.chdir(__dirname);

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
    codeFrame: false
  },
  extends: [
    'airbnb-bundle',
  ],
  "env": {
    "es6": true,
    "node": true,
    "mocha": true
  },
  "rules": {
    "arrow-body-style": ["error", "always"],
    "indent": ["error", 2],
    "no-console": "off",
    "no-param-reassign": ["error", { "props": false }],
    "no-underscore-dangle": ["error", { "allow": ["_id", "__v"] }],
    "quotes": ["error", "single"],
    "one-var": ["error", { "separateRequires": true }],
    "prefer-destructuring": ["error", {"object": true, "array": false}],
    "semi": ["error", "never"]
  }
};