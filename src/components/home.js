import React, { Component } from 'react';

import { Menu, Input, Progress, Typography, Layout, Icon, Col, Radio, Form, Row, Button, Checkbox } from 'antd';
import { Player } from 'video-react';
import { FormGroup, Label} from 'reactstrap';
import { Route, Redirect, Switch } from 'react-router';

import '../App.css';
import "antd/dist/antd.css";
import "../../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';

const { Header, Content, Footer } = Layout;

class home extends Component {

  constructor(props) {
    super(props);

    this.onChange= this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.updatePlayerInfo = this.updatePlayerInfo.bind(this);
    this.onChangeCrop = this.onChangeCrop.bind(this);
    this.displayCrop = this.displayCrop.bind(this);
    this.displayTrim = this.displayTrim.bind(this);
    this.disableAudio = this.disableAudio.bind(this);
    this.displayRotate = this.displayRotate.bind(this);

    this.state = {
      inputVideoUrl: '',
      trims: [{from: '', to: ''}],
      out_width: '',
      out_height: '',
      x_value: '',
      y_value: '',
      display: false,
      displayCrop: false,
      displayTrim: false,
      displayRotate: false,
      displayPlayer:false,
      disableAudio: false,
      progressTrack: 0
    }
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

  updatePlayerInfo() {
    this.setState({
      playerSource: this.state.inputVideoUrl,
      display: true,
      displayPlayer: true
    })
  }

  displayCrop() {
    this.setState({
      displayCrop: true,
      displayTrim: false,
      displayRotate: false
    })
  }

  displayTrim() {
    this.setState({
      displayTrim: true,
      displayCrop: false,
      displayRotate: false
    })
  }

  displayRotate(){
    this.setState({
      displayRotate: true,
      displayCrop: false,
      displayTrim: false
    })
  }

  disableAudio() {
    this.setState({
      disableAudio: true
    })
  }

  onChangeCrop(e){
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
    trims.push({"from":'',"to":''});
    this.setState({
      trims: trims
    });
  };

  onChange = (e) => {
    let trims = this.state.trims;
    const id = e.target.id;
    const index = id.match(/\d+/g).map(Number)[0];

    if( id.includes("from") ) {
      trims[index].from = e.target.value;
    }
    else if ( id.includes("to") ) {
      trims[index].to = e.target.value;
    }
    this.setState({
      trims: trims
    })
  };

  loginRequest(e){

  }

  onSubmit(e) {
    e.preventDefault();
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.state.trims,
      out_width: this.state.out_width,
      out_height: this.state.out_height,
      x_value: this.state.x_value,
      y_value: this.state.y_value,
      trimMode: e.target.name,
      disableAudio: this.state.disableAudio,
      value: this.state.value
    };

    axios.post('http://localhost:4000/send', obj)
        .then(res => console.log(res.data.message))
        .then(this.setState({ progressTrack: 100 }));
          console.log("Progress Track: " + this.state.progressTrack)

    this.setState({
      from_location: '',
      inputVideoUrl: '',
      trims: [{from: '', to: ''}],
      out_width: '',
      out_height: '',
      x_value: '',
      y_value: '',
      trimMode: '',
      disableAudio: '',
      value: ''
    })
  }

