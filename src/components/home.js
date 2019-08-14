import React, { Component } from 'react';

import { Menu, Steps, Input, notification, Slider, Progress, Divider, Typography, Layout, Icon, Col, Radio, Form, Row, Button, Checkbox, InputNumber } from 'antd';
import { Player } from 'video-react';
import { FormGroup } from 'reactstrap';
import Popup from "reactjs-popup";
import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

import '../App.css';
import "antd/dist/antd.css";
import { css } from '@emotion/core';
import "../../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';
import Draggable from 'react-draggable';
import { SyncLoader } from 'react-spinners';

const API_URL = 'http://localhost:4000'

const { Header, Content, Footer } = Layout;
const { Step } = Steps;

const showNotificationWithIconToAdd = type => {
  notification[type]({
    message: 'Notification !',
    description:
      'Your turned on a new feature',
  });
};

const showNotificationWithIconToRemove = type => {
  notification[type]({
    message: 'Notification !',
    description:
      'Your turned off a new feature',
  });
};

const showNotificationWithIconToWait = type => {
  notification[type]({
    message: 'Notification !',
    description:
      'Your video is being processing, Please wait until the new video is generated',
  });
};

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
    this.handleDrag = this.handleDrag.bind(this);
    this.videoName = this.videoName.bind(this);
    // this.rotatingDone = this.rotatingDone.bind(this);
    // this.state = { open: false };
    // this.openModal = this.openModal.bind(this);
    // this.closeModal = this.closeModal.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.beforeOnTapCrop = this.beforeOnTapCrop.bind(this);
    this.AfterOnTapCrop = this.AfterOnTapCrop.bind(this);
    this.upload = this.upload.bind(this);
    this.title = this.title.bind(this);

    this.rotateVideo = this.rotateVideo.bind(this);
    this.trimIntoMultipleVideos = this.trimIntoMultipleVideos.bind(this);
    this.trimIntoSingleVideo = this.trimIntoSingleVideo.bind(this);
    this.cropVideo = this.cropVideo.bind(this);
    this.UndodisableAudio = this.UndodisableAudio.bind(this);

    //Implementing steps
    this.changeStep = this.changeStep.bind(this);

    this.state = {
      deltaPosition: {
        x: 0,
        y: 0,
      },
      videos: [],
      trimMode: 'single',
      inputVideoUrl: '',
      trims: [{ from: '', to: '' }],
      out_width: '',
      out_height: '',
      x_value: '',
      y_value: '',
      display: false,
      displayCrop: false,
      displayTrim: false,
      displayRotate: false,
      displayPlayer: false,
      disableAudio: false,
      progressTrack: 0,
      videoName: '',
      displayVideoName: false,
      // this we are not using for now
      // rotate: false,
      // toggle: false,
      user: null,
      beforeOnTapCrop: true,
      AfterOnTapCrop: false,
      upload: false,
      title: '',
      trimVideo: false,
      rotateVideo: false,
      cropVideo: false,
      trimIntoSingleVideo: false,
      trimIntoMultipleVideos: false,
      //loading button
      loading: false,
      displayLoadingMessage: false,
      //Slider Values,
      changeStep: 0
    }
  }

  onChangeSlider(value, e) {
    let trims = this.state.trims;
    const id = e.target.id;
    const index = id.match(/\d+/g).map(Number)[0];
    // console.log('onChangeSlider: ', value);
    trims[index].from = value[0];
    trims[index].from = value[1];
  }

  enterLoading = () => {
    this.setState({
      loading: true,
      displayLoadingMessage: true
    });
  }

  changeStep=(num) => {
    this.setState({
      changeStep: num
    })
  }

  onLogin() {
    PopupTools.popup(`${API_URL}/video-cut-tool-back-end/login`, 'Wiki Connect', { width: 1000, height: 600 }, (err, data) => {
      if (!err) {
        console.log(' login response ', err, data);
        this.setState({ user: data.user })
        NotificationManager.success('Logged in successfully');
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.playerSource !== prevState.playerSource) {
      this.refs.player.load();  
    }
  }

  handleValueChange(e) {
    var value = e.target.value;
    this.setState({
      [e.target.id]: value
    });
  }

  rotatingDone() {
    this.setState(function (state) {
      return {
        toggle: !state.toggle,
        rotate: false
      };
    });
  }

  title() {
    this.setState({
      title: this.state.title
    })
  }

  // openModal() {
  //   this.setState({ open: true });
  // }
  // closeModal() {
  //   this.setState({ open: false });
  // }

  eventLogger = (e: MouseEvent, data: Object) => {
    console.log('Event: ', e);
    console.log('Data: ', data);
  };

  updatePlayerInfo() {
    this.setState({
      playerSource: this.state.inputVideoUrl,
      display: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false
    })
  }

  videoName() {
    this.setState({
      videoName: this.state.videoName
    })
  }

  rotateVideo() {
    this.setState({
      rotateVideo: true
    })
  }

  cropVideo() {
    this.setState({
      cropVideo: true
    })
  }

  trimIntoMultipleVideos() {
    this.setState({
      trimIntoMultipleVideos: true,
      trimIntoSingleVideo: false,
    })
  }

  trimIntoSingleVideo() {
    this.setState({
      trimIntoSingleVideo: true,
      trimIntoMultipleVideos: false,
    })
  }

  displayCrop() {
    this.setState({
      displayCrop: true,
      displayTrim: false,
      displayRotate: false,
      displayPlayer: false
    })
  }

  beforeOnTapCrop() {
    this.setState({
      beforeOnTapCrop: true
    })
  }

  AfterOnTapCrop() {
    this.setState({
      beforeOnTapCrop: false,
      AfterOnTapCrop: true
    })
  }

  displayTrim() {
    this.setState({
      displayTrim: true,
      displayPlayer: true,
      displayCrop: false,
      displayRotate: false,
      trimMode: 'trim',
    })
  }

  displayRotate() {
    this.setState({
      displayRotate: true,
      displayCrop: false,
      displayTrim: false,
      displayPlayer: false,
      trimMode: 'rotate',
    })
  }

  disableAudio() {
    this.setState({
      disableAudio: true
    })
  }
  
  UndodisableAudio() {
    this.setState({
      disableAudio: false
    })
  }

  displayVideoName() {
    this.setState({
      displayVideoName: true,
    })
  }

  upload() {
    this.setState({
      upload: true
    })
  }

  onChangeCrop(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  onChangeRadioButton = e => {
    this.setState({
      value: e.target.value,
    });
  };

  add = () => {
    let trims = this.state.trims;
    trims.push({ "from": '', "to": '' });
    this.setState({
      trims: trims
    });
  };

  onChange = (e) => {
    let trims = this.state.trims;
    const id = e.target.id;
    const index = id.match(/\d+/g).map(Number)[0];

    if (id.includes("from")) {
      trims[index].from = e.target.value;
    }
    else if (id.includes("to")) {
      trims[index].to = e.target.value;
    }
    this.setState({
      trims: trims
    })
  };

  loginRequest(e) {

  };

  getInitialState() {
    return {
      activeDrags: 0,
      deltaPosition: {
        x: 0, y: 0
      },
      controlledPosition: {
        x: -400, y: 200
      }
    };
  }

  handleDrag(e, ui) {
    const { x, y } = this.state.deltaPosition;
    this.setState({
      deltaPosition: {
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      }
    });
  };

  // handleStateChange(state) {
  //   // copy player state to this component's state
  //   this.setState({
  //     player: state
  //   });
  // }

  // onChangeSliders() {
  //   const sliders = this.state.sliders;  
  //   sliders.append(  {             
  //       <Slider                            
  //       range
  //       step={10}
  //       defaultValue={[20, 50]}
  //       onChange={this.onChangeSlider} 
  //     />
  //     this.setState({  sliders });
  //   }
  // }


  onSubmit(e) {
    e.preventDefault();
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.state.trims,
      out_width: this.state.out_width,
      out_height: this.state.out_height,
      x_value: this.state.x_value,
      y_value: this.state.y_value,
      trimMode: this.state.trimIntoSingleVideo ? 'single' : 'multiple',
      value: this.state.value,
      user: this.state.user,
      trimVideo: this.state.trimVideo,
      upload: this.state.upload,
      title: this.state.title,
      rotateVideo: this.state.rotateVideo,
      cropVideo: this.state.cropVideo,
      disableAudio: this.state.disableAudio,
      trimIntoMultipleVideos: this.state.trimIntoMultipleVideos,
      trimIntoSingleVideo: this.state.trimIntoSingleVideo
    };
    this.setState({ videos: []});
    axios.post(`${API_URL}/video-cut-tool-back-end/send`, obj)
      // .then(res => console.log(res.data.message))
      .then((res) => {
        // res.data.message === "Rotating success" ? null : this.setState({ progressTrack: 50 })
        console.log(res);
        //here var loading is for button loading 
        this.setState({ videos: res.data.videos, displayRotate: false, displayCrop: false, loading: false, displayPlayer: false, displayLoadingMessage: false, changeStep: 3 });
      });
    // console.log("Progress Track: " + this.state.progressTrack)

    // this.setState({
    //   from_location: '',
    //   inputVideoUrl: '',
    //   trims: [{from: '', to: ''}],
    //   out_width: '',
    //   out_height: '',
    //   x_value: '',
    //   y_value: '',
    //   trimMode: '',
    //   disableAudio: '',
    //   value: '',
    //   title: '',
    //   trimIntoMultipleVideos: false,
    //   trimIntoSingleVideo: false,
    //   cropVideo: false,
    //   rotateVideo: false
    // })
  }

  render() {
    const { deltaPosition } = this.state;
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    // console.log("============================");
    // console.log("Rotate Video: " + this.state.rotateVideo);
    // console.log("Trim in to Multiple videos: " + this.state.trimIntoMultipleVideos);
    // console.log("Trim in to single videos: " + this.state.trimIntoSingleVideo);
    // console.log("Crop Video: " + this.state.cropVideo);
    // console.log("Trim Video: " + this.state.trimVideo);
    // console.log("Diable Audio: " + this.state.disableAudio);

    const trims = this.state.trims.map((trim, i) =>
      (
        <Row gutter={10} key={i}>
          <Col span={6}>
            <Typography.Text strong style={{ paddingRight: '0.2rem' }}>From</Typography.Text>
            <div className="form-group">
              <Input placeholder="hh:mm:ss"
                id={`trim-${i}-from`}
                value={trim.from}
                // value={value[0]}
                onChange={this.onChange} />
            </div>
          </Col>
          <Col span={6}>
            <Typography.Text strong style={{ paddingRight: '0.2rem' }}>To</Typography.Text>
            <div className="form-group">
              <Input placeholder="hh:mm:ss"
                id={`trim-${i}-to`}
                value={trim.to}
                onChange={this.onChange} />
            </div>
          </Col>
        </Row>
      )
    );

    return (
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px' }}
          >
            {/* <a href="http://localhost:4000/video-cut-tool-back-end/login" style={{float: 'right'}} ><span> Login </span></a> */}
            {this.state.user ? (
              <Button
                primary
                className="c-auth-buttons__signup"
                style={{ float: 'right' }}
              >
                {this.state.user.username}
              </Button>
            ) : (
                <Button
                  primary
                  className="c-auth-buttons__signup"
                  style={{ float: 'right' }}
                  onClick={this.onLogin.bind(this)}
                >
                  Register / Login with Wikipedia
                  </Button>
              )}
            <Typography.Title level={4} style={{ color: 'White', float: 'left' }}> VideoCutTool</Typography.Title>
          </Menu>
        </Header>
        <form onSubmit={this.onSubmit}>
          <Content className='Content' style={{ padding: '50px 50px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <div style={{ padding: '1rem' }}>
                  <div className="docs-example" style={{ height: '100%' }}>
                  
                  <div id="steps"  align="center">
                    <Row gutter={25}>
                      <Col className="gutter-row" span={25}>
                      <Steps current={this.state.changeStep}>
                        <Step title="Video URL"/>
                        <Step title="Video Settings" />
                        <Step title="Result"  />
                      </Steps>
                      </Col>
                    </Row>
                  </div>
                  
                  <br />
                    <Form>
                      <FormGroup>
                        <Typography.Title level={4} style={{ color: 'Black' }}> Video URL <Button href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool" style={{ float: 'right' }}><Icon type="question-circle" /></Button></Typography.Title>
                        <Input
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/video.webm"
                          ref="inputVideoUrl"
                          name="inputVideoUrl"
                          id="inputVideoUrl"
                          value={this.state.inputVideoUrl}
                          // value="https://upload.wikimedia.org/wikipedia/commons/4/47/1_a%C3%B1o_-_Trata_de_imitar_las_palabras_que_escucha.webm"
                          onChange={this.handleValueChange}
                        />
                      </FormGroup>
                      <div>
                        <FormGroup>
                          <Button type="primary" onClick={(e)=> {this.updatePlayerInfo(); this.changeStep(1)}} style={{ marginTop: '12px' }}>
                            Play Video
                          </Button>
                          <br />
                          {this.state.videos && this.state.videos.map((video) => (
                            <video height="300px" width="450px" controls src={`${API_URL}/${video}`} />
                          ))}
                          {/* {
                            this.state.displayVideoName ?
                              <a href={`/../../../VideoCutTool-Back-End/routes/${this.state.videoName}`} download={`${this.state.videoName}`}>Download Your Video Here</a>
                              // <a href= {`http://localhost:4000/routes/${this.state.videoName}`} download="{this.state.videoName}">Click here to download your video {this.state.videoName} </a>
                              // <a href='/somefile.txt' download>Click to download</a>
                              : null
                          } */}
                        </FormGroup>
                      </div>
                    </Form>
                    <br />
                    {this.state.displayPlayer ?
                      <div className="player">
                        { this.state.displayLoadingMessage ? 
                          <div style={{ paddingLeft: "330px", align: "center" }}>
                            <p>Your video is processing...</p>
                              <SyncLoader
                              sizeUnit={"px"}
                              size={'20'}
                              color={'#001529'}
                              id="loading"
                              loading={this.state.loading} 
                            /> 
                          </div>: null
                        }
                        <br />
                        <Player ref={(player) => { this.player = player }} ref="player" videoId="video-1">
                          <source src={this.state.playerSource} />
                        </Player>
                      </div> : null
                    }
                    {/* Crop Video */}
                    {this.state.displayCrop ?
                      <div>
                        <div className="box" style={{ height: '100%', width: '100%', position: 'relative', overflow: 'auto' }}>
                          <div style={{ height: '100%', width: '100%' }}>
                            <Draggable bounds="parent"  {...dragHandlers}
                              axis="both"
                              onDrag={
                                (e, ui) => {
                                  // this.handleDrag(e, ui);
                                }
                              }
                              onStop={() => {
                                const parentBox = this.refs.player.video.video.getBoundingClientRect();
                                const dragElBox = this.dragRef.getBoundingClientRect();
                                const xPercentage = ((dragElBox.x - parentBox.x) / parentBox.width * 100);
                                const yPercentage = ((dragElBox.y - parentBox.y) / parentBox.height * 100);
                                const widthPercentage = (dragElBox.width / parentBox.width * 100);
                                const heightPercentage = (dragElBox.height / parentBox.height * 100);
                                this.setState({
                                  x_value: xPercentage,
                                  y_value: yPercentage,
                                  out_height: heightPercentage,
                                  out_width: widthPercentage,
                                })
                              }}
                            >
                              {/* {this is a problem} */}
                              {/* { this.state.displayLoadingMessage ? 
                                <div style={{ paddingLeft: "330px", align: "center" }}>
                                  <p>Your video is processing...</p>
                                    <SyncLoader
                                    sizeUnit={"px"}
                                    size={'20'}
                                    color={'#001529'}
                                    id="loading"
                                    loading={this.state.loading} 
                                  /> 
                                </div>: null
                              } */}
                              <div
                                ref={ref => this.dragRef = ref}
                                className="box" id="mydiv" onHeightReady={height => console.log("Height: " + height)}>
                                <div id="mydivheader"></div>
                              </div>
                            </Draggable>
                            {this.state.beforeOnTapCrop ?
                              <div>
                                <Player ref="player" height='300' width='300' videoId="video-1">
                                  <source src={this.state.playerSource} />
                                </Player>
                              </div> : null
                            }
                          </div>
                        </div>
                        <div>
                          <div className="box" >
                            {this.state.AfterOnTapCrop ?
                              <div>
                                { this.state.displayLoadingMessage ? 
                                  <div style={{ paddingLeft: "330px", align: "center" }}>
                                    <p>Your video is processing...</p>
                                      <SyncLoader
                                      sizeUnit={"px"}
                                      size={'20'}
                                      color={'#001529'}
                                      id="loading"
                                      loading={this.state.loading} 
                                    /> 
                                  </div>: null
                                }
                                <Player ref="player" videoId="video-1">
                                  <source src={this.state.playerSource} />
                                </Player>
                              </div> : null
                            }
                          </div>
                        </div>
                      </div> : null
                    }
                        <div> 
                          { this.state.displayLoadingMessage ? 
                            <div style={{ paddingLeft: "330px", align: "center" }}>
                              <p>Your video is processing...</p>
                                <SyncLoader
                                sizeUnit={"px"}
                                size={'20'}
                                color={'#001529'}
                                id="loading"
                                loading={this.state.loading} 
                              /> 
                            </div>: null
                          }
                          <br /> <br /> <br />
                        </div>

                    {/* Rotate Video */}
                    {this.state.displayRotate ?
                    <div>
                        <div id="RotatePlayer">
                          <Player ref="player" videoId="video-1">
                            <source src={this.state.playerSource} />
                          </Player>
                        </div>
                    </div> : null
                    }
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <h2 style={{ textAlign: 'center' }}>Video Settings </h2>
                {/* <div className="disableAudio" style={{ pos: '10px' }}>
                  <Checkbox onClick={this.disableAudio}> Remove Audio</Checkbox>
                </div> */}
                <Col span={10}>
                  <Button 
                    type="primary"
                    onClick={(e)=>{
                      this.disableAudio();
                      showNotificationWithIconToAdd('success');
                    }}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="sound" /> Remove Audio
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    disabled={!this.state.disableAudio}
                    onClick={(e)=> {
                      this.UndodisableAudio();
                      showNotificationWithIconToRemove('info');
                    }}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="undo" /> Undo
                  </Button>
                </Col>
                <br />
                <Col span={10}>
                  <Button
                    type="primary"
                    onClick={(e)=>{this.rotateVideo();
                        this.displayRotate();
                        showNotificationWithIconToAdd('success');
                    }}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="redo" /> Rotate Video
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    disabled={!this.state.rotateVideo}
                    onClick={(e) => {
                      this.setState({rotateVideo: false});
                      showNotificationWithIconToRemove('info');
                    }}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="undo" /> Undo
                  </Button>
                </Col>
                <br />
                <Col span={10}>
                <Button
                  type="primary"
                  onClick={(e)=> {
                    this.displayTrim();
                    showNotificationWithIconToRemove("success");
                    this.setState({
                      trimVideo: true
                    })
                   }}
                  style={{ margin: "1rem", marginLeft: "2.25rem" }}
                >
                  <Icon type="scissor" /> Trim Video
                </Button>
                </Col>
                <Col span={10}>
                  <Button
                      disabled={!this.state.trimVideo}
                      onClick={(e) => 
                        {
                          this.setState({trimVideo: false});
                          showNotificationWithIconToRemove('info');
                        }
                      }
                      style={{ margin: "1rem", marginLeft: "2.25rem" }}
                    >
                      <Icon type="undo" /> Undo
                  </Button>
                </Col>
                <Col span={10}>
                <Button
                  type="primary"
                  onClick={(e)=>{
                    this.cropVideo();
                    this.displayCrop();
                    showNotificationWithIconToAdd('success');
                  }}
                  style={{ margin: "1rem", marginLeft: "2.25rem" }}
                >
                  <Icon type="radius-setting" /> Crop Video
                </Button>
                </Col>
                <Col span={10}>
                  <Button
                    disabled={!this.state.cropVideo}
                    onClick={(e) => {
                      this.setState({cropVideo: false});
                      showNotificationWithIconToRemove('info');
                    }
                  }
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                      <Icon type="undo" /> Undo
                  </Button>
                </Col>
                {/* <Button type="primary"
                  onClick={(e) => {
                    this.displayRotate(e);
                    this.setState({ rotateVideo: true });
                  }
                  }
                  style={{ margin: "1rem", marginLeft: "2.25rem" }}
                >
                  <Icon type="reload" /> Rotate Video
                    </Button> */}
      
                {this.state.displayTrim ?
                  <div className="trim-settings">
                    <h2>VideoTrim Settings </h2>
                    {/* {trims} */}
                    {
                          this.state.trims.map((trim, i) => (
                            <React.Fragment>
                              <Slider
                              range
                              step={1}
                              min={1}
                              max={100}
                              value={[trim.from, trim.to]}
                              onChange={(obj) => 
                              {
                                let trims = this.state.trims;
                                trims[i].from = obj[0];
                                trims[i].to = obj[1];
                                this.setState({
                                  trims: trims
                                })
                              }}
                            />
                            <Row gutter={10} key={i}>
                              <Col span={6}>
                                <Typography.Text strong style={{ paddingRight: '0.2rem' }}>From</Typography.Text>
                                <div className="form-group">
                                  <Input placeholder="hh:mm:ss"
                                    id={`trim-${i}-from`}
                                    value={trim.from}
                                    // value={value[0]}
                                    onChange={this.onChange} />
                                </div>
                              </Col>
                              <Col span={6}>
                                <Typography.Text strong style={{ paddingRight: '0.2rem' }}>To</Typography.Text>
                                <div className="form-group">
                                  <Input placeholder="hh:mm:ss"
                                    id={`trim-${i}-to`}
                                    value={trim.to}
                                    onChange={this.onChange} />
                                </div>
                              </Col>
                            </Row>
                          </React.Fragment>
                          ))
                        }
                    <Button type="primary"
                      onClick={this.add}
                      style={{ margin: "1rem", marginLeft: "2.25rem" }}
                    >
                      <Icon type="plus" /> Add More
                    </Button>
                    <br />
                    <div className="form-group">
                      <div>
                        <Col span={12}>
                          <Radio checked={this.state.trimIntoSingleVideo} onClick={this.trimIntoSingleVideo}>As single video</Radio>
                        </Col>
                        <Col Span={12}>
                          <Radio checked={this.state.trimIntoMultipleVideos} onClick={this.trimIntoMultipleVideos}>As multiple videos</Radio>
                        </Col>
                      </div>
                    </div>
                  </div> : null
                }
                <Divider>Your new video</Divider>
                <Col span={10}>
                <Button type="primary"
                    onClick={(e)=>{
                      this.onSubmit(e);
                      this.enterLoading();
                      showNotificationWithIconToWait("info");
                      this.changeStep(2)
                    }}
                    name="rotate"
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                    shape="round"
                    loading={this.state.loading} 
                  >
                    <Icon type="download" /> Download
                  </Button>
                </Col>
                <Col span={12}>
                <Divider >    Enter the new video title</Divider>
                  <Input
                    placeholder="myNewVideo.webm"
                    ref="title"
                    name="title"
                    id="title"
                    value={this.state.title}
                    onChange={this.handleValueChange}
                    style={{padding: "10px"}}
                    required="true"
                  />
                  <Button type="primary"
                    onClick={(e) => {
                      this.setState({ upload: true });
                      this.onSubmit(e);
                    }
                    }
                    name="rotate"
                    shape="round"
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="upload" /> Upload to Commons
                  </Button>
                </Col>
              </Col>
            </Row>
            <br />
          </Content>
        </form>

        <Footer style={{ textAlign: 'center' }}>
          © 2019 <a href="https://www.mediawiki.org/wiki/User:Gopavasanth"><span> Gopa Vasanth </span> </a> and <b>Hassan Amin</b>  &hearts; |
            <a href="https://github.com/gopavasanth/VideoCutTool"><span> Github </span></a> |
            <a href="https://www.gnu.org/licenses/gpl-3.0.txt"><span> GNU Licence </span></a>
        </Footer>
      </Layout>
    );
  }
}

export default home;