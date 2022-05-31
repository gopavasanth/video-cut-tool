import React, { useContext, useEffect, useState } from 'react';
import { Image } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';

import UrlBox from './UrlBox';
import Results from './Results';
import Sidebar from './Sidebar';
import VideoSettings from './VideoSettings';
import { AppContext } from '../context';
import { socket } from '../utils/socket';
import Notification from './Notification';
import { clearItems, getStoredItem } from '../utils/storage';

import logo from '../logo.svg';
import '../style/main.css';
import '../style/dark-theme.css';

const settings = require('../env')();

const { backend_url } = settings;

socket.on('connect', () => {
	console.log('check 2', socket.connected);
});

socket.on('connect_error', err => {
	console.log(`connect_error due to ${err.message}`);
});

function Home() {
	const { appState, updateAppState } = useContext(AppContext);
	const { current_step: currentStep, notifications } = appState;
	const [showSidebar, setShowSidebar] = useState(false);
	const [title, setTitle] = useState('');
	useEffect(() => {
		// Clear localstorage
		clearItems([
			'video-manipulations',
			'video-settings',
			'video-trim-hash',
			'video-trims',
			'video-crop'
		]);

		// Update socket reference
		updateAppState({ socket });

		try {
			const userLocalStorage = getStoredItem('user');

			if (userLocalStorage) {
				updateAppState({ user: userLocalStorage });
			}
		} catch (e) {
			updateAppState({ user: null });
		}

		const location = window.location.href;
		if (location.indexOf('?') !== -1) {
			setTitle(`https://commons.wikimedia.org/wiki/File:${location.split('?')[1].split('=')[1]}`);
		} else {
			setTitle('');
		}
	}, []);

	const toggleSidebar = () => {
		const status = !showSidebar;
		document.body.setAttribute('data-sidebar', status ? 'show' : 'hide');
		setShowSidebar(status);
	};

	return (
		<div id="main-container">
			<Sidebar apiUrl={backend_url} />
			<div id="content" className="flex-column">
				<div className="logo-wrapper flex-sm-row">
					<span className="menu-icon" onClick={toggleSidebar}>
						<List size="25" />
					</span>
					<Image alt="logo" src={logo} width="100" height="40" />
					<h1 className="text-white">VideoCutTool</h1>
				</div>
				{currentStep === 1 && <UrlBox title={title} />}
				{currentStep === 2 && <VideoSettings user={appState.user} />}
				{currentStep === 3 && <Results />}
				<div className="footer-wrapper">
					<div className="footer">
						© 2019-
						{new Date().getFullYear()}{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://www.mediawiki.org/wiki/User:Gopavasanth"
						>
							<span>Gopa Vasanth</span>
						</a>
						, <b>Hassan Amin</b>,{' '}
						<a
							target="_blank"
							rel="noreferrer"
							href="https://wikitech.wikimedia.org/wiki/User:Khr2003"
						>
							<span>Abdul Al-Hasany</span>
						</a>{' '}
						|
						<a href="https://github.com/gopavasanth/video-cut-tool">
							<span> Github </span>
						</a>
						|
						<a href="https://creativecommons.org/licenses/by/4.0/">
							<span> CC BY SA 4.0 </span>
						</a>
					</div>
				</div>
			</div>

			{notifications.length > 0 && <Notification />}
		</div>
	);
}

export default Home;