  render() {
    const { out_location } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const fields = this.state.fields;
    const trims = this.state.trims.map((trim, i) =>
        (
            <Row gutter={10} key={i}>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>From</Typography.Text>
                <div className="form-group">
                  <Input placeholder="hh:mm:ss"
                         id={`trim-${i}-from`}
                         value={trim.from}
                         onChange={this.onChange}/>
                </div>
              </Col>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>To</Typography.Text>
                <div className="form-group">
                  <Input placeholder="hh:mm:ss"
                         id={`trim-${i}-to`}
                         value={trim.to}
                         onChange={this.onChange}/>
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
              <Menu.Item key="1" onClick={this.loginRequest} style={{ float: 'right',color: 'White' }}>
                <Icon type="login" /> Login
              </Menu.Item>
              <Typography.Title level={4} style={{ color: 'White', float: 'left' }}> VideoCutTool</Typography.Title>
            </Menu>
          </Header>
          <form onSubmit={this.onSubmit}>
            <Content className='Content' style={{ padding: '50px 50px' }}>
              <Row gutter={16}>
                <Col span={16}>
                  <div style={{padding: '1rem'}}>
                    <div className="docs-example" style ={{ height: '100%' }}>
                      <Form>
                        <FormGroup>
                            <Typography.Title level={4} style={{ color: 'Black' }}> Video URL <Button href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool" style={{float: 'right'}}><Icon type="question-circle"  /></Button></Typography.Title>
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
                            <Button type="primary"  onClick={this.updatePlayerInfo} style={{marginTop: '12px'}}>
                              Play Video
                            </Button>
                          </FormGroup>
                        </div>
                      </Form>
                      <br />
                      { this.state.displayPlayer ?
                        <div className="player">
                          <div id="mydiv">
                            <div id="mydivheader"></div>
                          </div>
                          <Player ref="player" videoId="video-1">
                            <source src={this.state.playerSource}/>
                          </Player> 
                          <Progress percent={this.state.progressTrack} status="active" />
                        </div>: null
                      }
                    </div>
                  </div>
                </Col>
                    <Col span={8}>
                    <h2 style={{ textAlign: 'center' }}>Video Settings </h2>
                    <div className="disableAudio" style={{ pos: '10px' }}>
                      <Checkbox onClick={this.disableAudio}> Remove Audio</Checkbox>
                    </div>
                    <br />
                    <Button type="primary"
                            onClick={this.displayTrim}
                            style={{margin: "1rem", marginLeft: "2.25rem"}}
                    >
                            <Icon type="plus"/> Trimming
                    </Button>
                    <Button type="primary"
                          onClick={this.displayCrop}
                          style={{margin: "1rem", marginLeft: "2.25rem"}}
                      >
                            <Icon type="plus"/> Cropping
                    </Button>
                    <Button type="primary"
                          onClick={this.displayRotate}
                          style={{margin: "1rem", marginLeft: "2.25rem"}}
                      >
                            <Icon type="plus"/> Rotate Video
                    </Button>

                            { this.state.displayTrim ?
                                  <div className="trim-settings">
                                    <h2>Video Trim Settings </h2>
                                    {trims}
                                     <Button type="primary"
                                            onClick={this.add}
                                            style={{margin: "1rem", marginLeft: "2.25rem"}}
                                    >
                                      <Icon type="plus"/> Add More
                                    </Button>
                                    <br/>
                                    <div className="form-group">
                                        <div>
                                          <Col span={12}>
                                            <Button type="primary"
                                                    onClick={this.onSubmit}
                                                    name="single"
                                                    color="primary"
                                                    value="Submitted">
                                              <Icon type="radius-setting"/> As Single Video
                                            </Button>
                                          </Col>
                                          <Col Span={12}>
                                            <Button type="primary"
                                                    onClick={this.onSubmit}
                                                    color="primary"
                                                    name="multiple"
                                                    value="Submitted">
                                              <Icon type="radius-setting"/> As Multiple Videos
                                            </Button>
                                          </Col>
                                          <Button
                                              color="primary"
                                              style={{marginLeft: '10px', marginTop: '10px'}}
                                              value="Submitted"
                                          >
                                            <Icon type="upload"/>Upload to Commons
                                          </Button>
                                        </div>
                                  </div>
                                </div> : null
                            }
                            { this.state.displayCrop ?
                            <div className="crop-settings">
                              <h2>Video Crop Settings </h2>
                              <Row gutter={10}>
                                <Col span={6}>
                                  <Typography.Text strong style={{paddingRight: '0.2rem'}}>Out Width</Typography.Text>
                                  <div className="form-group">
                                    <Input placeholder="xxx"
                                           ref="out_width"
                                           name="out_width"
                                           id="out_width"
                                           value={this.state.out_width}
                                           onChange={this.onChangeCrop}/>
                                  </div>
                                </Col>
                                <Col span={6}>
                                  <Typography.Text strong style={{paddingRight: '0.2rem'}}>Out Height</Typography.Text>
                                  <div className="form-group">
                                    <Input
                                        placeholder="xxx"
                                        ref="out_height"
                                        name="out_height"
                                        id="out_height"
                                        value={this.state.out_height}
                                        onChange={this.onChangeCrop}
                                    />
                                  </div>
                                  </Col>
                                <Col span={6}>
                                  <Typography.Text strong style={{paddingRight: '0.2rem'}}>X</Typography.Text>
                                  <div className="form-group">
                                    <Input placeholder="xxx"
                                           name="x_value"
                                           id="x_value"
                                           value={this.state.x_value}
                                           onChange={this.onChangeCrop}/>
                                  </div>
                                </Col>
                                <Col span={6}>
                                  <Typography.Text strong style={{paddingRight: '0.2rem'}}>Y</Typography.Text>
                                  <div className="form-group">
                                    <Input placeholder="xxx"
                                           name="y_value"
                                           id="y_value"
                                           value={this.state.y_value}
                                           onChange={this.onChangeCrop}/>
                                  </div>
                                </Col>
                                </Row>
                                <br/>
                                  <div className="form-group">
                                    <Button type="primary"
                                            onClick={this.onSubmit}
                                            color="primary"
                                            name="crop"
                                            value="Submitted">
                                      <Icon type="radius-setting"/> Crop
                                    </Button>
                                    <Button
                                        color="primary"
                                        style={{marginLeft: '10px'}}
                                        value="Submitted"
                                    >
                                      <Icon type="upload"/>Upload to Commons
                                    </Button>
                                  </div>
                          </div> : null
                         }
                         { this.state.displayRotate ?
                             <div className="displayRotate">
                             <h2> Video Rotate Settings </h2>
                               <Radio.Group onChange={this.onChangeRadioButton} value={this.state.value}>
                                 <Radio style={radioStyle} value={0}>
                                   90 CounterCLockwise and Vertical Flip
                                 </Radio>
                                 <Radio style={radioStyle} value={1}>
                                   90 Clockwise
                                 </Radio>
                                 <Radio style={radioStyle} value={2}>
                                   90 CounterClockwise
                                 </Radio>
                                 <Radio style={radioStyle} value={3}>
                                   90 Clockwise and Vertical Flip
                                 </Radio>
                               </Radio.Group>
                               <Button type="primary"
                                     onClick={this.onSubmit}
                                     name="rotate"
                                     style={{margin: "1rem", marginLeft: "2.25rem"}}
                                 >
                                       <Icon type="reload" /> Rotate Video
                               </Button>
                             </div> : null
                         }
                    </Col>
              </Row>
              <br />
            </Content>
          </form>
          <Footer style={{ textAlign: 'center' }}>
            © 2018 <a href="https://www.mediawiki.org/wiki/User:Gopavasanth"><span> Gopa Vasanth </span></a> |
            <a href="https://github.com/gopavasanth/VideoCutTool"><span> Github </span></a> |
            <a href="https://www.gnu.org/licenses/gpl-3.0.txt"><span> GNU Licence </span></a>
          </Footer>
        </Layout>
    );
  }
}

export default home;
