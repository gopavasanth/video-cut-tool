import UserModel from '../models/User.js';

export default (socket, io) => {
	socket.on('authenticate', data => {
		UserModel.updateOne({ mediawikiId: data.mediawikiId }, { $set: { socketId: socket.id } })
			.then(() => {
				console.log('update socket id');
			})
			.catch(err => {
				console.log('error updating socket id');
			});
	});
};
