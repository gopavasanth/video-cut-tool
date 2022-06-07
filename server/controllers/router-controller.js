import path from 'path';
import axios from 'axios';
import { Worker } from 'worker_threads';
import fs from 'fs';
import FormData from 'form-data';

import UserModel from '../models/User.js';
import config from '../config.js';
import utils from '../utils.js';

const __dirname = path.resolve();

export const uploadVideos = async (req, res) => {
	const BASE_URL = 'https://commons.wikimedia.org/w/api.php';
	const { CLIENT_ID, CLIENT_SECRET } = config;
	const { user } = req.body;

	try {
		// Get refresh token from user records
		const userData = await UserModel.findOne({ mediawikiId: user.mediawikiId }).select(
			'+refreshToken'
		);

		// Get access token to retrive CSRF token
		const { refreshToken } = userData;

		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('refresh_token', refreshToken);
		params.append('client_id', CLIENT_ID);
		params.append('client_secret', CLIENT_SECRET);

		const getAccessToken = await axios.request({
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			url: '/w/rest.php/oauth2/access_token',
			method: 'post',
			baseURL: 'https://commons.wikimedia.org',
			data: params
		});
		const { access_token: accessToken, refresh_token: newRefreshToken } = getAccessToken.data;

		// Update database with the new refresh token
		await UserModel.updateOne(
			{ mediawikiId: user.mediawikiId },
			{ $set: { refreshToken: newRefreshToken } }
		);

		// Get CSRF token
		const getCSRFToken = await axios.request({
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${accessToken}`
			},
			url: `${BASE_URL}?action=query&meta=tokens&format=json`,
			method: 'post'
		});

		const csrfToken = getCSRFToken.data.query.tokens.csrftoken;
		const { videos } = req.body;

		// Loop throug the videos and create an array axios requests
		const concurrentRequests = videos.map(video => {
			const { title, path: publicVideoPath, selectedOptionName, comment, text } = video;
			const filePath = path.join(__dirname, publicVideoPath);
			const file = fs.createReadStream(filePath);

			const uploadParams = new FormData();
			uploadParams.append('file', file, { knownLength: fs.statSync(filePath).size });
			uploadParams.append('filename', title);
			uploadParams.append('text', text.join('\r\n'));
			uploadParams.append('token', csrfToken);
			uploadParams.append('comment', comment);

			let url = `${BASE_URL}?action=upload&format=json`;
			if (selectedOptionName === 'overwrite') {
				url += '&ignorewarnings=true';
			}

			return axios({
				headers: {
					'Content-Length': uploadParams.getLengthSync(),
					Authorization: `Bearer ${accessToken}`,
					...uploadParams.getHeaders()
				},
				method: 'post',
				url,
				data: uploadParams
			});
		});

		// Using allSettled to make sure we run the code after successful attempts
		const responseAll = await Promise.allSettled(concurrentRequests);

		// Check for errors (processing errors, not server errors)
		responseAll.forEach(response => {
			const { upload } = response.value.data;

			// If warning exist then show the relevant message
			if (upload.result === 'Warning') {
				const {
					warnings: { exists }
				} = upload;

				if (exists !== undefined) {
					throw new Error('File with the same name already exists');
				}
			}
		});

		// Delete files after upload
		videos.forEach(video => {
			const { path: publicVideoPath } = video;
			utils.deleteFiles(publicVideoPath);
		});

		res.json({ success: true });
	} catch (error) {
		const { response } = error;
		if (response) {
			const { data, status } = response;
			console.log('ERROR', data);
			return res.json({ success: false, message: 'An error has occurred', status });
		}
		res.json({ success: false, message: error.message }); // 'An error occurred'
	}
};

export const processVideo = async (req, res) => {
	const io = req.app.get('socketio');
	const socketID = req.app.get('socketid');

	const uploadedFile = req.files?.file;
	try {
		let videoDownloadPath = null;
		// Handle file process from upload
		if (uploadedFile !== undefined) {
			const { name } = uploadedFile;
			const videoExtension = name.split('.').pop().toLowerCase();
			videoDownloadPath = path.join(
				__dirname,
				'videos',
				`video_${Date.now()}_${parseInt(Math.random() * 10000, 10)}.${videoExtension}`
			);

			// Create a promise for the callback
			await new Promise((resolve, reject) => {
				uploadedFile.mv(videoDownloadPath, err => (err ? reject(err) : resolve()));
			});
		}

		const { crop, inputVideoUrl, trimMode, trims, modified, rotateValue, videoName } = JSON.parse(
			req.body.data
		);

		const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
			workerData: {
				inputVideoUrl,
				videoDownloadPath,
				videoName,
				settings: {
					trims,
					trimMode,
					crop,
					modified,
					rotateValue
				}
			}
		});

		// Listen for a message from worker
		worker.on('message', payload => {
			io.to(socketID).emit('progress:update', payload);
		});

		worker.on('error', error => {
			console.log('WORKER ERROR', error);
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send('Something went wrong');
	}
	return res.status(200);
};

export const downloadVideo = (req, res) => {
	const file = `public/${req.params.videopath}`;

	// Set disposition and send it.
	res.download(file);
};
