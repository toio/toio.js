const ERROR = 2

module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['header'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    'header/header': [
      ERROR,
      'block',
      [
        '*',
        {
          pattern: ' \\* Copyright \\(c\\) \\d{4}-present\\, Sony Interactive Entertainment Inc\\.',
          template: ' * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.',
        },
        ' *',
        ' * This source code is licensed under the MIT license found in the',
        ' * LICENSE file in the root directory of this source tree.',
        ' ',
      ],
    ],
  },
}
