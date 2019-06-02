import React, { Component } from 'react';

import { Menu, Input, Typography, Layout, Icon, Col, Form, Row, Button } from 'antd';
import { Player } from 'video-react';
import { FormGroup, Label} from 'reactstrap';

import './App.css';
import "antd/dist/antd.css";
import "../node_modules/video-react/dist/video-react.css"; // import css

import axios from 'axios';

const { Header, Content, Footer } = Layout;

class App extends Component {

    constructor(props) {
      super(props);

      this.onChange= this.onChange.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.handleValueChange = this.handleValueChange.bind(this);
      this.updatePlayerInfo = this.updatePlayerInfo.bind(this);

    this.state = {
      inputVideoUrl: '',
      trims: [{from: '', to: ''}]
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
    playerSource: this.state.inputVideoUrl
  })
}

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

  onSubmit(e) {
    e.preventDefault();
    const obj = {
      inputVideoUrl: this.state.inputVideoUrl,
      trims: this.state.trims,
    };
    axios.post('http://localhost:4000/send', obj)
        .then(res => console.log(res.data));

    this.setState({
      from_location: '',
      inputVideoUrl: '',
      trims: [{from: '', to: ''}],
    })
  }

  render() {
    const { out_location } = this.state;
    console.log(this.state.trims);

    const fields = this.state.fields;
    const trims = this.state.trims.map((trim, i) =>
        (
            <Row gutter={10} key={i}>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>From</Typography.Text>
                <div className="form-group">
                  <Input placeholder="00:00:00"
                         id={`trim-${i}-from`}
                         value={trim.from}
                         onChange={this.onChange}/>
                </div>
              </Col>
              <Col span={6}>
                <Typography.Text strong style={{paddingRight: '0.2rem'}}>To</Typography.Text>
                <div className="form-group">
                  <Input placeholder="00:00:00"
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
            <Menu.Item key="1" style={{ float: 'right',color: 'White' }}>Login</Menu.Item>
            <Typography.Title level={4} style={{ color: 'White', float: 'left' }}> VideoCutTool</Typography.Title>
          </Menu>
        </Header>
          <form onSubmit={this.onSubmit}>
          <Content className='Content' style={{ padding: '50px 50px' }}>
            <Row gutter={16}>
              <Col span={16}>
                <div>
                  <div className="docs-example">
                    <Form>
                      <FormGroup>
                       <Typography.Title level={4} style={{ color: 'Black' }}> Video URL</Typography.Title>
                        <Input
                          ref="inputVideoUrl"
                          name="inputVideoUrl"
                          id="inputVideoUrl"
                          value={this.state.inputVideoUrl}
                          onChange={this.handleValueChange}
                        />
                      </FormGroup>
                      <div>
                        <FormGroup>
                          <Button type="primary" onClick={this.updatePlayerInfo} style={{marginTop: '12px'}}>
                            Update
                          </Button>
                        </FormGroup>
                      </div>
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
                {trims}
                <Button type="primary"
                        onClick={this.add}
                        style={{margin: "1rem"}}
                >
                  <Icon type="plus" /> Add More
                </Button>
                <br />
                <div className="form-group">
                  <Button type="primary"
                    onClick={this.onSubmit}
                    color="primary"
                    value="Submitted" >Trim
                  </Button>
                  <Button type="primary"
                    color="primary"
                    style={{marginLeft: '10px'}}
                    value="Submitted" >Upload
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
