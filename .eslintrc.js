// Disable all a11y rules
const a11y = require('eslint-plugin-jsx-a11y');

const a11yOff = Object.keys(a11y.rules).reduce((acc, rule) => {
	acc[`jsx-a11y/${rule}`] = 'off';
	return acc;
}, {});

module.exports = {
	env: {
		browser: true,
		es6: true
	},
	extends: ['plugin:react/recommended', 'airbnb'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018
	},
	plugins: ['react', 'react-hooks'],
	settings: {
		'import/resolver': {
			alias: {
				map: [['@', './src']]
			}
		}
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-tabs': 0,
		indent: ['warn', 'tab', { SwitchCase: 1 }],
		'comma-dangle': 0,
		'arrow-parens': 0,
		'object-curly-newline': [
			'warn',
			{
				ImportDeclaration: { minProperties: 6, consistent: false, multiline: true }
			}
		],
		radix: 0,
		camelcase: ['warn', { ignoreDestructuring: true, properties: 'never' }],
		'arrow-body-style': ['warn', 'as-needed'],
		'no-param-reassign': 0,
		'no-underscore-dangle': 0,
		'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
		'no-use-before-define': ['warn'],
		'no-shadow': ['warn'],
		'consistent-return': ['warn'],
		'operator-linebreak': ['off'],
		'import/no-extraneous-dependencies': ['warn'],
		'prefer-template': ['warn'],
		'object-shorthand': ['warn'],
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
		'react/self-closing-comp': ['warn'],
		'react/jsx-indent': [2, 'tab'],
		'react/jsx-indent-props': [2, 'tab'],
		'react/prop-types': ['off'],
		'react/jsx-props-no-spreading': ['warn'],
		'react/destructuring-assignment': ['warn'],
		'react/jsx-one-expression-per-line': ['warn'],
		'react/no-array-index-key': ['off'],
		...a11yOff
	}
};
