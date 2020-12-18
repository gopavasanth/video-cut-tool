import React from "react";
import "antd/dist/antd.css";
import { Layout, Button, Menu, Popconfirm } from 'antd';
import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

const logo = "https://upload.wikimedia.org/wikipedia/commons/5/57/JeremyNguyenGCI_-_Video_Cut_Tool_Logo.svg";
const Header = Layout.Header;

class VideoCutToolHeader extends React.Component {
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
            <Header>
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
                    <div className="align-middle float-right">
                      <span style={{ color: "white" }}>Welcome, <strong> < a style={{ color: "white" }} href={`https://commons.wikimedia.org/wiki/user:${this.state.user.username}` }>{this.state.user.username} </a></strong></span>
                      <Popconfirm
                        placement="bottom"
                        title="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={this.onLogOut.bind(this)}
                      >
                        <Button
                          type="link"
                          className="c-auth-buttons__signout"
                        >
                          Logout
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
                      Register / Login
                      </Button>
                  )}
              </Menu>
            </Header>
          )
    }
}

export default VideoCutToolHeader;