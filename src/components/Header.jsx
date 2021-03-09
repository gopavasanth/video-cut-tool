import React from "react";

import { Button, Popconfirm, Select, notification } from 'antd';
import { Message } from '@wikimedia/react.i18n';
import PopupTools from 'popup-tools';

import logo from '../logo.svg';
import "antd/dist/antd.css";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.onLogOut = this.onLogOut.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.state = {
            user: null
        };
    }
    componentDidMount() {
      try {
        if (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))) {
          this.setState({ user: JSON.parse(localStorage.getItem('user')) })
          this.props.socket.emit('authenticate', JSON.parse(localStorage.getItem('user')));
          this.props.parentUserUpdateCallback( JSON.parse(localStorage.getItem('user')) );
        }
      } catch (e) {
        this.setState({ user: null });
      }

       // Set theme (dark or light) on load
       const theme = localStorage.getItem('theme') || 'light';
       document.body.setAttribute('theme', theme);
    }
    /**
     * Handle theme toggle between dark and light mode
     */
    onThemeSwitch(){
      const currentTheme = document.body.getAttribute('theme');
      const newTheme = (currentTheme === 'light') ? 'dark' : 'light';

      document.body.setAttribute('theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
    // Login redirect URL to the back-end server
    onLogin() {
      PopupTools.popup(
        `${this.props.api_url}/video-cut-tool-back-end/login`, "Wiki Connect", { width: 1000, height: 600 }, (err, data) => {
          if (!err) {
            this.props.parentUserUpdateCallback( data.user )
            this.setState({ user: data.user });
            localStorage.setItem('user', JSON.stringify(data.user));
            this.props.socket.emit('authenticate', data.user)
            notification.success({message:"Logged in successfully"});
          }
        }
      );
    }

  onLogOut() {
    localStorage.removeItem('user');
    this.setState({
      user: null,
      selectedOptionName: 'new-file'
    });
    notification.success({message:"Logged out successfully"});
    this.props.parentUserUpdateCallback( null );
  }
    render() {
        return (
          <header>
            <nav className="w-100 ant-menu-dark py-2 d-flex position-relative">
                <h1 onClick={() => window.location.reload()} className="d-flex align-items-center my-1 mr-auto">
                  <img src={logo} alt="logo" position="relative" width="100" height="40" /> VideoCutTool
                </h1>
              <label className="navbar-toggler d-md-none px-3 my-0" type="button" data-toggle="collapse" for="header-options-toggle" aria-controls="header-options" aria-expanded="false" aria-label="Toggle navigation">
              ⋮
              </label>
              <input type="checkbox" id="header-options-toggle"></input>

              <ul className="d-md-flex flex-column flex-md-row align-items-center my-md-1 my-0 px-4 px-0" id="header-options">
                {this.state.user ? (
                  <>
                    <div className="d-flex flex-column flex-md-row align-items-center my-1 w-100">
                      <span style={{ color: "white" }}>Welcome, <strong> < a style={{ color: "white" }} href={`https://commons.wikimedia.org/wiki/user:${this.state.user.username}` }>{this.state.user.username} </a></strong></span>
                      <Popconfirm
                        placement="bottom"
                        title={<Message id="logout-confirm-text" />}
                        okText={<Message id="logout-confirm-yes" />}
                        cancelText={<Message id="logout-confirm-no" />}
                        onConfirm={this.onLogOut.bind(this)}
                      >
                        <Button
                          type="link"
                          className="c-auth-buttons__signout mx-md-3 my-md-0 my-3"
                        >
                          <Message id="logout" />
                        </Button>
                      </Popconfirm>
                    </div>
                  </>
                ) : (
                    <Button
                      primary
                      className="c-auth-buttons__signup mx-md-3 my-md-0 my-3"
                      onClick={this.onLogin.bind(this)}
                    >
                      <Message id="login" />
                    </Button>
                  )}
                  <div 
                    className='dark-theme-switch order-12 mx-md-3 my-md-0 my-3'
                    onClick={this.onThemeSwitch.bind(this)}
                  >
                    <div className='theme-switch-inner'></div>
                  </div>
                <Select
                  defaultValue={localStorage.getItem('locale') || 'en-US'}
                  style={{width: 150}}
                  onChange={this.props.parentLanguageUpdateCallback}
                >
                  <Select.OptGroup label={<Message id="languages" />}>
                    <Select.Option value="da-DA">
                      Danish
                    </Select.Option>
                    <Select.Option value="de-DE">
                      Deutsch
                    </Select.Option>
                    <Select.Option value="en-US">
                      English
                    </Select.Option>
                    <Select.Option value="es-ES">
                      español
                    </Select.Option>
                    <Select.Option value="fi-FI">
                      suomi
                    </Select.Option>                    
                    <Select.Option value="fr-FR">
                      Français
                    </Select.Option>
                    <Select.Option value="ko-KO">
                      한국어
                    </Select.Option>
                    <Select.Option value="kulatn-KU">
                      kurdî
                    </Select.Option>
      	            <Select.Option value="lb-LB">
                      Lëtzebuergesch
                    </Select.Option>
      	            <Select.Option value="mk-MK">
                      македонски
                    </Select.Option>
                    <Select.Option value="ptbr-PT">
                      português do Brasil
                    </Select.Option>
      	            <Select.Option value="ru-RU">
                      русский
                    </Select.Option>
      	            <Select.Option value="sv-SV">
                      svenska
                    </Select.Option>
      	            <Select.Option value="tr-TR">
                      Türkçe
                    </Select.Option>
                    <Select.Option value="zhhant-ZH">
                      Chinese Traditional
                    </Select.Option>
      	            <Select.Option value="zhhans-ZH">
                      Chinese Simplified
                    </Select.Option>
                  </Select.OptGroup>
                </Select>
              </ul>
            </nav>
            </header>
          )
    }
}

export default Header;
