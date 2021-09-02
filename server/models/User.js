import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
	id: String,
	username: String,
	mediawikiId: String,
	socketId: String,
	refreshToken: String,
	mediawikiToken: { type: String, select: false },
	mediawikiTokenSecret: { type: String, select: false }
});

UserSchema.pre('save', function (next) {
	const now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

UserSchema.statics.isObjectId = id => mongoose.Types.ObjectId.isValid(id);

UserSchema.statics.getObjectId = id => mongoose.Types.ObjectId(id);

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
