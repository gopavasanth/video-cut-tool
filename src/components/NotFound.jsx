import React from 'react';
import { Message } from '@wikimedia/react.i18n';
import { Button } from 'react-bootstrap';

const ENV_SETTINGS = require('../env')();

function NotFound() {
	return (
		<div>
			<Button variant="outline-primary" href={ENV_SETTINGS.home_page}>
				<Message id="404-go-back" />
			</Button>

			<img
				alt={<Message id="404-image-description" />}
				src="https://illustatus.herokuapp.com/?title=Oops,%20Page%20not%20found&fill=%234f86ed"
			/>
		</div>
	);
}

export default NotFound;
