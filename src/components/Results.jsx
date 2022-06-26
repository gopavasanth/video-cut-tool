import axios from 'axios';

import React, { useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup, ToggleButton, Form, InputGroup } from 'react-bootstrap';
import {
	Upload,
	Download,
	ChevronUp,
	ChevronDown,
	CardHeading,
	CardText,
	ChatLeftTextFill
} from 'react-bootstrap-icons';
import { Message, BananaContext } from '@wikimedia/react.i18n';
import { AppContext } from '../context';
import VideoPlayer from './VideoPlayer';
import ProgressBar from './ProgressBar';

const ENV_SETTINGS = require('../env')();

const API_URL = ENV_SETTINGS.backend_url;

function Results() {
	const banana = useContext(BananaContext);
	const { appState, updateAppState } = useContext(AppContext);
	const { videos, user, video_details: videoDetails } = appState;
	const [videoState, setVideoState] = useState([]);
	const [showProgress, setShowProgress] = useState(false);

	const updateVideoState = (newState, index) => {
		const newVideoData = { ...videoState[index], ...newState };
		const newVideosState = [...videoState];
		newVideosState[index] = newVideoData;
		setVideoState(newVideosState);
	};

	useEffect(() => {
		const { title, author, comment = '' } = videoDetails;
		const [day, month, year] = new Date()
			.toLocaleDateString('en-GB', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit'
			})
			.split('/');

		const videosWithDetails = videos.map((video, index) => {
			const newTitle = title.split('.');
			return {
				path: video,
				title: `${newTitle[0]}_edited_${index}.${newTitle[1]}`,
				author,
				comment,
				text: [
					'=={{int:filedesc}}==',
					`{{Information${comment?.length > 0 ? `\n|description=${comment}` : ''}`,
					`|date=${`${year}-${month}-${day}`}`,
					`|source={{own}}${author?.length > 0 ? `\n|author=[[User:${author}|${author}]]` : ''}`,
					'}}\n',
					'=={{int:license-header}}==',
					'{{self|cc-by-sa-4.0}}\n',
					'[[Category:VideoCutTool]]\n',
					`{{Extracted from|File:${title}}}`
				],
				selectedOptionName: 'new-file',
				displayUploadToCommons: true
			};
		});
		setVideoState(videosWithDetails);
	}, []);

	const updateUploadType = (index, type) => {
		const data = {
			selectedOptionName: type
		};
		updateVideoState(data, index);
	};

	const updateTitle = (index, title) => {
		updateVideoState({ title }, index);
	};

	const updateUploadState = (index, status) => {
		updateVideoState({ displayUploadToCommons: status }, index);
	};

	const uploadVideos = async () => {
		setShowProgress(true);
		const uploadData = {
			upload: true,
			videos: videoState,
			user
		};

		try {
			const uploadResponse = await axios.post(`${API_URL}/upload`, uploadData);
			setShowProgress(false);

			const { data } = uploadResponse;

			const { success } = data;

			if (success === true) {
				updateAppState({
					notification: {
						type: 'success',
						messageId: 'task-uploaded-wikimedia-commons'
					},
					// Reset UI
					current_step: 1,
					current_sub_step: '',
					video_url: ''
				});
			} else {
				updateAppState({
					notification: {
						type: 'error',
						text: data.message
					}
				});
			}
		} catch (err) {
			setShowProgress(false);
			updateAppState({
				notification: {
					type: 'error',
					text: err.message
				}
			});
		}
	};

	return (
		<div id="results-container" data-show-progress={showProgress ? 'true' : 'false'}>
			<div className="videos-container">
				{videoState.map((video, index) => (
					<div className="video-results-wrapper" key={`wrapper-${index}`}>
						<div className="video-results-header">
							{video.title.length > 0 && <h5 title={video.title}>{video.title}</h5>}
							{video.title.length === 0 && <h5>(No Title)</h5>}
							<a
								href={`${API_URL}/download/${video.path.replace('/public', '')}`}
								className="btn btn-info me-4"
							>
								<Download />
								<span className="button-title">
									<Message id="step-result-choice-download" />
								</span>
							</a>

							<Button
								onClick={() => updateUploadState(index, !video.displayUploadToCommons)}
								variant="info"
							>
								{video.displayUploadToCommons && <ChevronUp />}
								{!video.displayUploadToCommons && <ChevronDown />}
								<span className="button-title">
									<Message id="step-result-choice-upload" />
								</span>
							</Button>
						</div>
						<div
							className={`video-results-body ${video.displayUploadToCommons === false && 'd-none'}`}
						>
							<div className="video-player-wrapper">
								<VideoPlayer videoUrl={`${API_URL}/${video.path}`} />
							</div>
							<div className="video-options">
								<div className="form-group">
									<ButtonGroup className="mb-2">
										<ToggleButton
											variant="secondary"
											onClick={() => updateUploadType(index, 'overwrite')}
											type="radio"
											name="upload-type"
											checked={video.selectedOptionName === 'overwrite'}
										>
											<span className="button-title">
												<Message id="upload-action-overwrite" />
											</span>
										</ToggleButton>
										<ToggleButton
											variant="secondary"
											onClick={() => updateUploadType(index, 'new-file')}
											type="radio"
											name="upload-type"
											checked={video.selectedOptionName === 'new-file'}
										>
											<span className="button-title">
												<Message id="upload-action-new-file" />
											</span>
										</ToggleButton>
									</ButtonGroup>
								</div>
								{video.selectedOptionName === 'new-file' && (
									<InputGroup className="mb-3" title={banana.i18n('upload-action-new-file-title')}>
										<InputGroup.Text>
											<CardHeading size="18" />
										</InputGroup.Text>

										<Form.Control
											type="text"
											defaultValue={video.title}
											onChange={e => updateTitle(index, e.target.value)}
										/>
									</InputGroup>
								)}
								<InputGroup className="mb-3" title={banana.i18n('upload-comment')}>
									<InputGroup.Text>
										<ChatLeftTextFill size="18" />
									</InputGroup.Text>

									<Form.Control type="text" defaultValue={video.comment} />
								</InputGroup>

								<InputGroup className="mb-3" title={banana.i18n('upload-text')}>
									<InputGroup.Text>
										<CardText size="18" />
									</InputGroup.Text>

									<Form.Control as="textarea" rows={15} defaultValue={video.text.join('\n')} />
								</InputGroup>
								<div className="upload-button d-flex justify-content-right">
									<Button onClick={uploadVideos}>
										<Upload />
										<span className="button-title ms-3">
											<Message id="upload-button" />
										</span>
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="upload-progress-container">
				<ProgressBar />
				<div className="current-process-task mt-4">
					<Message id="task-uploading-wikimedia-commons" />
				</div>
			</div>
		</div>
	);
}
export default Results;
