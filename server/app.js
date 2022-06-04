import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
// import bodyParser from 'body-parser';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import PopupTools from 'popup-tools';

import { processVideo, uploadVideos, downloadVideo } from './controllers/router-controller.js';
import config from './config.js';
import UserModel from './models/User.js';
import auth from './auth.js';

function connectMongoDB(retry = 0) {
	const option = {
		socketTimeoutMS: 30000,
		keepAlive: true,
		useNewUrlParser: true,
		useUnifiedTopology: true
	};

	mongoose
		.connect(config.DB_CONNECTION_URL, option)
		.then(() => console.log('MongoDB Connected'))
		.catch(err => {
			console.log('error', '--------------------');
			console.log(err.message);
			console.log(config.DB_CONNECTION_URL);
			console.log(`Reconnecting to MongoDB ${retry}`);
		});
}

connectMongoDB();

const app = express();

const __dirname =
	process.env.NODE_ENV === 'production' ? `${path.resolve()}/` : `${path.resolve()}/server/`;

app.use('/api/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: 'tmp/', // so that they're publicly accessible
		limits: { fileSize: 500 * 1024 * 1024 },
		abortOnLimit: true
	})
);

app.use(logger('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cookieParser());

// Use CORS and File Upload modules here
app.use(cors());

app.use(
	session({
		secret: 'OAuth Session',
		saveUninitialized: true,
		resave: true
	})
);

/* GET home page. */
app.get('/', (req, res) => {
	res.json({ data: 'Homepage' });
});

app.get('/api/', (req, res) => {
	res.json({ data: 'Back-end is up' });
});

app.get('/api/error', (req, res) => {
	res.render('error', { error_message: req.session.error_message });
});

app.get('/test-auth', (req, res) => {
	+res.sendFile(path.join(`${__dirname}/test-auth.html`));
});

app.get('/api/login', (req, res) => {
	const baseUrl = 'https://commons.wikimedia.org';
	const endpoint = '/w/rest.php/oauth2/authorize';

	const url = new URL(baseUrl + endpoint);
	url.searchParams.append('response_type', 'code');
	url.searchParams.append('client_id', config.CLIENT_ID);

	res.send(res.redirect(url));
});

app.get('/api/auth/mediawiki/callback', auth, async (req, res) => {
	const {
		refresh_token: refreshToken,
		profile,
		profile: { sub }
	} = res.locals;

	const userProfile = JSON.parse(JSON.stringify(profile));
	userProfile.refreshToken = refreshToken;
	try {
		await UserModel.updateOne({ mediawikiId: sub }, userProfile, { upsert: true });
		const userDoc = await UserModel.findOne({ mediawikiId: sub }).exec();
		const { _id, mediawikiId, username, socketId } = userDoc;
		const returnUserDocData = {
			_id,
			mediawikiId,
			username,
			socketId
		};
		res.end(PopupTools.popupResponse({ user: returnUserDocData }));
	} catch (err) {
		console.log('************');
		console.log(err);
		const error = err.toJSON();
		req.session.error_message = error.message;
		res.redirect('/error');
	}
});

app.get('/api/logout', (req, res) => {
	delete req.session.user;
	res.redirect('/');
});

app.post('/api/process', processVideo);
app.post('/api/upload', uploadVideos);
app.get('/api/download/:videopath', downloadVideo);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error(`Not Found${req.originalUrl}`);
	err.status = 404;
	next(err);
});

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.log(err);

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;
