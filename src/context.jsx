import React, { createContext, useState } from 'react';
import { IntlProvider } from '@wikimedia/react.i18n';
import { getLanguagesFromDir } from './utils/languages';

export const AppContext = createContext();

export const AppProvider = props => {
	const { children } = props;
	const defaultLocaleObj = {
		locale: 'en-US',
		name: 'English',
		native_name: 'English'
	};

	const initialAppState = {
		videos: [],
		current_step: 1,
		current_sub_step: '',
		video_url: '',
		file: null,
		user: null,
		socket: null,
		current_locale: JSON.parse(localStorage.getItem('localeObj')) || defaultLocaleObj,
		current_locale_object: {
			locale: 'en-US',
			native_name: 'English'
		},
		video_details: {},
		notifications: []
	};
	const [appState, setAppState] = useState(initialAppState);

	const updateAppState = newState => {
		let { notifications } = appState;

		// If notification object exist add to notifications array
		if ('notification' in newState) {
			// Add extra properties to notification object to control it
			const updateNotificationState = {
				...newState.notification,
				show: true,
				autohide: 'autohide' in newState.notification ? newState.notification.autohide : true,
				delay: 'delay' in newState.notification ? newState.notification.delay : 10000
			};

			// Create new notifications array
			notifications = [...appState.notifications, updateNotificationState];

			delete newState.notification;
		}
		return setAppState({ ...appState, ...newState, notifications });
	};

	const updateNotification = (newNotificationState, index) => {
		const notifications = [...appState.notifications];
		notifications[index] = { ...notifications[index], ...newNotificationState };

		return setAppState({
			...appState,
			notifications
		});
	};

	return (
		<AppContext.Provider value={{ appState, updateAppState, updateNotification }}>
			<IntlProvider locale={appState.current_locale.locale} messages={getLanguagesFromDir()}>
				{children}
			</IntlProvider>
		</AppContext.Provider>
	);
};
