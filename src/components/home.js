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
const SOCKET_IO_PATH = ENV_SETTINGS.socket_io_path;
const logo = "https://upload.wikimedia.org/wikipedia/commons/5/57/JeremyNguyenGCI_-_Video_Cut_Tool_Logo.svg";

const { Header, Content, Footer } = Layout;
const { Step } = Steps;
const { Dragger } = Upload;

// Notification Messages
const RemoveFeatureMsg = "You turned off a feature";
const WaitMsg = "Your video is being processed, Please wait until the new video is generated";

const OverwriteBtnTooltipMsg = (state) => {
  if (state.uploadedFile) {
    return "You can't overwrite a video from a device";
  }
  else {
    return "File doesn't exist at Wikimedia Commons";
  }
}

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
      user: null,
      beforeOnTapCrop: true,
      AfterOnTapCrop: false,
      upload: false,
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
      RotateValue: -1,
      displaynewVideoName: false,
      DisplayFailedNotification: false,

      uploadedFile: null,
      fileList: []
    };
  }

  componentDidMount() {
    const socket = io(API_URL, { path: SOCKET_IO_PATH });
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
      user: null,
      selectedOptionName: 'new-file'
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
  updatePlayerInfo(videoUrl) {
    const splittedUrl = videoUrl.split('/');
    const resultObj = {
      playerSource: videoUrl,
      display: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false
    };

    if (splittedUrl.includes('commons.wikimedia.org')) {
      axios.get(
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=videoinfo&titles=${splittedUrl[splittedUrl.length-1]}&viprop=user%7Curl%7Ccanonicaltitle%7Ccomment%7Curl&origin=*`
      )
        .then(response => {
          const { pages } = response.data.query;
          if (Object.keys(pages)[0] !== '-1') {
            const { user, canonicaltitle, comment, url } = pages[Object.keys(pages)[0]].videoinfo[0];

            resultObj.playerSource = url;
            resultObj.inputVideoUrl = url;
            resultObj.videos = [{
              author: user,
              title: decodeURIComponent(canonicaltitle.slice(5)).replace(/\s/g, '_'),
              comment,
              text: ''
            }];

            this.setState(resultObj);
          }
        });
    }
    else {
      resultObj.videos = [{
        author: this.state.user === null ? '' : this.state.user.username,
        title: this.state.uploadedFile === null ? decodeURIComponent(splittedUrl[splittedUrl.length-1]).replace(/\s/g, '_') : this.state.uploadedFile.name.replace(/\s/g, '_'),
        comment: '',
        text: ''
      }];
      this.setState(resultObj);
    }
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
          if (self.refs.player !== undefined) {
            self.onDragStop();
            window.removeEventListener('mousemove', resize);
          }
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
    function previewComplete() {
      self.setState(previewCompleteState);
      showNotificationWithIcon("success", "Sucessfully Completed :)");
    }

    let videos = [];

    const self = this;
    const previewCompleteState = {
      videos,
      displayRotate: false,
      displayCrop: false,
      loading: false,
      currentTask: 'processing',
      displayPlayer: false,
      displayLoadingMessage: false,
      changeStep: 3,
      displayVideoSettings: false
    };

    if (!this.state.upload) {
      if (res.data.videos.length > 0) {
        res.data.videos.map((item, index) => {
          let newVideoTitle = this.state.videos[index].title.split('.');
          newVideoTitle[0] = newVideoTitle[0].concat('_(edited)');
          if (index > 0) newVideoTitle[0] = newVideoTitle[0].concat(`(${index})`);
          newVideoTitle = newVideoTitle.join('.');

          const currentDate = new Date();
          const currentMonth = currentDate.getMonth()+1 < 10 ? `0${currentDate.getMonth()+1}` : currentDate.getMonth()+1;
          const currentDay = currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : currentDate.getDate();

          const { author, comment } = this.state.videos[index];

          return videos.push({
            path: item,
            title: newVideoTitle,
            author: author,
            comment: comment,
            text: `=={{int:filedesc}}==
{{Information${comment.length > 0 ? `\n|description=${comment}` : ''}
|date=${`${currentDate.getFullYear()}-${currentMonth}-${currentDay}`}
|source={{own}}${author.length > 0 ? `\n|author=[[User:${author}|${author}]]` : ''}
}}\n
=={{int:license-header}}==
{{self|cc-by-sa-4.0}}`,
            selectedOptionName: 'new-file',
            displayUploadToCommons: false
          });
        });
      }
    }
    else {
      videos = this.state.videos;
    }
    previewCompleteState.videos = videos;
    return previewComplete();
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
      rotateVideo: this.state.rotateVideo,
      cropVideo: this.state.cropVideo,
      disableAudio: this.state.disableAudio,
      trimIntoMultipleVideos: this.state.trimIntoMultipleVideos,
      trimIntoSingleVideo: this.state.trimIntoSingleVideo,
      RotateValue: this.state.RotateValue,
      videos: this.state.upload 
        ? this.state.videos.filter(video => video.displayUploadToCommons)
        : this.state.videos
    };

    let newVideos = this.state.videos;
    if (!this.state.upload && this.state.trims.length > 1) {
      for (let i = 0; i <= this.state.trims.length; i++) {
        newVideos.push(this.state.videos[0]);
      }
    }

    if( this.state.uploadedFile !== null ){
      let data = new FormData();
      data.append('video',this.state.uploadedFile);
      data.append('data',JSON.stringify(obj))
      this.setState({ currentTask: 'uploading', videos: newVideos });
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

  checkVideoTitles() {
    let videoList = this.state.videos;
    return !videoList.map(video => video.title.length > 0).includes(false)
      && videoList.filter(video => video.displayUploadToCommons).length > 0
  }

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
          <Typography.Title level={1} onClick={() => window.location.reload()}> <img src={logo} alt="logo" position="relative" width="100" height="40"/> VideoCutTool</Typography.Title>
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
                          placeholder="https://commons.wikimedia.org/wiki/File:video.webm"
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
                        <Button
                          type="primary"
                          disabled={!this.state.inputVideoUrl && this.state.uploadedFile === null}
                          onClick={() => {
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
                    {this.state.displaynewVideoName && (
                      <div>
                        {this.state.videos.length > 1 ? (
                          <>
                            <p style={{ margin: "5px 0" }}>Your New video{this.state.videos.length > 1 && 's'} will be here:</p>
                            <ul>
                              {this.state.videos.map(video => (
                                <li>
                                  <a href={`https://commons.wikimedia.org/wiki/File:${video.title}`} target="_blank" rel="noopener noreferrer">
                                    https://commons.wikimedia.org/wiki/File:{video.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <>
                            <p style={{ margin: "5px 0" }}>
                              Your New video will be here: <a href={`https://commons.wikimedia.org/wiki/File:${this.state.videos[0].title}`} target="_blank" rel="noopener noreferrer">
                                https://commons.wikimedia.org/wiki/File:{this.state.videos[0].title}
                              </a>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    {this.state.changeStep === 3 && this.state.videos.map(video => (
                      <video
                        height="300px"
                        width="450px"
                        controls
                        vjs-big-play-centered
                        src={`${API_URL}/${video.path}`}
                      />
                    ))}
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
              {(this.state.displayVideoSettings && this.state.validateVideoURL) && (
                <Col span={8}>
                  <div className="videoSettings">
                    <h2 style={{ textAlign: "center" }}>Step1: Adjust Video Settings   </h2>
                    <div className="button-columns">
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
                    <Col style={{ textAlign: "center" }}>
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
                          height: "50px"
                        }}
                        disabled={!this.state.cropVideo && !this.state.rotateVideo && !this.state.trimVideo && !this.state.disableAudio}
                        shape="round"
                        loading={this.state.loading}
                      >
                        <Icon type="play-circle" /> Preview
                      </Button>
                    </Col>
                    {this.state.displayTrim ? (
                      <Col>
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
                              <Col span={i === 0 ? 12 : 10}>
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
                              <Col span={i === 0 ? 12 : 10}>
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
                              {i > 0 && (
                                <Col span={4} style={{ height: 53 }}>
                                  <Button style={{ height: '100%' }} block onClick={() => {
                                    let newTrimsVar = this.state.trims.slice();
                                    newTrimsVar.splice(i, 1);
                                    this.setState({ trims: newTrimsVar });
                                  }}>
                                    <Icon type="close" />
                                  </Button>
                                </Col>
                              )}
                            </Row>
                          </React.Fragment>
                        ))}
                        <Button
                          type="primary"
                          onClick={() => {
                            this.add();
                          }}
                          style={{ width: "100%", margin: "1rem 0" }}
                        >
                          <Icon type="plus" /> Add More
                        </Button>
                        <br />
                        {this.state.trims.length > 1 && (
                          <Row>
                            <Col xs={24} xxl={12} style={{ textAlign: 'center' }}>
                              <Radio
                                checked={this.state.trimIntoSingleVideo}
                                onClick={this.trimIntoSingleVideo}
                              >
                                Concatenate into single video
                              </Radio>
                            </Col>
                            <Col xs={24} xxl={12} style={{ textAlign: 'center' }}>
                              <Radio
                                checked={this.state.trimIntoMultipleVideos}
                                onClick={this.trimIntoMultipleVideos}
                              >
                                As Multiple videos
                              </Radio>
                            </Col>
                          </Row>
                        )}
                      </Col>
                    ) : null}
                </div>
                </Col>
              )}
              {this.state.changeStep === 3 && (
                <Col span={8}>
                    <>
                      <h2 style={{ textAlign: "center" }}>Step3: Choose your choice</h2>
                      {this.state.videos.map((video, index, videoArr) => (
                        <>
                          <div id={video.path.split('/').pop().split('.')[0]}>
                            <h4 style={{ textAlign: 'center' }}>{video.title}</h4>
                            <div className="button-columns row-on-mobile">
                              <Row>
                                <Col xl={12} xs={24}>
                                  <Button block type="primary">
                                    <a href={`${API_URL}/download/${video.path}`}>Download</a>
                                  </Button>
                                </Col>
                                <Col xl={12} xs={24}>
                                  <Button
                                    block
                                    type="primary"
                                    onClick={() => {
                                      const newVideoList = videoArr;
                                      newVideoList[index] = {
                                        ...newVideoList[index],
                                        displayUploadToCommons: !newVideoList[index].displayUploadToCommons
                                      };
                                      this.setState({videos: newVideoList});
                                    }}
                                  >
                                    Upload to Commons <Icon type={videoArr[index].displayUploadToCommons ? "up" : "down"} />
                                  </Button>
                                </Col>
                              </Row>
                              {videoArr[index].displayUploadToCommons ? (
                                <>
                                  <Divider style={{ margin: '15px 0' }} />
                                  <div className="displayUploadToCommons">
                                    <h4>Action for a file</h4>
                                    <Radio.Group
                                      defaultValue="new-file"
                                      value={videoArr[index].selectedOptionName}
                                      onChange={e => {
                                        const newVideoList = videoArr;
                                        newVideoList[index] = {
                                          ...newVideoList[index],
                                          selectedOptionName: e.target.value
                                        };
                                        this.setState({videos: newVideoList});
                                      }}
                                    >
                                      {!this.state.uploadedFile ? (
                                        <Radio.Button value="overwrite" onChange={() => {
                                          const newVideoList = videoArr;

                                          let newTitle = newVideoList[index].title.split('.');
                                          newTitle[0] = newTitle[0].split('_').slice(0, -1).join('_');
                                          newTitle = newTitle.join('.');

                                          newVideoList[index] = {
                                            ...newVideoList[index],
                                            title: newTitle
                                          };
                                        }}>Overwrite</Radio.Button>
                                      ) : (
                                        <Tooltip title={OverwriteBtnTooltipMsg(this.state)}>
                                          <Radio.Button value="overwrite" disabled>Overwrite</Radio.Button>
                                        </Tooltip>
                                      )}
                                      <Radio.Button value="new-file" onChange={() => {
                                        const newVideoList = videoArr;

                                        let newTitle = newVideoList[index].title.split('.');
                                        newTitle[0] = newTitle[0].concat(`_(edited)${index > 0 ? `(${index})` : ''}`);
                                        newTitle = newTitle.join('.');

                                        newVideoList[index] = {
                                          ...newVideoList[index],
                                          title: newTitle
                                        };
                                      }}>Upload as new file</Radio.Button>
                                    </Radio.Group>

                                    {videoArr[index].selectedOptionName === 'new-file' && (
                                      <>
                                        <h4 style={{ marginTop: 10 }}>Title:</h4>
                                        <Input
                                          placeholder="myNewVideo.webm"
                                          ref="title"
                                          name="title"
                                          id="title"
                                          value={videoArr[index].title}
                                          onChange={e => {
                                            const newVideoList = videoArr;
                                            newVideoList[index] = {
                                              ...newVideoList[index],
                                              title: e.target.value
                                            };
                                            this.setState({videos: newVideoList});
                                          }}
                                          required={true} />
                                      </>
                                    )}

                                    <h4 style={{ marginTop: 10 }}>Upload comment:</h4>
                                    <Input.TextArea
                                      name="comment"
                                      id="comment"
                                      value={videoArr[index].comment}
                                      onChange={e => {
                                        const newVideoList = videoArr;
                                        newVideoList[index] = {
                                          ...newVideoList[index],
                                          comment: e.target.value
                                        };
                                        this.setState({videos: newVideoList});
                                      }} />

                                    <h4 style={{ marginTop: 10 }}>Text:</h4>
                                    <Input.TextArea
                                      name="text"
                                      id="text"
                                      value={videoArr[index].text}
                                      onChange={e => {
                                        const newVideoList = videoArr;
                                        newVideoList[index] = {
                                          ...newVideoList[index],
                                          text: e.target.value
                                        };
                                        this.setState({videos: newVideoList});
                                      }} />
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                          {(this.state.videos.length > 1 && index < this.state.videos.length-1) && <Divider />}
                        </>
                      ))}
                      {this.checkVideoTitles() && (
                        <div className="upload-button" style={{ marginTop: 10 }}>
                          {this.state.user ? (
                            <Button
                              type="primary"
                              onClick={e => {
                                this.setState({ upload: true, displayLoadingMessage: true, displaynewVideoName: true, loading: true, currentTask: 'uploading to Wikimedia Commons', progressPercentage: 0 }, () => {
                                  this.onSubmit(e);
                                });
                              }}
                              loading={this.state.loading}
                              block
                            >
                              <Icon type="upload" /> Upload to Commons
                            </Button>
                          ) : (
                            <Tooltip
                              placement="topLeft"
                              title="Login to Upload to Wikimedia Commons"
                            >
                              <Button
                                type="primary"
                                onClick={() => showNotificationWithIcon("info", WaitMsg)}
                                disabled
                                block
                              >
                                <Icon type="upload" /> Upload to Commons
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </>
                </Col>
              )}
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
