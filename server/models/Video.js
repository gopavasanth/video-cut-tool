import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const trimSchema = new Schema({
	from: Number,
	to: Number
});

const SettingsSchema = new Schema({
	mode: { type: String, enum: ['single', 'multiple'] },
	trimVideo: Boolean,
	disableAudio: Boolean,
	cropVideo: Boolean,

	out_width: Number,
	out_height: Number,
	x_value: Number,
	y_value: Number,
	rotateValue: Number,
	trims: [trimSchema]
});

const VideoSchema = new Schema({
	url: String,
	uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
	videoName: String,
	status: { type: String, enum: ['queued', 'processing', 'done', 'failed'] },
	stage: {
		type: String,
		enum: [
			'trimming',
			'concating',
			'rotating',
			'cropping',
			'losing audio',
			'converting video format'
		]
	},
	outputs: [String],
	settings: SettingsSchema,
	created_at: { type: Number, default: Date.now }
});

VideoSchema.pre('save', function (next) {
	const now = Date.now();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

VideoSchema.statics.isObjectId = id => mongoose.Types.ObjectId.isValid(id);

VideoSchema.statics.getObjectId = id => mongoose.Types.ObjectId(id);

const VideoModel = mongoose.model('Video', VideoSchema);
export default VideoModel;
