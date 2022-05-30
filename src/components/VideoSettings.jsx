import { useEffect, useState, useRef, useContext } from 'react';
import { ToggleButtonGroup, ButtonGroup, Button, ToggleButton } from 'react-bootstrap';
import {
	ArrowClockwise,
	ArrowCounterclockwise,
	VolumeMute,
	VolumeUpFill,
	Scissors,
	Crop,
	PlayCircle,
	XCircle
} from 'react-bootstrap-icons';
import { Message } from '@wikimedia/react.i18n';
import { AppContext } from '../context';

import DragResize from './DragResize';
import VideoProcess from './VideoProcess';
import Trim from './Trim';
import VideoPlayer from './VideoPlayer';
import { storeItem, getStoredItem, clearItems } from '../utils/storage';

/**
 * Handle videos settings UI and actions
 * @param {object} props Inherited props
 * @returns {string} Output
 */
function VideoSettings(props) {
	const { appState, updateAppState } = useContext(AppContext);

	const { video_url: videoUrl, current_sub_step: currentSubStep } = appState;
	const { socket, user } = props;

	const videoPlayer = useRef(null);
	const trims = useRef(null);
	const trimMode = useRef('single');

	// Hash to reset trim
	const trimHash = useRef(getStoredItem('video-trim-hash') || Date.now());

	const initialVideoManipulationData = {
		crop_x: 0,
		crop_y: 0,
		crop_height: 0,
		crop_width: 0,
		rotate_value: 3,
		mute: false
	};
	const videoManipulationData = useRef(initialVideoManipulationData);
	const [videoAttr, setVideoAttr] = useState({});
	const [videoReady, setVideoReady] = useState(false);

	// Set initial settings array for each of the settings
	const initialSettingsState = [
		{
			type: 'mute',
			title_id: 'setting-audio',
			modified: false,
			icon: VolumeMute
		},
		{
			type: 'rotate',
			title_id: 'setting-rotate',
			modified: false,
			icon: ArrowClockwise
		},
		{
			type: 'trim',
			title_id: 'setting-trim',
			modified: false,
			icon: Scissors
		},
		{
			type: 'crop',
			title_id: 'setting-crop',
			modified: false,
			icon: Crop
		}
	];

	const [settings, setSettings] = useState(initialSettingsState);
	const [canPreview, setCanPreview] = useState(false);
	const [currentSetting, setCurrentSetting] = useState(false);

	/**
	 * Update settings by first cloning the curret settings
	 * and then merging with the new ones
	 *
	 * @param {object} newSettings Object of newsettings
	 * @param {string} type Type of setting (trim, mute .. etc)
	 */
	const updateSettings = (newSettings, type = currentSetting.type) => {
		const storedSettings = maybeGetStoredSettings();
		const cloneSettings = [...storedSettings];
		const currentSettingIndex = settings.findIndex(setting => setting.type === type);
		cloneSettings[currentSettingIndex] = { ...cloneSettings[currentSettingIndex], ...newSettings };
		setSettings(cloneSettings);

		storeItem('video-settings', cloneSettings);

		// Update current setting
		setCurrentSetting({ ...currentSetting, ...newSettings });
	};

	/**
	 * If settings exist in localstorage then return them,
	 * otherwise return current state settings
	 * @returns {array} Array of objects of settings
	 */
	const maybeGetStoredSettings = () => {
		const storedVideoSettings = getStoredItem('video-settings');

		if (storedVideoSettings === null) {
			return settings;
		}

		const updatedSettings = settings.map((setting, index) => {
			setting.modified = storedVideoSettings[index].modified;
			return setting;
		});
		return updatedSettings;
	};

	const updateVideoManipulationData = newData => {
		const updatedManipulations = { ...videoManipulationData.current, ...newData };
		videoManipulationData.current = updatedManipulations;
		storeItem('video-manipulations', updatedManipulations);
	};

	useEffect(() => {
		if (currentSubStep !== '') {
			return;
		}
		// Check if manipulations is saved to localstorage and restore it
		const storedManipulations = getStoredItem('video-manipulations');

		if (storedManipulations !== null) {
			updateVideoManipulationData(storedManipulations);
		}
	}, [currentSubStep]);

	useEffect(() => {
		// Check if any value is modified and set preview to true
		const isModified = settings.filter(setting => setting.modified === true);

		setCanPreview(isModified.length > 0);

		if (videoPlayer.current !== null) {
			// videoPlayer.current.addEventListener('onplay', videoCanPlay);
			setVideoAttr(videoPlayer.current.getState());
		}
	});

	useEffect(() => {
		// console.log('VIDE', videoAttr);
	}, [videoAttr]);

	/**
	 * Callback to modify mute setting
	 *
	 * @param {boolean} change True to mute, false otherwise
	 */
	const muteAudio = change => {
		updateVideoManipulationData({
			mute: change
		});

		// Toggle mute on disolayed video
		const videoEl = document.querySelector('#video-player video');
		videoEl.muted = change;

		updateSettings({
			modified: change
		});
	};

	/**
	 * Callback to handle video rotation
	 * @param {int} newRotateValue New rotation value
	 */
	const changeRotation = newRotateValue => {
		if (newRotateValue < 0) newRotateValue = 3;
		if (newRotateValue > 3) newRotateValue = 0;

		const videoEl = document.querySelector('#video-player video');
		const videoWidth = videoEl.offsetWidth;
		const videoHeight = videoEl.offsetHeight;

		// rotate video according to rotate value
		const transformRotate = (newRotateValue + 1) * 90;
		let transform = `rotate(${transformRotate}deg)`;

		// if video is rotated 90 or 180 deg then add scale
		if (newRotateValue === 0 || newRotateValue === 2) {
			const scale = videoHeight / videoWidth;
			transform += ` scale(${scale})`;
		}

		// Apply transform
		document.querySelector('#video-player video').style.transform = transform;
		updateVideoManipulationData({
			rotate_value: newRotateValue
		});

		updateSettings({
			modified: newRotateValue !== 3
		});
	};

	/**
	 * This function is passed to child component to update
	 * crop date once changes have been committed by user
	 *
	 * @param {object} data Crop data
	 */
	const updateCropFromChild = data => {
		const { left, top, width, height } = data;
		const cropValues = {
			crop_x: left,
			crop_y: top,
			crop_height: height,
			crop_width: width
		};
		updateVideoManipulationData(cropValues);

		// If rotate value changed it will trigger crop rendering.
		// Prevent changing setting attributes if crop is not selected
		if (currentSetting.type === 'crop') {
			const isCropModified = left === 0 && top === 0 && width === 100 && height === 100;
			updateSettings({ modified: !isCropModified });
		}
	};

	/**
	 * This function is passed to child componenet to update trim state
	 *
	 * @param {string} type Setting type to change (trims, trimMode)
	 * @param {array|boolean} newValue Array of trim data, or boolean for trimMode type
	 */
	const updateTrimsFromChild = (type, newValue) => {
		let areTrimsModified = false;
		let isModeModified = false;
		const { duration } = videoAttr;
		if (type === 'trims') {
			trims.current = newValue;
			areTrimsModified =
				newValue.length > 1 ||
				parseFloat(newValue[0].from) !== 0 ||
				(parseFloat(newValue[0].to) !== parseFloat(duration.toFixed(2)) &&
					newValue[0].to < duration);
		} else if (type === 'trimMode') {
			trimMode.current = newValue;
			isModeModified = newValue !== 'single' || trims.current !== null;
		}

		updateSettings(
			{
				modified: areTrimsModified || isModeModified
			},
			'trim'
		);
	};

	/**
	 * Handle undo changes button for each setting type
	 */
	const undoChanges = () => {
		const { type } = currentSetting;
		switch (type) {
			case 'rotate':
				updateVideoManipulationData({ rotate_value: 3 });
				changeRotation(3);
				break;
			case 'mute':
				updateVideoManipulationData({ mute: false });
				break;
			case 'crop':
				setCurrentSetting({});
				break;
			case 'trim':
				trimHash.current = Date.now();
				clearItems(['video-trim-hash']);
				break;
			default:
				break;
		}
		updateSettings({ modified: false });
	};

	/**
	 * Move to process video screen if changes have been made
	 *
	 * @returns {void}
	 */
	const processVideo = () => {
		if (!canPreview) {
			return;
		}
		updateAppState({
			current_sub_step: 'process'
		});
	};

	/**
	 * Callback to set video to playbale state once canplay event is triggered
	 */
	const videoCanPlay = () => {
		setVideoReady(true);
	};

	const settingsComponent = (
		<div id="video-settings">
			<div className="video-wrapper">
				<VideoPlayer ref={videoPlayer} videoUrl={videoUrl} onCanPlay={videoCanPlay}>
					{videoPlayer.current && (
						<DragResize
							display={currentSetting.type === 'crop'}
							boundsEl="video"
							rotateValue={videoManipulationData.current.rotate_value}
							videoReady={videoReady}
							cropUpdater={updateCropFromChild}
						/>
					)}
				</VideoPlayer>
			</div>
			<div className="video-manipulations mt-5">
				<div className="video-manipulation-controls d-flex flex-column flex-md-row">
					<ToggleButtonGroup
						name="manipulations"
						className="video-manipulation-group"
						aria-label="Video Manipulation"
					>
						{settings.map((setting, idx) => (
							<ToggleButton
								variant="primary"
								id={`video-manipulation-${idx}`}
								key={idx}
								onChange={() => setCurrentSetting(setting)}
								type="radio"
								name="manipulation"
								checked={currentSetting.type === setting.type}
							>
								<setting.icon size={18} />
								{currentSetting.type === setting.type && (
									<span className="setting-title">
										<Message id={setting.title_id} />
									</span>
								)}
								{setting.modified && <span className="modified" />}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
					<div className="action-buttons-group ms-md-auto d-flex mt-3 mt-md-0">
						<Button
							variant="primary"
							className="me-5"
							disabled={canPreview === false}
							onClick={processVideo}
						>
							<PlayCircle />
							<span className="setting-title">
								<Message id="preview-text" />
							</span>
						</Button>

						<Button
							variant="danger"
							disabled={currentSetting.modified === false}
							onClick={undoChanges}
						>
							<XCircle />
							<span className="setting-title">Reset</span>
						</Button>
					</div>
				</div>
				<div className="video-manipulations-options mt-4">
					{currentSetting.type === 'rotate' && (
						<div className="rotate-options">
							<ButtonGroup className="me-2">
								<Button
									onClick={() => changeRotation(videoManipulationData.current.rotate_value - 1)}
								>
									<ArrowCounterclockwise size={18} />
									<span className="setting-title">Left</span>
								</Button>
								<Button
									onClick={() => changeRotation(videoManipulationData.current.rotate_value + 1)}
								>
									<ArrowClockwise size={18} />
									<span className="setting-title">Right</span>
								</Button>
							</ButtonGroup>
						</div>
					)}
					{currentSetting.type === 'mute' && (
						<div className="volume-options">
							<ToggleButtonGroup name="mute" className="me-2">
								<ToggleButton
									variant="primary"
									onClick={() => muteAudio(true)}
									type="radio"
									name="mute-options"
									checked={videoManipulationData.current.mute === true}
								>
									<VolumeMute size={18} />
									{videoManipulationData.current.mute === true && (
										<span className="setting-title">Disable</span>
									)}
								</ToggleButton>
								<ToggleButton
									variant="primary"
									type="radio"
									name="mute-options"
									onClick={() => muteAudio(false)}
									checked={videoManipulationData.current.mute === false}
								>
									<VolumeUpFill size={18} />
									{videoManipulationData.current.mute === false && (
										<span className="setting-title">Enable</span>
									)}
								</ToggleButton>
							</ToggleButtonGroup>
						</div>
					)}
					{videoPlayer.current && (
						<Trim
							hash={trimHash.current}
							display={currentSetting.type === 'trim'}
							player={videoPlayer.current}
							videoSelector="#video-player video"
							videoReady={videoAttr.canplay}
							trimsUpdater={updateTrimsFromChild}
						/>
					)}
				</div>
			</div>
		</div>
	);

	return currentSubStep !== 'process' ? (
		settingsComponent
	) : (
		<VideoProcess
			socket={socket}
			manipulations={videoManipulationData.current}
			settings={settings}
			user={user}
			trim={{ mode: trimMode.current, trims: trims.current }}
		/>
	);
}

export default VideoSettings;
