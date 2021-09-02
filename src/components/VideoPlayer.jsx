import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PlayFill, PauseFill } from 'react-bootstrap-icons';
import { Spinner } from 'react-bootstrap';
import { formatTime } from '../utils/time';
import '../style/video-player.css';

const VideoPlayer = forwardRef((props, forwardedRef) => {
	const { videoUrl, children } = props;

	// Manage touch and click events on one object
	const isTouch = 'ontouchstart' in window;
	const events = {
		POINTER_UP: isTouch ? 'touchend' : 'mouseup',
		POINTER_MOVE: isTouch ? 'touchmove' : 'mousemove'
	};

	const videoEl = useRef(null);
	const playbar = useRef(null);
	const playbarHandle = useRef(null);
	const playHandleDrag = useRef(false);

	const videoAttributes = {
		playing: false,
		canplay: false,
		loading: false,
		duration: 0,
		current_time: 0,
		currentSrc: videoUrl
	};

	const [videoAttr, setVideoAttr] = useState(videoAttributes);
	const [playHandlePosition, setPlayHandlePosition] = useState(0);

	useImperativeHandle(
		forwardedRef,
		() => ({
			getState: () => videoAttr
		}),
		[videoAttr]
	);

	const updateVideoAttr = newState => {
		setVideoAttr({ ...videoAttr, ...newState });
	};

	const onVideoPlaying = () => {
		updateVideoAttr({
			playing: true
		});
	};

	const onVideoPause = () => {
		updateVideoAttr({
			playing: false
		});
	};

	const onVideoLoadStart = () => {
		updateVideoAttr({
			loading: true
		});
	};
	const handleCanPlay = () => {
		const { onCanPlay } = props;
		updateVideoAttr({
			canplay: true,
			duration: videoEl.current.duration,
			videoWidth: videoEl.current.videoWidth,
			videoHeight: videoEl.current.videoHeight,
			loading: false
		});
		if (onCanPlay) {
			onCanPlay();
		}
	};
	const onVideoSeeking = () => {
		updateVideoAttr({
			loading: true
		});
	};

	const togglePlay = play => {
		if (videoEl.current === null) {
			return;
		}

		if (play) {
			videoEl.current.play();
			return;
		}
		videoEl.current.pause();
	};

	const onVideoTimeUpdate = () => {
		const { playing } = videoAttr;

		if (playing) {
			const { duration, currentTime } = videoEl.current;
			setPlayHandlePosition((currentTime * 100) / duration);
		}
		updateVideoAttr({ current_time: videoEl.current.currentTime });
	};

	const onVideoError = () => {
		const el = videoEl.current.error;

		updateVideoAttr({
			loading: false,
			error: true,
			error_message: el.message || ''
		});
	};

	const getFormattedDuration = () => {
		const formatDuration = formatTime(videoAttr.duration).split('.');
		return formatDuration[0];
	};
	const getFormattedCurrentTime = () => {
		const formatCurrentTime = formatTime(videoAttr.current_time).split('.');
		return formatCurrentTime[0];
	};

	const onPlayHandleDrag = e => {
		e.stopPropagation();
		if (playHandleDrag.current === false) {
			return;
		}
		const { duration } = videoAttr;
		const { left, width } = playbar.current.getBoundingClientRect();
		const mousePosition = e.clientX - left;

		// Update time
		const time = (mousePosition * duration) / width;
		videoEl.current.currentTime = Math.max(0, Math.min(time, duration));

		// update handle position
		const handlePosition = (mousePosition * 100) / width;
		const handlePositionRange = Math.max(0, Math.min(handlePosition, 100));

		setPlayHandlePosition(handlePositionRange);
	};

	const onPlayHandleStop = e => {
		e.stopPropagation();
		playHandleDrag.current = false;
	};

	useEffect(() => {
		if (videoEl.current === null) {
			return;
		}
		window.addEventListener(events.POINTER_MOVE, onPlayHandleDrag);
		window.addEventListener(events.POINTER_UP, onPlayHandleStop);

		return function () {
			window.removeEventListener(events.POINTER_MOVE, onPlayHandleDrag);
			window.removeEventListener(events.POINTER_UP, onPlayHandleStop);
		};
	});

	const updateTimeOnClick = e => {
		playHandleDrag.current = true;
		onPlayHandleDrag(e);
	};

	return (
		<div
			id="video-player-container"
			data-loading={videoAttr.loading === true ? 'true' : 'false'}
			data-error={videoAttr.error ? 'true' : 'false'}
		>
			<Spinner animation="border" variant="primary" />
			<div className="video-error-container">{videoAttr.error_message}</div>

			<div id="video-player">
				<video
					ref={videoEl}
					onPlaying={onVideoPlaying}
					onTimeUpdate={onVideoTimeUpdate}
					onPause={onVideoPause}
					onLoadStart={onVideoLoadStart}
					onCanPlay={handleCanPlay}
					onSeeking={onVideoSeeking}
					onError={onVideoError}
					src={videoUrl}
				/>
				{children}
			</div>

			{videoAttr.canplay && (
				<div className="video-controls-container">
					<div className="play-pause">
						{videoAttr.playing === false && (
							<div className="play-video" onClick={() => togglePlay(true)}>
								<PlayFill />
							</div>
						)}
						{videoAttr.playing === true && (
							<div className="pause-video" onClick={() => togglePlay(false)}>
								<PauseFill />
							</div>
						)}
					</div>

					<div className="play-bar" ref={playbar} onMouseDown={updateTimeOnClick}>
						<div
							className="play-bar-handle"
							ref={playbarHandle}
							style={{ left: `${playHandlePosition}%` }}
						/>
					</div>
					<div className="time">
						<div className="time-current">{getFormattedCurrentTime()}</div>
						<span>/</span>
						<div className="time-duration">{getFormattedDuration()}</div>
					</div>
				</div>
			)}
		</div>
	);
});

export default VideoPlayer;
