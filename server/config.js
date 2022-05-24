let config


if (process.env.NODE_ENV == 'production') {
	config = {
		DB_CONNECTION_URL: 'mongodb://localhost:27017/video-cut-tool',
		BACKEND_URL: 'https://beta-videocuttool.wmflabs.org/api/',
		PORT: 4000,

		// Ouath 2
		CLIENT_ID: '',
		CLIENT_SECRET: ''
	};
}
else {
	config = {
		DB_CONNECTION_URL: 'mongodb://videocuttool-mongo:27017/video-cut-tool',
		BACKEND_URL: 'https://beta-videocuttool.wmflabs.org/api/',
		PORT: 4000,

		// Ouath 2
		CLIENT_ID: '',
		CLIENT_SECRET: ''
	};
}

export default config;
