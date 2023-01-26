module.exports = {
	extends: ['@ptsecurity/commitlint-config'],
	rules: {
		'scope-enum': [
			2,
			'always',
			[
				'accounts',
				'activity',
				'assets',
				'backup',
				'boost',
				'contacts',
				'lang',
				'lightning',
				'onboarding',
				'profile',
				'receive',
				'recovery',
				'restore',
				'scan',
				'security',
				'send',
				'settings',
				'suggestions',
				'tokens',
				'transfer',
				'ui',
				'wallet',
				'widgets',
			],
		],
	},
	ignores: [(msg) => /\bWIP\b/i.test(msg)],
};
