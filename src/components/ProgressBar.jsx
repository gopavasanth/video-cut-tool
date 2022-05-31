import React from 'react';
import { Spinner, ProgressBar } from 'react-bootstrap';
import { Message } from '@wikimedia/react.i18n';
import '../style/progress-bar.css';

function Progress(props) {
	const { info } = props;
	if (typeof info === 'undefined' || info === null) {
		return <Spinner animation="border" />;
	}
	const { bitrate, frame, progress: progressPercentage, speed, time } = info;

	return (
		<div id="progress-bar-wrapper">
			<div className="progress-bar-info">
				<div className="progress-info-container">
					<span className="progress-info-title">
						<Message id="progress-bitrate" />
					</span>
					<span className="progress-info-value">{bitrate}</span>
				</div>
				<div className="progress-info-container">
					<span className="progress-info-title">
						<Message id="progress-time" />
					</span>
					<span className="progress-info-value">{time}</span>
				</div>
				<div className="progress-info-container">
					<span className="progress-info-title">
						<Message id="progress-speed" />
					</span>
					<span className="progress-info-value">{speed}</span>
				</div>
				<div className="progress-info-container">
					<span className="progress-info-title">
						<Message id="progress-frame" />
					</span>
					<span className="progress-info-value">{frame}</span>
				</div>
			</div>
			{!progressPercentage && <div className="progress-bar-indeterminate" />}
			{progressPercentage && <ProgressBar animated now={progressPercentage} />}
		</div>
	);
}
export default Progress;
