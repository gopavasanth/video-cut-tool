import React, { useState, useRef, useContext, useEffect } from 'react';
import { Message } from '@wikimedia/react.i18n';
import { Form, FormLabel } from 'react-bootstrap';
import axios from 'axios';
import { AppContext } from '../context';

function UrlBox(props) {
	const { updateAppState } = useContext(AppContext);

	const allowedExtensions = 'video/mp4,video/x-m4v,video/*';
	const [mouseHover, setMouseHover] = useState(false);
	const [title, setTitle] = useState('');
	const fileUpload = useRef(null);
	const dragEnter = () => {
		setMouseHover(true);
	};

	const dragLeave = () => {
		setMouseHover(false);
	};

	const dragOver = e => {
		e.preventDefault();
	};

	const dropped = e => {
		e.preventDefault();
		setMouseHover(false);
		onFileUpload(e);
	};

	useEffect(() => {
		setTitle(props.title);
		checkFileExist(props.title);
	}, [props.title]);

	const onFileUpload = e => {
		const files = (e.dataTransfer && e.dataTransfer.files) || e.nativeEvent.target.files;
		if (files.length === 0) {
			return;
		}

		const fileExt = files[0].name.split('.').pop();
		if (allowedExtensions.split(',').indexOf(fileExt) === -1) {
			alert('File extension not allowed');
			return;
		}

		updateAppState({
			current_step: 2,
			video_url: URL.createObjectURL(files[0]),
			file: files[0],
			video_details: {
				title: files[0].name.replace(/\s/g, '_')
			}
		});
	};

	/**
	 * Get video date from either commons site or user uploads
	 *
	 * @param {string} videoUrl Video Path
	 * @returns
	 */
	const retrieveVideoData = videoUrl => {
		const splitUrl = videoUrl.split('/');
		if (!videoUrl.includes('commons.wikimedia.org')) {
			return;
		}
		axios
			.get(
				`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=videoinfo&titles=${
					splitUrl[splitUrl.length - 1]
				}&viprop=user%7Curl%7Ccanonicaltitle%7Ccomment%7Curl&origin=*`
			)
			.then(response => {
				const { pages } = response.data.query;
				if (Object.keys(pages)[0] !== '-1') {
					const { user, canonicaltitle, comment, url } = pages[Object.keys(pages)[0]].videoinfo[0];
					updateAppState({
						current_step: 2,
						video_url: url,
						video_details: {
							author: user,
							title: decodeURIComponent(canonicaltitle.slice(5)).replace(/\s/g, '_'),
							comment
						}
					});
				}
			});
	};

	/**
	 * Check that video exist on commons site
	 *
	 * @param {string} filePath Video path
	 * @returns {void}
	 */
	const checkFileExist = filePath => {
		// First check if pattern File:(filename) exists
		const matchPath = filePath.match(/File:(.*)$/);
		if (matchPath === null) {
			return;
		}

		const fileName = matchPath[0];
		const baseUrl = 'https://commons.wikimedia.org/w/api.php?';
		const params = {
			action: 'query',
			titles: fileName,
			format: 'json',
			formatversion: 2,
			origin: '*'
		};
		axios
			.get(baseUrl, {
				params
			})
			.then(response => {
				const pageObj = response.data.query.pages[0];
				if ('missing' in pageObj) {
					return;
				}

				// File exists, retrieve video data
				retrieveVideoData(filePath);
			})
			.catch(error => {
				console.log(error);
			});
	};

	const onUrlInput = e => {
		setTitle(e.target.value);
		checkFileExist(e.target.value);
	};

	return (
		<div id="url-box" data-step-count="1">
			<div
				className="drop-area"
				data-mouseover={mouseHover ? 'true' : 'false'}
				onDragEnter={dragEnter}
				onDragLeave={dragLeave}
				onDragOver={dragOver}
				onDrop={dropped}
			>
				<div className="upload-info-message  mb-3 mb-md-5">
					<Message id="upload-upload-text" />
				</div>
				<FormLabel className="drop-area-click m-0" htmlFor="upload-file-input" ref={fileUpload} />
				<input
					className="d-none"
					ref={fileUpload}
					type="file"
					id="upload-file-input"
					accept={allowedExtensions}
					onChange={onFileUpload}
					autoComplete="on"
				/>
				<Form.Control
					type="text"
					className="upload-url-input w-50"
					placeholder="https://commons.wikimedia.org/wiki/File:video.webm"
					onChange={onUrlInput}
					autoComplete="true"
					value={title}
				/>
			</div>
		</div>
	);
}
export default UrlBox;
