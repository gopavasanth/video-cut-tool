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
					{...(notification.autohide && notification.type === 'error' ? { autohide: false } :
					{ delay: notification.delay, autohide: true })}
				>
					<div className="notification-icon">
						{notification.type !== 'error' && <InfoCircleFill />}
						{notification.type === 'error' && <ExclamationCircleFill />}
					</div>
					<div className="notification-header">
						<strong className="me-auto">
							{notification.type !== 'error' && <Message id="notifications-title" />}
							{notification.type === 'error' && <Message id="notifications-title-error" />}
						</strong>
						<button type="button" className="ms-2 mb-1 close" data-dismiss="notification-wrapper" aria-label="Close" onClick={() => onToastClose(index)}>
							<span aria-hidden="true">&times;</span>
						</button>
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
