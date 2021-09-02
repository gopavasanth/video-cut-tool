import axios from 'axios';
import config from './config.js';

export default async (req, res, next) => {
	const { code } = req.query;
	const { CLIENT_ID, CLIENT_SECRET } = config;

	const params = new URLSearchParams();
	params.append('grant_type', 'authorization_code');
	params.append('code', code);
	params.append('scope', 'public');
	params.append('client_id', CLIENT_ID);
	params.append('client_secret', CLIENT_SECRET);

	try {
		const fetchDataRes = await axios.request({
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			url: '/w/rest.php/oauth2/access_token',
			method: 'post',
			baseURL: 'https://commons.wikimedia.org',
			data: params
		});

		const { access_token: accessToken, refresh_token: refreshToken } = fetchDataRes.data;
		res.locals.refresh_token = refreshToken;

		const userData = await axios.request({
			headers: { Authorization: `Bearer ${accessToken}` },
			url: '/w/rest.php/oauth2/resource/profile',
			method: 'get',
			baseURL: 'https://commons.wikimedia.org'
		});
		res.locals.profile = userData.data;

		next();
	} catch (err) {
		const error = err.toJSON();
		req.session.error_message = error.message;
		res.redirect('/error');
	}
};
