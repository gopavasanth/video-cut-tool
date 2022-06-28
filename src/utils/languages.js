function getLanguagesFromDir() {
	const context = require.context('../i18n', true, /.json$/);
	const languages = {};
	context.keys().forEach(key => {
		const fileName = key.replace('./', '');
		const resource = context(key);
		const namespace = fileName.replace('.json', '').replace('-', '');

		if (namespace !== 'qqq') {
			languages[namespace] = { ...resource };
		}
	});
	return languages;
}

const localesList = {
	bn: {
		native_name: 'বাংলা',
		name: 'Bengali',
		locale: 'bn-BN'
	},
	ca: {
		native_name: 'Català',
		name: 'Catalan',
		locale: 'ca-CA'
	},
	da: {
		native_name: 'Dansk',
		name: 'Danish',
		locale: 'da-DA'
	},
	de: {
		native_name: 'Deutsch',
		name: 'German',
		locale: 'de-DE'
	},
	diq: {
		native_name: 'Zazaki',
		name: 'Dimli',
		locale: 'diq-DIQ'
	},
	en: {
		native_name: 'English',
		name: 'English',
		locale: 'en-US'
	},
	eo: {
		native_name: 'Esperanto',
		name: 'Esperanto',
		locale: 'eo-EO'
	},
	es: {
		native_name: 'Español',
		name: 'Spanish',
		locale: 'es-ES'
	},
	fi: {
		native_name: 'Suomi',
		name: 'Finnish',
		locale: 'fi-FI'
	},
	fr: {
		native_name: 'Français',
		name: 'French',
		locale: 'fr-FR'
	},
	he: {
		native_name: 'עברית',
		name: 'Hebrew',
		locale: 'he-HE'
	},
	hyw: {
		native_name: 'Հայերեն',
		name: 'Armenian',
		locale: 'hy-HY'
	},
	id: {
		native_name: 'Bahasa Indonesia',
		name: 'Indonesian',
		locale: 'id-ID'
	},
	it: {
		native_name: 'Italiano',
		name: 'Italian',
		locale: 'it-IT'
	},
	ja: {
		native_name: '日本語',
		name: 'Japanese',
		locale: 'ja-JA'
	},
	kn: {
		native_name: 'ಕನ್ನಡ',
		name: 'Kannada',
		locale: 'kn-KN'
	},
	ko: {
		native_name: '한국어',
		name: 'Korean',
		locale: 'ko-KO'
	},
	kulatn: {
		native_name: 'Kurdî',
		name: 'Kurdish',
		locale: 'kulatn-KU'
	},
	lb: {
		native_name: 'Lëtzebuergesch',
		name: 'Luxembourgish',
		locale: 'lb-LB'
	},
	mk: {
		native_name: 'Македонски',
		name: 'Macedonian',
		locale: 'mk-MK'
	},
	ms: {
		native_name: 'Bahasa Melayu',
		name: 'Malay',
		locale: 'ms-MS'
	},
	my: {
		native_name: 'Myanmasa',
		name: 'Burmese',
		locale: 'my-MY'
	},
	ptbr: {
		native_name: 'Português do Brasil',
		name: 'Portuguese - Brazil',
		locale: 'ptbr-PT'
	},
	ro: {
		native_name: 'Română',
		name: 'Romanian',
		locale: 'ru-RU'
	},
	ru: {
		native_name: 'Русский',
		name: 'Russian',
		locale: 'ru-RU'
	},
	scn: {
		native_name: 'Sicilianu',
		name: 'Sicilian',
		locale: 'scn-SCN'
	},
	sk: {
		native_name: 'Slovenčina',
		name: 'Slovak',
		locale: 'sk-SK'
	},
	srec: {
		native_name: 'Српски',
		name: 'Serbian',
		locale: 'srec-SREC'
	},
	sv: {
		native_name: 'Svenska',
		name: 'Swedish',
		locale: 'sv-SV'
	},
	te: {
		native_name: 'తెలుగు',
		name: 'Telugu',
		locale: 'te-TE'
	},
	tr: {
		native_name: 'Türkçe',
		name: 'Turkish',
		locale: 'tr-TR'
	},
	uk: {
		native_name: 'Українська',
		name: 'Ukrainian',
		locale: 'uk-UK'
	},
	vi: {
		native_name: 'Tiếng Việt',
		name: 'Vietnamese',
		locale: 'vi-VI'
	},
	zhhans: {
		native_name: 'Chinese Traditional',
		name: 'Chinese Traditional',
		locale: 'zhhant-ZH'
	},
	zhhant: {
		native_name: 'Chinese Simplified',
		name: 'Chinese Simplified',
		locale: 'zhhans-ZH'
	}
};

export { getLanguagesFromDir, localesList };
