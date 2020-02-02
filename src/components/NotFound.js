import React, { Component } from 'react';
import { Button } from 'antd';

import "../App.css";
import "antd/dist/antd.css";

const ENV_SETTINGS = require('../env')();
class NotFound extends Component {

    render() {
        return (
            <div>
                <Button href={ENV_SETTINGS.home_page}>Go to Main page</Button>
                <img alt="404 Page Not Found" src="https://illustatus.herokuapp.com/?title=Oops,%20Page%20not%20found&fill=%234f86ed"/>
            </div>
        );
    };

}

export default NotFound;
