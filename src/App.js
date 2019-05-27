import React, { Component } from 'react';

import { Input, Typography, Layout, Upload, InputNumber, Icon, Col, Row, Button, Anchor } from 'antd';
import { Player } from 'video-react';
import { Form, FormGroup, Label} from 'reactstrap';

import './App.css';
import "antd/dist/antd.css";
import "../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';

const { Header, Content, Footer } = Layout;
const Search = Input.Search;

class App extends Component {

    constructor(props) {
      super(props);

      this.onChangeFrom_time = this.onChangeFrom_time.bind(this);
      this.onChangeTo_time = this.onChangeTo_time.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.handleValueChange = this.handleValueChange.bind(this);
      this.updatePlayerInfo = this.updatePlayerInfo.bind(this);

    this.state = {
      from_time: '',
      to_time: '',
      inputVideoUrl: ''
    }
  }

  componentDidUpdate(prevProps, prevState) {
  if (this.state.playerSource != prevState.playerSource) {
    this.refs.player.load();
  }
}

handleValueChange(e) {
  var value = e.target.value;
  this.setState({
    [e.target.id]: value
  });
}

  onChangeFrom_time(e) {
    this.setState({
      from_time: e.target.value
    });
  }

  onChangeTo_time(e) {
    this.setState({
      to_time: e.target.value
    });
  }

  updatePlayerInfo() {
  this.setState({
    playerSource: this.state.inputVideoUrl
  })
}


  onSubmit(e) {
    e.preventDefault();
    const obj = {
      from_time: this.state.from_time,
      to_time: this.state.to_time,
      inputVideoUrl: this.state.inputVideoUrl
    };
    axios.post('http://localhost:4000/send', obj)
        .then(res => console.log(res.data));

    this.setState({
      from_time: '',
      to_time: '',
      from_location: '',
      inputVideoUrl: ''
    })
  }
  render() {
    const { classes } = this.props;
    const { from_time, to_time, out_location } = this.state;
    return (
        <Layout className="layout">
          <Header>
            <Typography.Title level={2} style={{ color: 'white' }}> VideoCutTool</Typography.Title>
          </Header>
          <form onSubmit={this.onSubmit}>
          <Content className='Content' style={{ padding: '50px 50px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <div>
                  <div className="docs-example">
                    <Form>
                      <FormGroup>
                        <Label for="inputVideoUrl">Video Url</Label>
                        <Input
                          ref="inputVideoUrl"
                          name="inputVideoUrl"
                          id="inputVideoUrl"
                          value={this.state.inputVideoUrl}
                          onChange={this.handleValueChange}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Button type="primary" onClick={this.updatePlayerInfo}>
                          Update
                        </Button>
                      </FormGroup>
                    </Form>
                    <br />
                    <Player ref="player" videoId="video-1">
                      <source src={this.state.playerSource} />
                    </Player>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <h2>Video Trim Settings</h2>
                <Row gutter={10}>
                  <Col span={6}>
                    <Typography.Text strong style={{paddingRight: '0.2rem'}}>From</Typography.Text>
                     <div className="form-group">
                      <Input placeholder="00:00:00"
                        label="from_time"
                        ref="from_time"
                        value={this.state.from_time}
                        onChange={this.onChangeFrom_time}/>
                      </div>
                  </Col>
                  <Col span={6}>
                    <Typography.Text strong style={{paddingRight: '0.2rem'}}>To</Typography.Text>
                     <div className="form-group">
                      <Input placeholder="00:00:00"
                        label="to_time"
                        ref="to_time"
                        value={this.state.to_time}
                        onChange={this.onChangeTo_time}/>
                     </div>
                  </Col>
                </Row>
                <br />
                <div className="form-group">
                  <Button type="primary"
                    onClick={this.onSubmit}
                    color="primary"
                    value="Submitted" >Trim
                  </Button>
                </div>
              </Col>
            </Row>
              <br />
          </Content>
          </form>
          <Footer style={{ textAlign: 'center' }}>
             © 2018 <a href="https://www.mediawiki.org/wiki/User:Gopavasanth"><span> Gopa Vasanth </span></a> |
            <a href="https://github.com/gopavasanth/VideoCutTool"><span> Github </span></a>
          </Footer>
        </Layout>
    );
  }
}

export default App;
