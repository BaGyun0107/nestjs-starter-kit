const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {}
});

module.exports = [
  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
      ecmaVersion: 2020
    },
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    ],
    root: true,
    env: {
      node: true,
      es2020: true,
      jest: true
    },
    ignorePatterns: ['node_modules/'],
    rules: {
      'linebreak-style': 0,
      'comma-dangle': ['error', 'never'],
      'no-console': ['off', { allow: ['warn', 'error', 'info'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      'consistent-return': 'error',
      'arrow-body-style': ['error', 'always'],
      'spaced-comment': [
        'error',
        'always',
        { markers: ['-', '+', '?', '!', '*', '/'] }
      ],
      'operator-linebreak': ['off', 'before'],
      'no-restricted-syntax': [
        'off',
        'FunctionExpression',
        'WithStatement',
        "BinaryExpression[operator='in']"
      ],
      'no-prototype-builtins': 'off',
      'no-case-declarations': 'off',
      'object-curly-newline': ['off'],
      'no-undef': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  })
];
