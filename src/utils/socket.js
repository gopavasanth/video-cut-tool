import { io } from 'socket.io-client';

const { backend_url, socket_io_url, socket_io_path } = require('../env')();

export const API_URL = backend_url;
export const socket = io(
	process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000'
);
