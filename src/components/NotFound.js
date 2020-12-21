import React, { Component } from 'react';
import { Button } from 'antd';
import { Message } from "@wikimedia/react.i18n";

import "../App.css";
import "antd/dist/antd.css";

const ENV_SETTINGS = require('../env')();
class NotFound extends Component {

    render() {
        return (
            <div>
                <Button href={ENV_SETTINGS.home_page}>
                    <Message id="404-go-back" />
                </Button>
                <img alt={<Message id="404-image-description" />} src="https://illustatus.herokuapp.com/?title=Oops,%20Page%20not%20found&fill=%234f86ed"/>
            </div>
        );
    };

}

export default NotFound;
