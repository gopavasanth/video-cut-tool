module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: ['airbnb-base'],
	parserOptions: {
		ecmaVersion: 12,
		sourceType: 'module'
	},
	rules: {
		indent: [2, 'tab', { SwitchCase: 1 }],
		'no-tabs': 0,
		'linebreak-style': 0,
		'comma-dangle': ['error', 'never'],
		'no-new': 0,
		camelcase: 0,
		'arrow-body-style': ['error', 'as-needed'],
		'arrow-parens': ['error', 'as-needed'],
		'operator-linebreak': ['error', 'after'],
		'object-curly-newline': [
			'error',
			{
				ObjectPattern: { multiline: true }
			}
		],
		'no-console': 0
	}
};
