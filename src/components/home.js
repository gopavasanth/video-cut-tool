import React, { Component } from 'react';

import { Menu, Input, Progress, Divider, Typography, Layout, Icon, Col, Radio, Form, Row, Button, Checkbox } from 'antd';
import { Player } from 'video-react';
import { FormGroup } from 'reactstrap';
import Popup from "reactjs-popup";
import PopupTools from 'popup-tools';
import { NotificationManager } from 'react-notifications';

import '../App.css';
import "antd/dist/antd.css";
import "../../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';
import Draggable from 'react-draggable';

const API_URL = 'http://localhost:4000'

const { Header, Content, Footer } = Layout;

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
    }
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
        this.setState({ videos: res.data.videos, displayRotate: false });
        // if (res.data.message === "Rotating Sucess" || res.data.message === "Cropping Sucess") {
        //   this.setState({ progressTrack: 100 });
        //   this.setState({ displayVideoName: true })
        //   this.setState({ videoName: res.data.videoName });
        //   console.log(res.data.message);
        //   console.log("VideoName: " + res.data.videoName)
        // }
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
    console.log("============================");
    console.log("Rotate Video: " + this.state.rotateVideo);
    console.log("Trim in to Multiple videos: " + this.state.trimIntoMultipleVideos);
    console.log("Trim in to single videos: " + this.state.trimIntoSingleVideo);
    console.log("Crop Video: " + this.state.cropVideo);
    console.log("Trim Video: " + this.state.trimVideo);
    console.log("Diable Audio: " + this.state.disableAudio);

    const trims = this.state.trims.map((trim, i) =>
      (
        <Row gutter={10} key={i}>
          <Col span={6}>
            <Typography.Text strong style={{ paddingRight: '0.2rem' }}>From</Typography.Text>
            <div className="form-group">
              <Input placeholder="hh:mm:ss"
                id={`trim-${i}-from`}
                value={trim.from}
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
                    <Form>
                      <FormGroup>
                        <Typography.Title level={4} style={{ color: 'Black' }}> Video URL <Button href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool" style={{ float: 'right' }}><Icon type="question-circle" /></Button></Typography.Title>
                        <Input
                          placeholder="https://upload.wikimedia.org/wikipedia/commons/video.webm"
                          ref="inputVideoUrl"
                          name="inputVideoUrl"
                          id="inputVideoUrl"
                          value={this.state.inputVideoUrl}
                          onChange={this.handleValueChange}
                        />
                      </FormGroup>
                      <div>
                        <FormGroup>
                          <Button type="primary" onClick={this.updatePlayerInfo} style={{ marginTop: '12px' }}>
                            Play Video
                            </Button>
                          <br />
                          {this.state.videos && this.state.videos.map((video) => (
                            <video controls src={`${API_URL}/${video}`} />
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
                        <Player ref="player" videoId="video-1">
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
                                <Player ref="player" videoId="video-1">
                                  <source src={this.state.playerSource} />
                                </Player>
                              </div> : null
                            }
                          </div>

                        </div>
                      </div> : null
                    }

                    {/* Rotate Video */}
                    {this.state.displayRotate ?
                      <div>
                        <div id="RotatePlayer">
                          <Player ref="player" videoId="video-1">
                            <source src={this.state.playerSource} />
                          </Player>
                          {/* <Popup
                              open={this.state.open}
                              closeOnDocumentClick
                              onClose={this.closeModal}
                            >
                                <a className="close" onClick={this.closeModal}>
                                  &times;
                                </a>
                                <img
                                    src={ this.state.toggle ? "https://upload.wikimedia.org/wikipedia/commons/c/c7/Commons-logo-square.png"
                                        : "https://upload.wikimedia.org/wikipedia/commons/c/c7/Commons-logo-square.png"
                                    } style={{align: "middle"}}
                                    ref={elm => {
                                      this.image = elm;
                                    }}
                                    className={this.state.rotate ? "rotate" : ""}
                                  />

                            </Popup>                                 */}
                        </div>
                        {/* <Progress percent={this.state.progressTrack} status="active" />  */}
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
                  <Button type="primary"
                    onClick={this.disableAudio}
                    onChange={(e) => this.setState({ trimVideo: e.target.checked })}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="scissor" /> Remove Audio
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary"
                    onClick={this.UndodisableAudio}
                    onChange={(e) => this.setState({ trimVideo: e.target.checked })}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="scissor" /> Undo
                  </Button>
                </Col>
                <br />
                <Col span={10}>
                  <Button type="primary"
                    onClick={(e)=>{this.rotateVideo();
                        this.displayRotate();
                    }}
                    onChange={(e) => this.setState({ trimVideo: e.target.checked })}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="scissor" /> Rotate Video
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary"
                    onClick={(e) => this.setState({rotateVideo: false})}
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="scissor" /> Undo
                  </Button>
                </Col>
                <br />
                <Col span={10}>
                <Button type="primary"
                  onClick={(e)=> {
                    this.displayTrim();
                    this.setState({
                      trimVideo: true
                    })
                   }}
                  onChange={(e) => this.setState({ trimVideo: e.target.checked })}
                  style={{ margin: "1rem", marginLeft: "2.25rem" }}
                >
                  <Icon type="scissor" /> Trim Video
                </Button>
                </Col>
                <Col span={10}>
                  <Button type="primary"
                      onClick={(e) => this.setState({trimVideo: false})}
                      style={{ margin: "1rem", marginLeft: "2.25rem" }}
                    >
                      <Icon type="radius-upright" /> Undo
                  </Button>
                </Col>
                <Col span={10}>
                <Button type="primary"
                  onClick={(e)=>{this.cropVideo();
                  this.displayCrop()}}
                  onChange={(e) => this.setState({ trimVideo: e.target.checked })}
                  style={{ margin: "1rem", marginLeft: "2.25rem" }}
                >
                  <Icon type="scissor" /> Crop Video
                </Button>
                </Col>
                <Col span={10}>
                  <Button type="primary"
                      onClick={(e) => this.setState({cropVideo: false})}
                      style={{ margin: "1rem", marginLeft: "2.25rem" }}
                    >
                      <Icon type="radius-upright" /> Undo
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
                    <h2>Video Trim Settings </h2>
                    {trims}
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
                          {/* <Button type="primary"
                            onClick={(e) => {
                              this.setState({ trimIntoSingleVideo: true });
                              this.onSubmit(e);
                            }
                            }
                            name="single"
                            color="primary"
                            value="Submitted">
                            <Icon type="radius-setting" /> As Single Video
                          </Button> */}
                        </Col>
                        <Col Span={12}>
                          <Radio checked={this.state.trimIntoMultipleVideos} onClick={this.trimIntoMultipleVideos}>As multiple videos</Radio>
                          {/* <Button type="primary"
                            onClick={(e) => {
                              this.setState({ trimIntoMultipleVideos: true });
                              this.onSubmit(e);
                            }
                            }
                            color="primary"
                            name="multiple"
                            value="Submitted">
                            <Icon type="radius-setting" /> As Multiple Videos
                          </Button> */}
                        </Col>
                        <Button
                          color="primary"
                          style={{ marginLeft: '10px', marginTop: '10px' }}
                          value="Submitted"
                          upload={this.state.upload}
                        >
                          <Icon type="upload" />Upload to Commons
                        </Button>
                      </div>
                    </div>
                  </div> : null
                }
                {this.state.displayCrop ?
                  <div className="crop-settings">
                    <h2>Video Crop Settings </h2>
                    <br />
                    <div className="form-group">
                      <Button type="primary"
                        onClick={(e) => {
                          this.setState({
                            //progressbar rotate
                            // rotate: true,
                            beforeOnTapCrop: false,
                            AfterOnTapCrop: true,
                            cropVideo: true
                          });
                          // this.openModal(e);
                          // this.onSubmit(e);
                        }}
                        color="primary"
                        name="crop">
                        {/* value="Submitted"> */}
                        <Icon type="radius-setting" /> Crop
                      </Button>
                      <Button
                        color="primary"
                        style={{ marginLeft: '10px' }}
                        value="Submitted"
                      >
                        <Icon type="upload" />Upload to Commons
                      </Button>
                    </div>
                  </div> : null
                }
                <Divider>Your new video</Divider>
                <Col span={10}>
                  <Button type="primary"
                    onClick={this.onSubmit}
                    name="rotate"
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="download" /> Download
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary"
                    onClick={(e) => {
                      this.setState({ upload: true });
                      this.onSubmit(e);
                    }
                    }
                    name="rotate"
                    style={{ margin: "1rem", marginLeft: "2.25rem" }}
                  >
                    <Icon type="upload" /> Upload to Commons
                  </Button>
                  <Divider>Enter the new video title</Divider>
                  <Input
                    placeholder="myNewVideo.webm"
                    ref="title"
                    name="title"
                    id="title"
                    value={this.state.title}
                    onChange={this.handleValueChange}
                  />
                </Col>
              </Col>
            </Row>
            <br />
          </Content>
        </form>
        <Footer style={{ textAlign: 'center' }}>
          © 2019 <a href="https://www.mediawiki.org/wiki/User:Gopavasanth"><span> Gopa Vasanth </span> </a> built with <b>Hassan Amin</b> support &hearts; |
            <a href="https://github.com/gopavasanth/VideoCutTool"><span> Github </span></a> |
            <a href="https://www.gnu.org/licenses/gpl-3.0.txt"><span> GNU Licence </span></a>
        </Footer>
      </Layout>
    );
  }
}

export default home;