import { Server } from 'socket.io';
import { createServer } from 'http';
import app from './app.js';
import config from './config.js';
import socketController from './controllers/socket-controller.js';

const server = createServer(app);
const { PORT } = config;

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(PORT);

const io = new Server(server, {
	cors: {
		origin:
			process.env.NODE_ENV !== 'development'
				? 'https://videocuttool.wmcloud.org'
				: 'http://localhost:3000',
		methods: ['GET', 'POST'],
		credentials: true
	},
	transports: ['polling', 'websocket'],
	allowEIO3: true
});

io.sockets.on('connection', socket => {
	console.log('CONNECTED', socket.id);
	app.set('socketid', socket.id);
	socketController(socket, io);
});

app.set('socketio', io);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
	console.log(`Listening on ${bind}`);
}

server.on('error', onError);
server.on('listening', onListening);
