import React, { Component } from 'react';
import { Menu, Alert, Tooltip, Steps, Divider, Input, notification, Slider, Typography, Layout, Icon, Col, Radio, Form, Row, Button, Upload, Progress } from 'antd';
import { Player, BigPlayButton } from 'video-react';
import { FormGroup } from 'reactstrap';

import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

import Draggable from "react-draggable";
import axios from "axios";
import io from 'socket.io-client';

import "../App.css";
import "antd/dist/antd.css";

import "../../node_modules/video-react/dist/video-react.css"; // import css

const ENV_SETTINGS = require("../env")();

// These are the API URL's
const API_URL = ENV_SETTINGS.backend_url;

const { Header, Content, Footer } = Layout;
const { Step } = Steps;
const { Dragger } = Upload;

// Notification Messages
const RemoveFeatureMsg = "You turned off a feature";
const WaitMsg = "Your video is being processed, Please wait until the new video is generated";

const showNotificationWithIcon = (type, desc) => {
  notification[type]({
    message: "Notification !",
    description: desc
  });
};

// This is to display the time in Visual Trimming in hh:mm:ss formate
function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  seconds = seconds - hours * 3600 - minutes * 60;
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let time = hours + ":" + minutes + ":" + seconds;
  if ((parseFloat(seconds) === seconds || parseFloat(seconds) === 0) && String(seconds).indexOf(".") === -1) {
    time += ".000";
  }
  if (time.indexOf(".") === -1) {
    time += ".";
  }
  if (time.length < 12) {
    for (let i = 0; i < Array(12 - time.length).length; i++) {
      time += "0";
    }
  }
  return time.substr(0, 12);
}

