import React, { useContext } from 'react';
import { Toast } from 'react-bootstrap';
import { InfoCircleFill, ExclamationCircleFill } from 'react-bootstrap-icons';
import { Message } from '@wikimedia/react.i18n';
import { AppContext } from '../context';

function Notification() {
	const { appState, updateNotification } = useContext(AppContext);
	const { notifications } = appState;

	const onToastClose = index => {
		updateNotification({ show: false }, index);
	};

	return (
		<div id="notification-wrapper">
			{notifications.map((notification, index) => (
				<Toast
					key={`notification-${index}`}
					onClose={() => onToastClose(index)}
					show={notification.show}
					data-type={notification.type}
					{...(notification.autohide && { delay: notification.delay, autohide: true })}
				>
					<div className="notification-icon">
						{notification.type !== 'error' && <InfoCircleFill />}
						{notification.type === 'error' && <ExclamationCircleFill />}
					</div>
					<div className="notification-header">
						<strong className="mr-auto">
							{notification.type !== 'error' && <Message id="notifications-title" />}
							{notification.type === 'error' && <Message id="notifications-title-error" />}
						</strong>
					</div>
					<div className="notification-body">
						{notification.messageId && <Message id={notification.messageId} />}
						{!notification.messageId && notification.text}
						<div className="notification-timer">
							<span />
						</div>
					</div>
				</Toast>
			))}
		</div>
	);
}

export default Notification;
