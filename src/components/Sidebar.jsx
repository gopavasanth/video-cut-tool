import React, { useState, useEffect, useContext, useRef } from 'react';
import { Image, Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { CircleHalf, Globe2, X } from 'react-bootstrap-icons';
import PopupTools from 'popup-tools';
import { Message } from '@wikimedia/react.i18n';
import logo from '../logo.svg';
import { localesList } from '../utils/languages';
import { AppContext } from '../context';
import { socket } from '../utils/socket';

function Sidebar(props) {
	const { appState, updateAppState } = useContext(AppContext);
	const { user, current_step: currentStep, current_locale: currentLocale } = appState;

	const [themeMode, setThemeMode] = useState('light');
	const localeName = useRef(false);

	useEffect(() => {
		localeName.current = currentLocale.native_name;

		// Set theme (dark or light) on load
		const theme = localStorage.getItem('theme') || 'light';
		document.body.setAttribute('theme', theme);
	}, [currentLocale]);

	/**
	 * Handle theme toggle between dark and light mode
	 */
	const onThemeSwitch = () => {
		const currentTheme = document.body.getAttribute('theme');
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';

		document.body.setAttribute('theme', newTheme);
		localStorage.setItem('theme', newTheme);
		setThemeMode(newTheme);
	};

	// Login redirect URL to the back-end server
	const onLogin = () => {
		PopupTools.popup(
			`${props.apiUrl}/login`,
			'Wiki Connect',
			{ width: 1000, height: 600 },
			(err, data) => {
				if (!err) {
					updateAppState({ user: data.user });
					localStorage.setItem('user', JSON.stringify(data.user));
					socket.emit('authenticate', data.user);
				}
			}
		);
	};

	const onLogOut = () => {
		localStorage.removeItem('user');
		updateAppState({
			user: null,
			notification: {
				type: 'info',
				messageId: 'Logged out successfully'
			}
		});

		document.querySelector('#logout-button').click();
	};

	const updateLocaleState = localeObj => {
		localStorage.setItem('localeObj', JSON.stringify(localeObj));
		localeName.current = localeObj.native_name;
		updateAppState({ current_locale: localeObj });
	};

	const closeSidebar = () => {
		document.body.setAttribute('data-sidebar', 'hide');
	};
	const popover = (
		<Popover id="popover-basic">
			<Popover.Header as="h3">
				<Message id="logout-confirm-text" />
			</Popover.Header>
			<Popover.Body>
				<Button variant="primary" size="sm" onClick={onLogOut}>
					<Message id="logout-confirm-yes" />
				</Button>
				<Button
					variant="light"
					size="sm"
					onClick={() => document.querySelector('#logout-button').click()}
				>
					<Message id="logout-confirm-no" />
				</Button>
			</Popover.Body>
		</Popover>
	);

	const localesListPopover = (
		<Popover id="locales-popover">
			<Popover.Header as="h3">Choose your language</Popover.Header>
			<Popover.Body>
				{Object.keys(localesList).map((code, index) => (
					<div
						className={`locale-item ${
							currentLocale && localesList[code].locale === currentLocale.locale && 'active'
						}`}
						title={localesList[code].name}
						value={localesList[code].locale}
						onClick={() => updateLocaleState(localesList[code])}
						key={`locale-${index}`}
					>
						{localesList[code].native_name}
					</div>
				))}
			</Popover.Body>
		</Popover>
	);

	const steps = [
		{
			class: 'get-file first-step',
			message: 'step-video-url'
		},
		{
			class: 'video-settings second-step',
			message: 'step-video-settings'
		},
		{
			class: 'results third-step',
			message: 'step-result'
		}
	];
	return (
		<div id="sidebar">
			<div className="close-sidebar" onClick={closeSidebar}>
				<X />
			</div>
			<div className="logo-wrapper">
				<Image alt="logo" src={logo} width="100" height="40" />
				<h1 className="text-white">VideoCutTool</h1>
			</div>
			<div className="user-wrapper mt-4">
				{!user && (
					<Button variant="secondary" onClick={onLogin}>
						Login
					</Button>
				)}

				{user && (
					<div className="d-flex flex-column align-items-center">
						<span style={{ color: 'white' }}>
							Welcome,{' '}
							<a
								className="text-white font-weight-bold"
								href={`https://commons.wikimedia.org/wiki/user:${user.username}`}
							>
								{user.username}
							</a>
						</span>
						<OverlayTrigger trigger="click" rootClose placement="bottom" overlay={popover}>
							<Button className="mt-2" variant="success" id="logout-button" size="sm">
								<Message id="logout" />
							</Button>
						</OverlayTrigger>
					</div>
				)}
			</div>
			<div className="site-options">
				<span className="darkmode-switch option-wrapper" onClick={onThemeSwitch}>
					<span className="option-icon">
						<CircleHalf size="15" />
					</span>
					<span className="option-title">
						{themeMode === 'dark' && <Message id="theme-darkmode" />}
						{themeMode === 'light' && <Message id="theme-lightmode" />}
					</span>
				</span>
				<span className="seprator">-</span>
				<OverlayTrigger trigger="click" rootClose placement="bottom" overlay={localesListPopover}>
					<span
						className="language-switch option-wrapper"
						title={currentLocale && currentLocale.native_name}
					>
						<span className="option-icon">
							<Globe2 />
						</span>
						<span className="option-title">{localeName.current}</span>
					</span>
				</OverlayTrigger>
			</div>
			<div className="steps-wrapper">
				{steps.map((step, index) => (
					<div
						key={`step-${index}`}
						className={`${step.class} ${index < currentStep && 'active'} step`}
					>
						<Message id={step.message} />
						<span className="step-index" />
					</div>
				))}
			</div>
		</div>
	);
}

export default Sidebar;
