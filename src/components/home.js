import React, { Component } from 'react';
import { Alert, Tooltip, Steps, Divider, Input, Layout, Icon, Col, Radio, Button, Progress } from 'antd';
import { Player, BigPlayButton } from 'video-react';
import DragResize from './DragResize';
import ProgressBar from './ProgressBar';
import Trim from './Trim';
import axios from "axios";
import io from 'socket.io-client';

import '../App.css';
import '../DragResize.css';
import '../style/dark-theme.css';
import '../style/progress-bar.css';
import 'antd/dist/antd.css';
import 'video-react/dist/video-react.css';
import UploadBox from './UploadBox';
import Footer from './Footer';
import Header from './Header';
import VideoSettings from './VideoSettings';
import NotifUtils from '../utils/notifications';
import withBananaContext from './withBananaContext';
import { Message } from '@wikimedia/react.i18n';

const { OverwriteBtnTooltipMsg, showNotificationWithIcon } = NotifUtils;
const ENV_SETTINGS = require("../env")();
// These are the API URL's
const API_URL = ENV_SETTINGS.backend_url;
const SOCKETIO_URL = ENV_SETTINGS.socket_io_url
const SOCKET_IO_PATH = ENV_SETTINGS.socket_io_path;

const { Content } = Layout;
const { Step } = Steps;

const socket = io(SOCKETIO_URL, { path: SOCKET_IO_PATH });

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

