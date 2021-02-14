import React from "react";
import "antd/dist/antd.css";
import { Layout, Button, Menu, Popconfirm, Dropdown, Select } from 'antd';
import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

import { Message } from '@wikimedia/react.i18n';

const logo = "https://upload.wikimedia.org/wikipedia/commons/5/57/JeremyNguyenGCI_-_Video_Cut_Tool_Logo.svg";

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
            NotificationManager.success("Logged in successfully");
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
    NotificationManager.success("Logged out successfully");
    this.props.parentUserUpdateCallback( null );
  }
    render() {
        return (
            <Layout.Header>
              <span onClick={() => window.location.reload()}>
                {this.props.width > 600 ?
                  <span style={{ color: "white", fontSize: "3.4vh", fontWeight: 900, cursor: "pointer" }}>
                    <img src={logo} alt="logo" position="relative" width="100" height="40" /> VideoCutTool
                      </span> :
                  <span style={{ color: "white", fontSize: "3.4vh", fontWeight: 900 }} className="pr-4">VideoCutTool</span>
                }
              </span>
              <Menu theme="dark" mode="horizontal">
                {this.state.user ? (
                  <>
                    <div className="align-middle float-left">
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
                          className="c-auth-buttons__signout"
                        >
                          <Message id="logout" />
                        </Button>
                      </Popconfirm>
                    </div>
                  </>
                ) : (
                    <Button
                      primary
                      className="c-auth-buttons__signup"
                      onClick={this.onLogin.bind(this)}
                    >
                      <Message id="login" />
                    </Button>
                  )}
                  <div 
                    class='dark-theme-switch float-right'
                    onClick={this.onThemeSwitch.bind(this)}
                  >
                    <div class='theme-switch-inner'></div>
                  </div>
                <Select
                  defaultValue={localStorage.getItem('locale') || !localStorage.getItem('locale' && 'en-US')}
                  style={{width: 150, paddingTop: 15}}
                  className="float-right"
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
              </Menu>
            </Layout.Header>
          )
    }
}

export default Header;
