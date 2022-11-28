module.exports = {
    env: {
      browser: true,
      commonjs: false,
      es6: true,
    },
    extends: [
      'airbnb-base',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 6,
    },
    plugins: [
      '@typescript-eslint',
    ],
    rules: {
      'max-len': ['error', { code: 120 }],
      'no-unused-vars': 'on',
      '@typescript-eslint/no-unused-vars': ['error'],
      'import/no-unresolved': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'lines-between-class-members': 'off',
      'no-underscore-dangle': 'off',
      'no-useless-constructor': 'off',
      'class-methods-use-this': 'off',
      'no-empty-function': 'off',
      'function-paren-newline': 'off',
      'linebreak-style': 'off',
      'no-param-reassign': 'off',
      'no-plusplus': 'off',
      'indent': 'on',
      '@typescript-eslint/indent': [2, 2],
    },
    settings: {
      'import/resolver': 'webpack',
    },
  };