class Home extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.updatePlayerInfo = this.updatePlayerInfo.bind(this);
    this.onChangeCrop = this.onChangeCrop.bind(this);

    this.displayCrop = this.displayCrop.bind(this);
    this.displayTrim = this.displayTrim.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
    this.displayRotate = this.displayRotate.bind(this);
    this.displayVideoSettings = this.displayVideoSettings.bind(this);

    this.onDragStop = this.onDragStop.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.beforeOnTapCrop = this.beforeOnTapCrop.bind(this);
    this.AfterOnTapCrop = this.AfterOnTapCrop.bind(this);
    this.checkTitleInUrl = this.checkTitleInUrl.bind(this);
    this.checkFileExist = this.checkFileExist.bind(this);
    this.goToNextStep = this.goToNextStep.bind(this);
    this.getFileNameFromPath = this.getFileNameFromPath.bind(this);

    this.rotateVideo = this.rotateVideo.bind(this);
    this.cropVideo = this.cropVideo.bind(this);
    this.UndodisableAudio = this.UndodisableAudio.bind(this);
    this.RotateValue = this.RotateValue.bind(this);

    this.videoCanPlay = this.videoCanPlay.bind(this);

    //Implementing steps
    this.changeStep = this.changeStep.bind(this);

    this.state = {
      ...this.initalState(),
    }
    
    // Extract trims and related state. This will stop componenet re-rendering
    this.trims = [];
    this.trimMode = {
      trimIntoSingleVideo: true,
      trimIntoMultipleVideos: false
    }
  }

  initalState() {
    return {
      deltaPosition: {
        x: 0,
        y: 0
      },
      videos: [],
      inputVideoUrl: "",
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
      //loading button
      loading: false,
      displayLoadingMessage: false,
      progressPercentage: 0,
      currentTask: this.props.banana.i18n('task-processing'),
      //Slider Values,
      changeStep: 0,
      duration: 0,
      //display VideoSettings
      displayVideoSettings: false,
      displayURLBox: true,
      validateVideoURL: false,
      RotateValue: 3,
      rotateDegress: '',
      displaynewVideoName: false,
      DisplayFailedNotification: false,

      uploadedFile: null,
      fileList: [],
      videoReady: false,
      progressBarInfo: null
    }
  }

  componentDidMount() {
    socket.on('reconnect', (attemptNumber) => {
      // ...
      try {
        if (localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))) {
          socket.emit('authenticate', JSON.parse(localStorage.getItem('user')));
        }
      } catch (e) {
      }
    });
    this.setState({
      width: getWindowDimensions().width
    });
    socket.on('progress:update', data => {
      console.log(data)
      const progressData = data;
      console.log('ON PROCESSS', progressData)
      const { stage, status } = progressData;
      if (status === 'processing') {
        let currentTask = this.props.banana.i18n(`task-stage-${stage.replace(' ', '_')}`);
        if(stage === 'manipulations') {
          const tasks = [];
          if(this.state.rotateVideo){
            tasks.push(this.props.banana.i18n(`task-stage-rotating`))
          }

          if(this.state.disableAudio){
            tasks.push(this.props.banana.i18n(`task-stage-losing_audio`))
          }

          if(this.state.cropVideo){
            tasks.push(this.props.banana.i18n(`task-stage-cropping`))
          }

          if(this.state.trimVideo){
            tasks.push(this.props.banana.i18n(`task-stage-trimming`))
          }

          currentTask += ` (${tasks.join(", ")})`;
        }
        this.setState({
          progressPercentage: 50,
          currentTask: currentTask
        });
      } else if (status === 'done') {
        this.previewCallback({ data: { videos: progressData.outputs } })
      }
    });

    socket.on('progress:updateBar', data => {
      const { progress_info } = data;
      this.setState({
        progressBarInfo: progress_info
      });
    });

    // Check if title passed as parameter into url
    this.checkTitleInUrl();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.playerSource !== prevState.playerSource && this.refs.player) {
      console.log("error: " + this.refs.player);
      this.refs.player.load();
    }
  }

  resetState = () => {
    this.setState({ ...this.initalState() });
  }

  updateTrimsFromChild = (type, newValue) => {
    if(type === 'trims') {
      this.trims = newValue;  
    } else if (type === 'trimMode') {
      this.trimMode = newValue;
    }
  }

  enterLoading = () => {
    this.setState({
      loading: true,
      displayLoadingMessage: true,
      progressPercentage: 0,
      currentTask: this.props.banana.i18n('task-processing'),
    });
  };

  leaveLoading = () => {
    this.setState({
      loading: false,
      displayLoadingMessage: false,
      progressPercentage: 0,
      currentTask: this.props.banana.i18n('task-processing'),
    })
  }

  RotateValue(RotateValue) {
    RotateValue = (RotateValue + 1) % 4;
    this.setState({
      RotateValue: RotateValue,
      rotateDegress: (RotateValue === 3) ? '' : ' - ' + (RotateValue + 1) * 90 + 'deg'
    });

    if (RotateValue === 3) {
      this.setState({
        rotateVideo: false
      })
    }
  }

  changeStep = num => {
    this.setState({
      changeStep: num
    });
  };

  // Check if title passed as parameter into url
  checkTitleInUrl() {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const title = params.get('title');
    if (title) {
      var filePath = 'https://commons.wikimedia.org/wiki/File:' + title;
      this.setState({
        inputVideoUrl: filePath
      }, () => this.checkFileExist(filePath));
    }
  }

  getFileNameFromPath(filePath) {
    const splitPath = filePath.split('/');
    const length = splitPath.length;
    return splitPath[length - 1];
  }

  // Check if given file exists
  checkFileExist(filePath) {
    const fileName = this.getFileNameFromPath(filePath);
    const baseUrl = "https://commons.wikimedia.org/w/api.php?";
    const params = {
      "action": "query",
      "titles": fileName,
      "format": "json",
      "formatversion": 2,
      "origin": "*"
    }
    axios.get(baseUrl, {
      params: params
    })
      .then(response => {
        const pageObj = response.data.query.pages[0];
        if (pageObj.hasOwnProperty("missing")) {
          showNotificationWithIcon("error", this.props.banana.i18n('file-not-existing'), this.props.banana);
        }
        else {
          this.goToNextStep();
        }
      })
      .catch(error => {
        showNotificationWithIcon("error", this.props.banana.i18n('file-not-existing'), this.props.banana);
      })
  }

  // Go to step 2 directly
  goToNextStep() {
    this.updatePlayerInfo(this.state.inputVideoUrl);
    this.changeStep(1);
    this.setState({
      validateVideoURL: true,
      displayVideoSettings: true,
      upload: false,
      trimVideo: false,
      rotateVideo: false,
      cropVideo: false,
      trimIntoSingleVideo: true,
      trimIntoMultipleVideos: false,
      disableAudio: false,
      displayURLBox: false,
    });
  }

  handleValueChange(e) {
    var filePath = e.target.value;
    this.setState({
      inputVideoUrl: filePath
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
        `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=videoinfo&titles=${splittedUrl[splittedUrl.length - 1]}&viprop=user%7Curl%7Ccanonicaltitle%7Ccomment%7Curl&origin=*`
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
        title: this.state.uploadedFile === null ? decodeURIComponent(splittedUrl[splittedUrl.length - 1]).replace(/\s/g, '_') : this.state.uploadedFile.name.replace(/\s/g, '_'),
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


  displayVideoSettings() {
    this.setState({
      displayVideoSettings: true
    });
  }

  displayCrop() {
    this.setState({
      displayCrop: true,
      displayTrim: false,
      displayPlayer: false
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
    });
  }

  displayRotate() {
    this.setState({
      displayRotate: true,
      displayTrim: false,
      displayPlayer: false,
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

  onDragStop(data) {
    const { left, top, width, height } = data;
    this.setState({
      x_value: left,
      y_value: top,
      out_height: height,
      out_width: width
    });

  }

  onResizeStop(data) {
    const { left, top, width, height } = data;
    this.setState({
      x_value: left,
      y_value: top,
      out_height: height,
      out_width: width
    });
  }

  videoCanPlay(...args) {
    this.setState({
      videoReady: true
    })
  }

  previewCallback(res) {
    function previewComplete(banana) {
      self.setState(previewCompleteState);
      showNotificationWithIcon("success", banana.i18n('success'), banana);
    }

    let videos = [];

    const self = this;
    const previewCompleteState = {
      videos,
      displayRotate: false,
      displayCrop: false,
      loading: false,
      currentTask: this.props.banana.i18n('task-processing'),
      displayPlayer: false,
      displayLoadingMessage: false,
      changeStep: 3,
      displayVideoSettings: false
    };

    if (!this.state.upload) {
      if (res.data.videos.length > 0) {
        res.data.videos.map((item, index) => {
          let newVideoTitle = this.state.videos[index].title.split('.');
          let oldVideoTitle = this.state.videos[index].title.split('.');

          newVideoTitle[0] = newVideoTitle[0].concat('_(edited)');

          if (index > 0) newVideoTitle[0] = newVideoTitle[0].concat(`(${index})`);
          newVideoTitle[1] = item.split('.')[1];
          newVideoTitle = newVideoTitle.join('.');

          if (index > 0) oldVideoTitle[0] = oldVideoTitle[0].concat(`(${index})`);
          oldVideoTitle[1] = item.split('.')[1];
          oldVideoTitle = oldVideoTitle.join('.');

          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : currentDate.getMonth() + 1;
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
{{self|cc-by-sa-4.0}}\n
[[Category:VideoCutTool]]\n
{{Extracted from|File:${oldVideoTitle} }}`,
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
    return previewComplete(this.props.banana);
  }

  previewCallbackError(err) {
    console.log(err);
    const reason = err.response && err.response.text ? err.response.text : this.props.banana.i18n('error');
    showNotificationWithIcon("error", reason, this.props.banana);
    this.setState({ DisplayFailedNotification: true });
    this.leaveLoading();
  }

  // On Clicking the "Preview" button the values will submit to the back-end
  onSubmit(e) {
    e.preventDefault();
    const self = this;
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.trims,
      out_width: this.state.out_width,
      out_height: this.state.out_height,
      x_value: this.state.x_value,
      y_value: this.state.y_value,
      trimMode: this.trimMode.trimIntoSingleVideo ? "single" : "multiple",
      value: this.state.value,
      user: this.state.user,
      trimVideo: this.state.trimVideo,
      upload: this.state.upload,
      rotateVideo: this.state.rotateVideo,
      cropVideo: this.state.cropVideo,
      disableAudio: this.state.disableAudio,
      trimIntoMultipleVideos: this.trimMode.trimIntoMultipleVideos,
      trimIntoSingleVideo: this.trimMode.trimIntoSingleVideo,
      RotateValue: this.state.RotateValue,
      videos: this.state.upload
        ? this.state.videos.filter(video => video.displayUploadToCommons)
        : this.state.videos
    };

    let newVideos = this.state.videos;
    if (!this.state.upload && this.trims.length > 1) {
      for (let i = 0; i <= this.trims.length; i++) {
        newVideos.push(this.state.videos[0]);
      }
    }

    if (this.state.uploadedFile !== null) {
      let data = new FormData();
      data.append('video', this.state.uploadedFile);
      data.append('data', JSON.stringify(obj))
      this.setState({ currentTask: this.props.banana.i18n('task-uploading'), videos: newVideos });
      axios.post(`${API_URL}/video-cut-tool-back-end/send/upload`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function (progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          self.setState({ progressPercentage: percentCompleted });
        }
      }).then(res => {
        this.setState({ loading: true })

      }).catch(err => {
        this.previewCallbackError(err);
      })
    } else {
      axios.post(`${API_URL}/video-cut-tool-back-end/send`, obj).then(res => {
        this.setState({ loading: true })
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

  getSettings() {
    return [
      {
        icon: "sound",
        property: this.state.disableAudio,
        undoProperty: !this.state.disableAudio,
        click: () => this.disableAudio(),
        undoClick: () => this.UndodisableAudio(),
        text: this.props.banana.i18n('setting-audio'),
      },
      {
        icon: "redo",
        property: false,
        undoProperty: !this.state.rotateVideo,
        click: () => {
          this.rotateVideo();
          this.RotateValue(this.state.RotateValue);
          this.displayRotate();
        },
        undoClick: () => {
          this.RotateValue(2);
          this.displayRotate();
          this.setState({ rotateVideo: false });
        },
        text: this.props.banana.i18n('setting-rotate') + this.state.rotateDegress,
      },
      {
        icon: "scissor",
        property: this.state.trimVideo,
        undoProperty: !this.state.trimVideo,
        click: () => {
          this.displayTrim();
          this.setState({
            trimVideo: true
          });
        },
        undoClick: () => this.setState({ trimVideo: false, displayTrim: false }),
        text: this.props.banana.i18n('setting-trim'),
      },
      {
        icon: "radius-setting",
        property: this.state.cropVideo,
        undoProperty: !this.state.cropVideo,
        click: () => {
          this.cropVideo();
          this.displayCrop();
        },
        undoClick: () => {
          this.setState({ cropVideo: false });
        },
        text: this.props.banana.i18n('setting-crop'),
      }
    ]
  }


  getUploadProperties = () => {
    const { uploadedFile, fileList } = this.state;
    return {
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
      fileList,
    };
  }

  renderURLBox = () => {
    if (!this.state.displayURLBox) return null;
    const uploadProperties = this.getUploadProperties();

    const inputProps = {
      placeholder: "https://commons.wikimedia.org/wiki/File:video.webm",
      ref: (ref) => this.inputVideoUrl = ref,
      name: "inputVideoUrl",
      id: "inputVideoUrl",
      value: this.state.inputVideoUrl,
      onChange: this.handleValueChange
    }

    const editButtonProps = {
      type: "primary",
      disabled: !this.state.inputVideoUrl && this.state.uploadedFile === null,
      onClick: () => {
        if (!this.state.user) return alert(this.props.banana.i18n('login-alert'));
        if (this.state.uploadedFile !== null) {
          this.updatePlayerInfo(URL.createObjectURL(this.state.uploadedFile))
          this.setState({
            validateVideoURL: true
          })
          this.changeStep(1);
          this.setState({
            displayVideoSettings: true,
            upload: false,
            trimVideo: false,
            rotateVideo: false,
            cropVideo: false,
            disableAudio: false,
            displayURLBox: false,
          });
        } else {
          this.checkFileExist(this.state.inputVideoUrl);
        }
      },
      style: { marginTop: "12px" },
    }

    return (
      <div style={{ paddingTop: "2vh" }}>
        <UploadBox
          draggerProps={uploadProperties}
          inputProps={inputProps}
          editButtonProps={editButtonProps}
        />
      </div>)
  }

  render() {
    // Rotate video inside container and scale to fit height
    if (this.refs.player && this.state.changeStep !== 3) {
      const videoEl = document.querySelector('#video-player');
      const videoWidth = videoEl.offsetWidth;
      const videoHeight = videoEl.offsetHeight;

      // rotate video accourding to rotate value
      let transform = `rotate(${(this.state.RotateValue + 1) * 90}deg)`;

      // if video is rotated 90 or 180 deg then add scale
      if (this.state.RotateValue === 0 || this.state.RotateValue === 2) {
        const scale = videoHeight / videoWidth;
        transform += ` scale(${scale})`;
      }

      // Apply transform
      document.querySelector('#video-player').style.transform = transform;
    }

    console.log("URL: " + this.state.inputVideoUrl);

    return (
      <Layout className="layout">
        <Header
          parentUserUpdateCallback={(user) => { this.setState({ user: user }); }}
          parentLanguageUpdateCallback={this.props.parentLanguageUpdateCallback}
          socket={socket} width={this.state.width}
          api_url={API_URL} />
        <form onSubmit={this.onSubmit}>
          <Content className="Content" style={{ maxWidth: '99%' }}>
            <div className="row m-0">
              <div className="col-sm-12 col-md-8 p-4">
                <div>
                  <div className="docs-example" style={{ height: "100%" }}>
                    {
                      this.state.DisplayFailedNotification ? (
                        <div style={{ paddingBottom: "2rem" }}>
                          <Alert
                            message={<Message id="error" />}
                            type="error"
                            closable
                          />
                        </div>
                      ) : null
                    }
                    <div id="steps">
                      <div className="p-4">
                        <Steps current={this.state.changeStep}>
                          <Step title={<Message id="step-video-url" />} />
                          <Step title={<Message id="step-video-settings" />} />
                          <Step title={<Message id="step-result" />} />
                        </Steps>
                      </div>
                    </div>
                    {this.state.displayLoadingMessage ? (
                      <div
                        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                      >
                        {!this.state.upload && <ProgressBar info={this.state.progressBarInfo} />}
                        {/*Modify*/}
                        <p style={{ marginBottom: 0 }}>
                          <Message id="task-current" placeholders={[this.state.currentTask]} />
                        </p>
                        {this.state.upload && <Progress percent={this.state.progressPercentage} status="active" style={{ marginBottom: 10, padding: '0 5%' }} />}
                      </div>
                    ) : null}
                    {this.renderURLBox()}
                    <br />
                    {this.state.displaynewVideoName && (
                      <div>
                        {this.state.videos.length > 1 ? (
                          <>
                            <p style={{ margin: "5px 0" }}>
                              <Message id="new-video" placeholders={this.state.videos} />
                            </p>
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
                              <Message id="new-video" /> <a href={`https://commons.wikimedia.org/wiki/File:${this.state.videos[0].title}`} target="_blank" rel="noopener noreferrer">
                                https://commons.wikimedia.org/wiki/File:{this.state.videos[0].title}
                              </a>
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    {this.state.displayVideoSettings && this.state.trimVideo && (
                    <Trim
                      player={this.refs.player}
                      videoSelector='#video-player'
                      videoReady={this.state.videoReady}
                      trimsUpdater={this.updateTrimsFromChild}
                      ></Trim>
                     )}
                    {this.state.changeStep === 3 && this.state.videos.map(video => (
                      <div className="row" key={'preview-video-' + video.path}>
                        <div className="col-sm-12 p-2">
                          <div className="player">
                            <br />
                            <Player
                              refs={player => {
                                this.player = player;
                              }}
                              ref="player"
                              videoId="video-player"
                            >
                              <BigPlayButton position="center" />
                              <source src={`${API_URL}/${video.path}`} />
                            </Player>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Rotate and Crop Video */}
                    {this.state.displayVideoSettings || this.state.displayRotate ? (
                      <div id="RotateCropVideo">
                        <div
                          className="box"
                          style={{
                            height: "100%",
                            width: "100%",
                            position: "relative",
                            overflow: "hidden"
                          }}
                        >
                          {this.state.cropVideo && (
                            <DragResize
                              boundsEl='#video-player'
                              playerState={this.refs.player.getState()}
                              rotateValue={this.state.RotateValue}
                              onDragStop={this.onDragStop}
                              onResizeStop={this.onResizeStop}
                              videoReady={this.state.videoReady}
                            />
                          )}

                          <Player
                            ref="player"
                            videoId="video-player"
                            style={{ width: "100%", height: "100%" }}
                            onCanPlay={this.videoCanPlay}
                            muted={this.state.disableAudio}
                          >
                            <BigPlayButton position="center" />
                            <source src={this.state.playerSource} />
                          </Player>
                        </div>
                      </div>

                    ) : null}

                  </div>
                </div>
              </div>
              {/* Video Settings */}
              {(this.state.displayVideoSettings && this.state.validateVideoURL) && (
                <div className="col-sm-12 col-md-4 p-2" style={{ position: "sticky" }}>
                  <br />
                  <div className="videoSettings">
                    <h5 style={{ textAlign: "center" }}>
                      <Message id="step-video-settings-title" />
                    </h5>
                    <VideoSettings settings={this.getSettings()} />
                    <Divider />

                    <h5 style={{ textAlign: "center" }}>
                      <Message id="preview-title" />
                    </h5>
                    <Col style={{ textAlign: "center" }}>
                      <Button
                        type="primary"
                        onClick={e => {
                          if (this.state.user) {

                            this.enterLoading();
                            this.onSubmit(e);
                            showNotificationWithIcon("info", this.props.banana.i18n('notifications-wait'), this.props.banana);
                            this.changeStep(2);
                          } else {
                            alert(this.props.banana.i18n('login-alert-preview'));
                          }
                        }}
                        name="rotate"
                        style={{
                          height: "50px"
                        }}
                        disabled={!this.state.cropVideo && !this.state.rotateVideo && !this.state.trimVideo && !this.state.disableAudio}
                        shape="round"
                        loading={this.state.loading}
                      >
                        <Icon type="play-circle" /> <Message id="preview-text" />
                      </Button>
                    </Col>
                  </div>
                </div>
              )}
              {this.state.changeStep === 3 && (
                <div className="col-sm-12 col-md-4">
                  <>
                    <h5 style={{ textAlign: "center" }}>
                      <Message id="step-result-title" />
                    </h5>
                    {this.state.videos.map((video, index, videoArr) => (
                      <div key={'option-' + video.path}>
                        <div id={video.path.split('/').pop().split('.')[0]}>
                          <h6 className="final-video-title" style={{ textAlign: 'center' }}>{video.title}</h6>
                          <div className="button-columns row-on-mobile">
                            <div className="row">
                              <div className="col-sm-6 col-md-6 py-1">
                                <Button block type="primary">
                                  <a href={`${API_URL}/download/${video.path}`}>
                                    <Icon type="DownloadOutlined" /><Message id="step-result-choice-download" />
                                  </a>
                                </Button>
                              </div>
                              <div className="col-sm-6 col-md-6 py-1">
                                <Button
                                  block
                                  type="primary"
                                  onClick={() => {
                                    const newVideoList = videoArr;
                                    newVideoList[index] = {
                                      ...newVideoList[index],
                                      displayUploadToCommons: !newVideoList[index].displayUploadToCommons
                                    };
                                    this.setState({ videos: newVideoList });
                                  }}
                                >
                                  <Message id="step-result-choice-upload" /> <Icon type={videoArr[index].displayUploadToCommons ? "up" : "down"} />
                                </Button>
                              </div>
                            </div>
                            {videoArr[index].displayUploadToCommons ? (
                              <>
                                <Divider style={{ margin: '15px 0' }} />
                                <div className="displayUploadToCommons">
                                  <h6>
                                    <Message id="upload-action-title" />
                                  </h6>
                                  <Radio.Group
                                    defaultValue="new-file"
                                    value={videoArr[index].selectedOptionName}
                                    onChange={e => {
                                      const newVideoList = videoArr;
                                      newVideoList[index] = {
                                        ...newVideoList[index],
                                        selectedOptionName: e.target.value
                                      };
                                      this.setState({ videos: newVideoList });
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
                                      }}>
                                        <Message id="upload-action-overwrite" />
                                      </Radio.Button>
                                    ) : (
                                      <Tooltip title={OverwriteBtnTooltipMsg(this.state, this.props.banana)}>
                                        <Radio.Button value="overwrite" disabled>
                                          <Message id="upload-action-overwrite" />
                                        </Radio.Button>
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
                                    }}>
                                      <Message id="upload-action-new-file" />
                                    </Radio.Button>
                                  </Radio.Group>

                                  {videoArr[index].selectedOptionName === 'new-file' && (
                                    <>
                                      <h6 style={{ marginTop: 10 }}>
                                        <Message id="upload-action-new-file-title" />
                                      </h6>
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
                                          this.setState({ videos: newVideoList });
                                        }}
                                        required={true} />
                                    </>
                                  )}

                                  <h6 style={{ marginTop: 10 }}>
                                    <Message id="upload-comment" />
                                  </h6>
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
                                      this.setState({ videos: newVideoList });
                                    }} />

                                  <h6 style={{ marginTop: 10 }}>
                                    <Message id="upload-text" />
                                  </h6>
                                  <Input.TextArea
                                    style={{ height: "350px" }}
                                    name="text"
                                    id="text"
                                    value={videoArr[index].text}
                                    onChange={e => {
                                      const newVideoList = videoArr;
                                      newVideoList[index] = {
                                        ...newVideoList[index],
                                        text: e.target.value
                                      };
                                      this.setState({ videos: newVideoList });
                                    }} />
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                        {(this.state.videos.length > 1 && index < this.state.videos.length - 1) && <Divider />}
                      </div>
                    ))}
                    {this.checkVideoTitles() && (
                      <div className="upload-button" style={{ marginTop: 10 }}>
                        {this.state.user ? (
                          <Button
                            type="primary"
                            onClick={e => {
                              this.setState({ upload: true, displayLoadingMessage: true, displaynewVideoName: true, loading: true, currentTask: this.props.banana.i18n('task-uploading-wikimedia-commons'), progressPercentage: 0 }, () => {
                                this.onSubmit(e);
                              });
                              setTimeout(() => this.setState({ currentTask: this.props.banana.i18n('task-uploaded-wikimedia-commons'), loading: false, displayLoadingMessage: false }), 10000);
                            }}

                            loading={this.state.loading}
                            block
                          >
                            <Icon type="upload" /> <Message id="upload-button" />
                          </Button>
                        ) : (
                          <Tooltip
                            placement="topLeft"
                            title={<Message id="login-alert-upload" />}
                          >
                            <Button
                              type="primary"
                              onClick={() => showNotificationWithIcon("info", this.props.banana.i18n('notifications-wait'), this.props.banana)}
                              disabled
                              block
                            >
                              <Icon type="upload" /> <Message id="upload-button" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </>
                </div>
              )}
            </div>
            <br />
          </Content>
        </form>
        <Footer />
      </Layout >
    );
  }
}

export default withBananaContext(Home);