class home extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.updatePlayerInfo = this.updatePlayerInfo.bind(this);
    this.onChangeCrop = this.onChangeCrop.bind(this);

    this.displayCrop = this.displayCrop.bind(this);
    this.displayTrim = this.displayTrim.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
    this.displayRotate = this.displayRotate.bind(this);
    this.displayVideoSettings = this.displayVideoSettings.bind(this);

    this.handleDrag = this.handleDrag.bind(this);
    this.onDragStop = this.onDragStop.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.onLogOut = this.onLogOut.bind(this);
    this.beforeOnTapCrop = this.beforeOnTapCrop.bind(this);
    this.AfterOnTapCrop = this.AfterOnTapCrop.bind(this);

    this.rotateVideo = this.rotateVideo.bind(this);
    this.trimIntoMultipleVideos = this.trimIntoMultipleVideos.bind(this);
    this.trimIntoSingleVideo = this.trimIntoSingleVideo.bind(this);
    this.cropVideo = this.cropVideo.bind(this);
    this.UndodisableAudio = this.UndodisableAudio.bind(this);
    this.validateVideoURL = this.validateVideoURL.bind(this);
    this.RotateValue = this.RotateValue.bind(this);

    //Implementing steps
    this.changeStep = this.changeStep.bind(this);

    this.state = {
      deltaPosition: {
        x: 0,
        y: 0
      },
      videos: [],
      trimMode: "single",
      inputVideoUrl: "",
      trims: [{ from: 0, to: 5 }],
      out_width: "",
      out_height: "",
      x_value: "",
      y_value: "",
      display: false,
      displayCrop: false,
      displayTrim: false,
      displayRotate: false,
      displayPlayer: false,
      disableAudio: false,
      displayUploadToCommons: false,
      user: null,
      beforeOnTapCrop: true,
      AfterOnTapCrop: false,
      upload: false,
      title: "",
      trimVideo: false,
      rotateVideo: false,
      cropVideo: false,
      trimIntoSingleVideo: true,
      trimIntoMultipleVideos: false,
      //loading button
      loading: false,
      displayLoadingMessage: false,
      progressPercentage: 0,
      currentTask: 'prcessing',
      //Slider Values,
      changeStep: 0,
      duration: 0,
      //display VideoSettings
      displayVideoSettings: false,
      validateVideoURL: false,
      AddedMore: false,
      RotateValue: -1,
      displaynewVideoName: false,
      DisplayFailedNotification: false,

      uploadedFile: null,
      fileList: []
    };
  }

  componentDidMount() {
    const socket = io(API_URL);
    socket.on('progress:update', data => {
      const progressData = JSON.parse(data);
      const { time, duration, currentTask } = progressData;
      this.setState({
        progressPercentage: Math.round((time * 100) / duration),
        currentTask
      });
    })

    try {
      if (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))) {
        this.setState({ user: JSON.parse(localStorage.getItem('user')) })
      }
    } catch(e) {
      this.setState({ user: null });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.playerSource !== prevState.playerSource) {
      console.log("error: " + this.refs.player);
      this.refs.player.load();
    }
  }

  enterLoading = () => {
    this.setState({
      loading: true,
      displayLoadingMessage: true,
      progressPercentage: 0,
      currentTask: 'processing'
    });
  };

  leaveLoading = () => {
    this.setState({
      loading: false,
      displayLoadingMessage: false,
      progressPercentage: 0,
      currentTask: 'processing'
    })
  }

  RotateValue (RotateValue){
    RotateValue=(RotateValue+1)%4;
    this.setState({
      RotateValue: RotateValue
    })
  }

  changeStep = num => {
    this.setState({
      changeStep: num
    });
  };

  // Login redirect URL to the back-end server
  onLogin() {
    PopupTools.popup(
      `${API_URL}/video-cut-tool-back-end/login`, "Wiki Connect", { width: 1000, height: 600 }, (err, data) => {
        if (!err) {
          console.log(" login response ", err, data);
          this.setState({ user: data.user });
          localStorage.setItem('user', JSON.stringify(data.user));
          NotificationManager.success("Logged in successfully");
        }
      }
    );
  }

  onLogOut() {
    localStorage.removeItem('user');
    this.setState({
      user: null
    });
    NotificationManager.success("Logged out successfully");
  }

  handleValueChange(e) {
    var value = e.target.value;
    this.setState({
      [e.target.id]: value
    });
  }

  // This updates the player src, and displays the player
  updatePlayerInfo(url) {
    this.setState({
      playerSource: url,
      display: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false
    });
  }

  rotateVideo() {
    this.setState({
      rotateVideo: true
    });
  }

  cropVideo() {
    this.setState({
      cropVideo: true
    });
  }

  trimIntoMultipleVideos() {
    this.setState({
      trimIntoMultipleVideos: true,
      trimIntoSingleVideo: false
    });
  }

  trimIntoSingleVideo() {
    this.setState({
      trimIntoSingleVideo: true,
      trimIntoMultipleVideos: false
    });
  }

  displayVideoSettings() {
    this.setState({
      displayVideoSettings: true
    });
  }

  displayCrop() {
    this.setState({
      displayCrop: true,
      displayTrim: false,
      displayRotate: false,
      displayPlayer: false
    }, () => {
      const self = this;
      const resizerBlock = this.dragRef;
      const resizers = resizerBlock.querySelectorAll('.resizer');

      const minSize = 100;
      let original_width = 0;
      let original_height = 0;
      let original_mouse_x = 0;
      let original_mouse_y = 0;
      let transformValue = [0, 0];

      let width = 0;
      let height = 0;
      let top = 0;
      let left = 0;

      function getTruePropertyValue(property) {
        return parseFloat(getComputedStyle(resizerBlock, null).getPropertyValue(property).replace('px', ''));
      }

      function getTransformValue() {
        return resizerBlock.style.transform.replace(/[^0-9\-.,]/g, '').split(',').map(Number);
      }

      function getPlayerCoords() {
        return document.getElementById('video-1').getBoundingClientRect();
      }

      resizers.forEach(resizer => {
        const resizerPosition = resizer.className.split(' ')[1];

        resizer.addEventListener('mousedown', e => {
          e.preventDefault();

          original_width = getTruePropertyValue('width');
          original_height = getTruePropertyValue('height');
          transformValue = getTransformValue();
          original_mouse_x = e.pageX;
          original_mouse_y = e.pageY;

          window.addEventListener('mousemove', resize);
          window.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
          switch (resizerPosition) {
            case 'top-center':
              top = e.pageY - original_mouse_y;
              height = original_height - (e.pageY - original_mouse_y);
              if (height > minSize && transformValue[1]+top >= 0) {
                resizerBlock.style.transform = `translate(${transformValue[0]}px, ${transformValue[1]+top}px)`;
                resizerBlock.style.height = `${height}px`;
              }
              break;
            case 'bottom-center':
              height = original_height + (e.pageY - original_mouse_y);
              if (height > minSize && transformValue[1]+height <= parseFloat(getPlayerCoords().height)) {
                resizerBlock.style.height = `${height}px`;
              }
              break;
            case 'left-center':
              left = e.pageX - original_mouse_x;
              width = original_width - (e.pageX - original_mouse_x);
              if (width > minSize && transformValue[0]+left >= 0) {
                resizerBlock.style.transform = `translate(${transformValue[0]+left}px, ${transformValue[1]}px)`;
                resizerBlock.style.width = `${width}px`;
              }
              break;
            case 'right-center':
              width = original_width + (e.pageX - original_mouse_x);
              if (width > minSize && transformValue[0]+width <= parseFloat(getPlayerCoords().width)) {
                resizerBlock.style.width = `${width}px`;
              }
              break;
            case 'top-left':
              width = original_width - (e.pageX - original_mouse_x);
              height = original_height - (e.pageY - original_mouse_y);
              if (width > minSize && transformValue[0]+(e.pageX - original_mouse_x) >= 0) {
                resizerBlock.style.width = `${width}px`;
                left = e.pageX - original_mouse_x;
              }
              if (height > minSize && transformValue[1]+(e.pageY - original_mouse_y) >= 0) {
                resizerBlock.style.height = `${height}px`;
                top = e.pageY - original_mouse_y;
              }
              resizerBlock.style.transform = `translate(${transformValue[0]+left}px, ${transformValue[1]+top}px)`;
              break;
            case 'top-right':
              width = original_width + (e.pageX - original_mouse_x);
              height = original_height - (e.pageY - original_mouse_y);
              top = e.pageY - original_mouse_y;
              if (width > minSize && transformValue[0]+width <= parseFloat(getPlayerCoords().width)) {
                resizerBlock.style.width = `${width}px`;
              }
              if (height > minSize && transformValue[1]+top >= 0) {
                resizerBlock.style.height = `${height}px`;
                resizerBlock.style.transform = `translate(${transformValue[0]}px, ${transformValue[1]+top}px)`;
              }
              break;
            case 'bottom-left':
              height = original_height + (e.pageY - original_mouse_y);
              width = original_width - (e.pageX - original_mouse_x);
              left = e.pageX - original_mouse_x;
              if (height > minSize && transformValue[1]+height <= parseFloat(getPlayerCoords().height)) {
                resizerBlock.style.height = `${height}px`;
              }
              if (width > minSize && transformValue[0]+left >= 0) {
                resizerBlock.style.width = `${width}px`;
                resizerBlock.style.transform = `translate(${transformValue[0]+left}px, ${transformValue[1]}px)`;
              }
              break;
            case 'bottom-right':
              width = original_width + (e.pageX - original_mouse_x);
              height = original_height + (e.pageY - original_mouse_y);
              if (width > minSize && transformValue[0]+width <= parseFloat(getPlayerCoords().width)) {
                resizerBlock.style.width = `${width}px`;
              }
              if (height > minSize && transformValue[1]+height <= parseFloat(getPlayerCoords().height)) {
                resizerBlock.style.height = `${height}px`;
              }
              break;
            default:
              break;
          }
        }

        function stopResize() {
          self.onDragStop();
          window.removeEventListener('mousemove', resize);
        }
      });
    });
  }

  beforeOnTapCrop() {
    this.setState({
      beforeOnTapCrop: true
    });
  }

  AfterOnTapCrop() {
    this.setState({
      beforeOnTapCrop: false,
      AfterOnTapCrop: true
    });
  }

  displayTrim() {
    this.setState({
      displayTrim: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false,
      trimMode: "trim"
    });
  }

  displayRotate() {
    this.setState({
      displayRotate: true,
      displayCrop: false,
      displayTrim: false,
      displayPlayer: false,
      trimMode: "rotate"
    });
  }

  disableAudio() {
    this.setState({
      disableAudio: true
    });
  }

  UndodisableAudio() {
    this.setState({
      disableAudio: false
    });
  }

  onChangeCrop(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onChangeRadioButton = e => {
    this.setState({
      value: e.target.value
    });
  };

  // This is to add multiple "From" and "To" while trimming
  add() {
    let trims = this.state.trims;
    trims.push({ from: 0, to: 5 });
    this.setState({
      trims: trims
    });
  };

  onChange = e => {
    let trims = this.state.trims;
    const id = e.target.id;
    const index = id.match(/\d+/g).map(Number)[0];

    if (id.includes("from")) {
      trims[index].from = e.target.value;
    } else if (id.includes("to")) {
      trims[index].to = e.target.value;
    }
    this.setState({
      trims: trims
    });
  };

  // This validates the Video URL using Regeular Expression
  validateVideoURL(url) {
    if (url !== "") {
      if ( url.match( /^(?:https?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$%&'()*+,;=.]+(?:mp4|webm|mov|flv|ogv)+$/g ) !== null ) {
        console.log("Your are using right URL !");
        this.setState({ validateVideoURL: true });
        return true;
      } else {
        showNotificationWithIcon("error", "Provide the right URL");
        console.log("You are providing incorrect url");
        return false;
      }
    }
  }

  handleDrag(ui) {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY
      }
    });
  }

  onDragStop() {
    const parentBox = this.refs.player.video.video.getBoundingClientRect();
    this.setState({
      duration: this.refs.player.video.video
        .duration
    });
    const dragElBox = this.dragRef.getBoundingClientRect();
    const xPercentage = ((dragElBox.x - parentBox.x) / parentBox.width * 100);
    const yPercentage = ((dragElBox.y - parentBox.y) / parentBox.height * 100);
    const widthPercentage = (dragElBox.width / parentBox.width * 100);
    const heightPercentage = (dragElBox.height / parentBox.height * 100);
    this.setState({
      x_value: xPercentage,
      y_value: yPercentage,
      out_height: heightPercentage,
      out_width: widthPercentage
    });
  }

  previewCallback(res){
    console.log(res);
      //here var loading is for button loading
      this.setState({
        videos: res.data.videos,
        displayRotate: false,
        displayCrop: false,
        loading: false,
        displayPlayer: false,
        displayLoadingMessage: false,
        changeStep: 3,
        displayVideoSettings: false
      });
      showNotificationWithIcon("success", "Sucessfully Completed :)");
  }

  previewCallbackError(err){
    console.log(err);
    const reason = err.response && err.response.text ? err.response.text : 'Something went wrong';
    showNotificationWithIcon("error", reason);
    this.setState({DisplayFailedNotification: true});
    this.leaveLoading();
  }

  // On Clicking the "Preview" button the values will submit to the back-end
  onSubmit(e) {
    e.preventDefault();
    const self = this;
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.state.trims,
      out_width: this.state.out_width,
      out_height: this.state.out_height,
      x_value: this.state.x_value,
      y_value: this.state.y_value,
      trimMode: this.state.trimIntoSingleVideo ? "single" : "multiple",
      value: this.state.value,
      user: this.state.user,
      trimVideo: this.state.trimVideo,
      upload: this.state.upload,
      title: this.state.title,
      rotateVideo: this.state.rotateVideo,
      cropVideo: this.state.cropVideo,
      disableAudio: this.state.disableAudio,
      trimIntoMultipleVideos: this.state.trimIntoMultipleVideos,
      trimIntoSingleVideo: this.state.trimIntoSingleVideo,
      RotateValue: this.state.RotateValue
    };
    this.setState({ videos: [] });

    if( this.state.uploadedFile !== null ){
      let data = new FormData();
      data.append('video',this.state.uploadedFile);
      data.append('data',JSON.stringify(obj))
      this.setState({ currentTask: 'uploading' });
      axios.post(`${API_URL}/video-cut-tool-back-end/send/upload`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          self.setState({ progressPercentage: percentCompleted });
        }
      }).then(res => {
        this.previewCallback(res);
      }).catch(err => {
        this.previewCallbackError(err);
      })
    } else {
      axios.post(`${API_URL}/video-cut-tool-back-end/send`, obj).then(res => {
        this.previewCallback(res);
      }).catch(err => {
        this.previewCallbackError(err);
      })
    }
  } 

  handleUploadChange = info => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    this.setState({ fileList });
  };

  render() {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { uploadedFile } = this.state;
    const uploadProperties = {
      multiple: false,
      accept: ".mp4,.webm,.mov,.flv,.ogv",
      onChange: this.handleUploadChange,
      onRemove: file => {
        this.setState({
          uploadedFile: file
        });
      },
      beforeUpload: file => {
        this.setState({
          uploadedFile: file
        });
        return false;
      },
      uploadedFile,
    };

    console.log("URL: " + this.state.inputVideoUrl);

    return (
      <Layout className="layout">
        <Header>
          <Typography.Title level={1} onClick={() => window.location.reload()}>VideoCutTool</Typography.Title>
          <Menu theme="dark" mode="horizontal">
            {this.state.user ? (
              <>
              <Button
                primary
                className="c-auth-buttons__signout"
                onClick={this.onLogOut.bind(this)}
              >
                Logout
              </Button>
              <Button
                primary
                className="c-auth-buttons__signout"
              >
                {"Welcome : " + this.state.user.username}
              </Button>
              </>
            ) : (
              <Button
                primary
                className="c-auth-buttons__signup"
                onClick={this.onLogin.bind(this)}
              >
                Register / Login with Wikipedia
              </Button>
            )}
          </Menu>
        </Header>
        <form onSubmit={this.onSubmit}>
          <Content className="Content" style={{ padding: "50px 50px" }}>
            <Row gutter={16}>
              <Col span={16}>
                <div style={{ padding: "1rem" }}>
                  <div className="docs-example" style={{ height: "100%" }}>
                  {
                    this.state.DisplayFailedNotification ? (
                      <div style={{paddingBottom: "2rem"}}>
                        <Alert
                        message="Something went wrong !"
                        type="error"
                        closable
                      />
                      </div>
                    ) : null
                  }
                    <div id="steps" textalign="center">
                      <Row gutter={25}>
                        <Col className="gutter-row" span={25}>
                          <Steps current={this.state.changeStep}>
                            <Step title="Video URL" />
                            <Step title="Video Settings" />
                            <Step title="Result" />
                          </Steps>
                        </Col>
                      </Row>
                    </div>
                    <br />
                    <Form>
                      <FormGroup>
                        <Typography.Title level={4} style={{ color: "Black" }}>
                          {" "}
                          Video URL{" "}
                          <Button
                            href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool"
                            style={{ float: "right" }}
                          >
                            <Icon type="question-circle" />
                          </Button>
                        </Typography.Title>
                        <Input
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/video.webm"
                          ref="inputVideoUrl"
                          name="inputVideoUrl"
                          id="inputVideoUrl"
                          value={this.state.inputVideoUrl}
                          onChange={this.handleValueChange}
                        />
                      </FormGroup>
                      
                      <hr/>
                      <Typography.Title level={4} style={{ color: "Black", "text-align": "center" }}>
                        or..
                      </Typography.Title>
                      <hr/>
                      <Dragger {...uploadProperties} fileList={this.state.fileList}>
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                      </Dragger>
                      <div>
                        <FormGroup>
                          <Button
                            type="primary"
                            disabled={!this.state.inputVideoUrl && this.state.uploadedFile === null}
                            onClick={() => {
                              console.log(this.state);
                              if ( this.state.uploadedFile !== null ) {
                                this.updatePlayerInfo(URL.createObjectURL(this.state.uploadedFile))
                                this.setState({
                                  validateVideoURL: true
                                })
                              } else if ( this.validateVideoURL(this.state.inputVideoUrl) ){
                                this.updatePlayerInfo(this.state.inputVideoUrl)
                              }
                              this.changeStep(1);
                              this.setState({
                                displayVideoSettings: true,
                                upload: false,
                                title: "",
                                trimVideo: false,
                                rotateVideo: false,
                                cropVideo: false,
                                trimIntoSingleVideo: true,
                                trimIntoMultipleVideos: false,
                                disableAudio: false
                              });
                            }}
                            style={{ marginTop: "12px" }}
                          >
                            Play Video
                          </Button>
                          <br />
                          <br />
                          {this.state.videos &&
                            this.state.videos.map(video => (
                              <video
                                height="300px"
                                width="450px"
                                controls
                                vjs-big-play-centered
                                src={`${API_URL}/${video}`}
                              />
                            ))}
                        </FormGroup>
                      </div>
                    </Form>
                    <br />
                    {this.state.displayLoadingMessage ? (
                          <div
                            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                          >
                            <p style={{ marginBottom: 0 }}>Your video is {this.state.currentTask}...</p>
                            <Progress percent={this.state.progressPercentage} status="active" style={{ marginBottom: 10, padding: '0 5%' }} />
                          </div>
                    ) : null}
                    {
                      this.state.displaynewVideoName ?
                      <p>Your New video URL will be here `https://commons.wikimedia.org/wiki/File:{this.state.title}` </p>: null
                    }
                    {this.state.displayPlayer ? (
                      <div className="player">
                        <br />
                        <Player
                          refs={player => {
                            this.player = player;
                          }}
                          ref="player"
                          videoId="video-1"
                        >
                          <BigPlayButton position="center" />
                          <source src={this.state.playerSource} />
                        </Player>
                      </div>
                    ) : null}
                    {/* Crop Video */}
                    {this.state.displayCrop ? (
                      <div>
                        <div
                          className="box"
                          style={{
                            height: "100%",
                            width: "100%",
                            position: "relative",
                            overflow: "hidden"
                          }}
                        >
                          <div style={{ height: "100%", width: "100%" }}>
                            <Draggable
                              bounds="parent"
                              {...dragHandlers}
                              axis="both"
                              handle="#draggable-area"
                              onDrag={(e, ui) => {
                                this.handleDrag(ui);
                              }}
                              onStop={this.onDragStop}
                            >
                              <div
                                ref={ref => (this.dragRef = ref)}
                                className="box"
                                id="crop-area"
                                onHeightReady={height =>
                                  console.log("Height: " + height)
                                }
                              >
                                <div id="draggable-area"></div>
                                <div className="resizers">
                                  <div className="resizer top-left"></div>
                                  <div className="resizer top-center"></div>
                                  <div className="resizer top-right"></div>
                                  <div className="resizer bottom-left"></div>
                                  <div className="resizer bottom-center"></div>
                                  <div className="resizer bottom-right"></div>
                                  <div className="resizer left-center"></div>
                                  <div className="resizer right-center"></div>
                                </div>
                                <div className="crosshair"></div>
                              </div>
                            </Draggable>
                            {this.state.beforeOnTapCrop ? (
                              <div>
                                <Player
                                  ref="player"
                                  height="300"
                                  width="300"
                                  videoId="video-1"
                                >
                                  <BigPlayButton position="center" />
                                  <source src={this.state.playerSource} />
                                </Player>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div>
                          <div className="box">
                            {this.state.AfterOnTapCrop ? (
                              <div>
                                <Player ref="player" videoId="video-1">
                                  <BigPlayButton position="center" />
                                  <source src={this.state.playerSource} />
                                </Player>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Rotate Video */}
                    {this.state.displayRotate ? (
                      <div>
                        <div id={"RotatePlayerValue" + this.state.RotateValue} style={{marginTop: "8em"}} >
                              <Player ref="player" videoId="video-1" >
                                <BigPlayButton position="center" />
                                <source src={this.state.playerSource} />
                              </Player>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Col>

              {/* Video Settings */}
              {this.state.displayVideoSettings &&
              this.state.validateVideoURL ? (
                <Col span={8}>
                  <div className="videoSettings">
                    <h2 style={{ textAlign: "center" }}>Step1: Adjust Video Settings   </h2>
                    <div className="step1">
                      <Row>
                        <Col xl={12} xs={24}>
                          <Button
                            type="primary"
                            disabled={this.state.disableAudio}
                            onClick={() => this.disableAudio()}
                            block
                          >
                            <Icon type="sound" /> Remove Audio
                          </Button>
                        </Col>
                        <Col xl={12} xs={24}>
                          <Button
                            disabled={!this.state.disableAudio}
                            onClick={() => {
                              this.UndodisableAudio();
                              showNotificationWithIcon("info", RemoveFeatureMsg);
                            }}
                            block
                          >
                            <Icon type="undo" /> Undo
                          </Button>
                        </Col>
                      </Row>
                      <br />
                      <Row>
                        <Col xl={12} xs={24}>
                          <Button
                            type="primary"
                            onClick={() => {
                              this.rotateVideo();
                              this.RotateValue(this.state.RotateValue);
                              this.displayRotate();
                            }}
                            block
                          >
                            <Icon type="redo" /> Rotate Video
                          </Button>
                        </Col>
                        <Col xl={12} xs={24}>
                          <Button
                            disabled={!this.state.rotateVideo}
                            onClick={() => {
                              this.setState({ rotateVideo: false });
                              showNotificationWithIcon("info", RemoveFeatureMsg);
                            }}
                            block
                          >
                            <Icon type="undo" /> Undo
                          </Button>
                        </Col>
                      </Row>
                      <br />
                      <Row>
                        <Col xl={12} xs={24}>
                          <Button
                            type="primary"
                            disabled={this.state.trimVideo}
                            onClick={() => {
                              this.displayTrim();
                              this.setState({
                                trimVideo: true
                              });
                            }}
                            block
                          >
                            <Icon type="scissor" /> Trim Video
                          </Button>
                        </Col>
                        <Col xl={12} xs={24}>
                          <Button
                            disabled={!this.state.trimVideo}
                            onClick={() => this.setState({ trimVideo: false, displayTrim: false })}
                            block
                          >
                            <Icon type="undo" /> Undo
                          </Button>
                        </Col>
                      </Row>
                      <br/>
                      <Row>
                        <Col xl={12} xs={24}>
                          <Button
                            type="primary"
                            disabled={this.state.cropVideo}
                            onClick={() => {
                              this.cropVideo();
                              this.displayCrop();
                            }}
                            block
                          >
                            <Icon type="radius-setting" /> Crop Video
                          </Button>
                        </Col>
                        <Col xl={12} xs={24}>
                          <Button
                            disabled={!this.state.cropVideo}
                            onClick={() => {
                              this.setState({ cropVideo: false });
                              showNotificationWithIcon("info", RemoveFeatureMsg);
                            }}
                            block
                          >
                            <Icon type="undo" /> Undo
                          </Button>
                        </Col>
                      </Row>
                    </div>
                    <Divider />
                    <h2 style={{ textAlign: "center" }}>Step2: Preview my changes</h2>
                    <Col span={16} style={{ textAlign: "centre" }}>
                      <Button
                        type="primary"
                        onClick={e => {
                          this.enterLoading();
                          this.onSubmit(e);
                          showNotificationWithIcon("info", WaitMsg);
                          this.changeStep(2);
                        }}
                        name="rotate"
                        style={{
                          height: "50px",
                          float: "right"
                        }}
                        disabled={!this.state.cropVideo && !this.state.rotateVideo && !this.state.trimVideo && !this.state.disableAudio}
                        shape="round"
                        loading={this.state.loading}
                      >
                        <Icon type="play-circle" /> Preview
                      </Button>
                    </Col>
                    {console.log(this.state.player)}
                    {this.state.displayTrim ? (
                      <Col span={16}>
                        <h2>VideoTrim Settings</h2>
                        {this.refs.player && this.state.trims.map((trim, i) => (
                          <React.Fragment>
                            <Slider
                              range
                              step={0.1}
                              min={0}
                              max={this.refs.player.video.video.duration}
                              value={[trim.from, trim.to]}
                              tipFormatter={formatTime}
                              onChange={obj => {
                                let trims = this.state.trims;
                                trims[i].from = obj[0];
                                trims[i].to = obj[1];
                                this.setState({
                                  trims: trims
                                });
                                if( this.unsubscribeToStateChanges ) {
                                  this.unsubscribeToStateChanges();
                                }
                                this.refs.player.seek(obj[0]);
                                this.refs.player.play();
                                this.unsubscribeToStateChanges = this.refs.player.subscribeToStateChange( ( state ) => {
                                  if ( state.currentTime > obj[1]) {
                                    this.refs.player.pause();
                                  }
                                } );
                              }}
                            />
                            <Row gutter={12} key={i}>
                              <Col span={12}>
                                <Typography.Text
                                  strong
                                  style={{ paddingRight: "0.2rem" }}
                                >
                                  From
                                </Typography.Text>
                                <div className="form-group">
                                  <Input
                                    placeholder="hh:mm:ss"
                                    id={`trim-${i}-from`}

                                    value={formatTime(trim.from)}
                                  />
                                </div>
                              </Col>
                              <Col span={12}>
                                <Typography.Text
                                  strong
                                  style={{ paddingRight: "0.2rem" }}
                                >
                                  To
                                </Typography.Text>
                                <div className="form-group">
                                  <Input
                                    placeholder="hh:mm:ss"
                                    id={`trim-${i}-to`}

                                    value={formatTime(trim.to)}
                                  />
                                </div>
                              </Col>
                            </Row>
                          </React.Fragment>
                        ))}
                        <Button
                          type="primary"
                          onClick={() => {
                            this.add();
                            this.setState({AddedMore: true});
                          }}
                          style={{ margin: "1rem", marginLeft: "2.25rem" }}
                        >
                          <Icon type="plus" /> Add More
                        </Button>
                        <br />
                        {this.state.AddedMore ? (
                        <div className="form-group">
                        <div>
                          <Col span={12}>
                            <Radio
                              checked={this.state.trimIntoSingleVideo}
                              onClick={this.trimIntoSingleVideo}
                            >
                              Concatenate into single video
                            </Radio>
                          </Col>
                          <Col Span={12}>
                            <Radio
                              checked={this.state.trimIntoMultipleVideos}
                              onClick={this.trimIntoMultipleVideos}
                            >
                              As Multiple videos
                            </Radio>
                          </Col>
                        </div>
                      </div>
                        ): null
                        }
                      </Col>
                    ) : null}
                </div>
                </Col>
              ) : null}
              <Col span={8}>
                {this.state.videos &&
                  this.state.videos.map(video => (
                    <div>
                      <h2 style={{ textAlign: "center" }}>Step3: Choose your choice </h2>
                      <Col span="12">
                        <Button type="primary">
                          <a href={`${API_URL}/download/${video}`}>Download</a>
                        </Button>
                      </Col>
                      <Col span="12">
                        <Button
                          type="primary"
                          onClick={() => {
                            this.setState({ displayUploadToCommons: true });
                          }}
                        >
                          Upload to Commons
                        </Button>
                        <br />
                        {this.state.displayUploadToCommons ? (
                          <div className="displayUploadToCommons">
                            <br />
                            <h4> Enter the new video title </h4>
                            <Input
                              placeholder="myNewVideo.webm"
                              ref="title"
                              name="title"
                              id="title"
                              value={this.state.title}
                              onChange={this.handleValueChange}
                              style={{ padding: "10px" }}
                              required="true"
                            />
                            <br />
                            {this.state.user ? (
                              <Button
                                type="primary"
                                onClick={e => {
                                  this.setState({ upload: true, displayLoadingMessage: true, displaynewVideoName: true }, () => {
                                    this.onSubmit(e);
                                  });
                                }}
                                loading={this.state.loading}
                                name="rotate"
                                shape="round"
                                style={{
                                  margin: "1rem",
                                  marginLeft: "2.25rem"
                                }}
                              >
                                <Icon type="upload" /> Upload to Commons
                              </Button>
                            ) : (
                              <Tooltip
                                placement="topLeft"
                                title={"Login to Upload to Wikimedia Commons"}
                              >
                                <Button
                                  type="primary"
                                  onClick={() => {
                                    showNotificationWithIcon("info", WaitMsg);
                                  }}
                                  name="rotate"
                                  shape="round"
                                  disabled
                                >
                                  <Icon type="upload" /> Upload to Commons
                                </Button>
                              </Tooltip>
                            )}
                          </div>
                        ) : null}
                      </Col>
                    </div>
                  ))}
              </Col>
            </Row>
            <br />
          </Content>
        </form>

        <Footer style={{ textAlign: "center" }}>
          © 2019
          <a href="https://www.mediawiki.org/wiki/User:Gopavasanth">
            <span> Gopa Vasanth </span>
          </a>
          and <b>Hassan Amin</b> &hearts; |
          <a href="https://github.com/gopavasanth/video-cut-tool">
            <span> Github </span>
          </a>
          |
          <a href="https://www.gnu.org/licenses/gpl-3.0.txt">
            <span> GNU Licence </span>
          </a>
        </Footer>
      </Layout>
    );
  }
}

export default home;
