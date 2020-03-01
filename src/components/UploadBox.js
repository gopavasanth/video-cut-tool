import React, { Component } from 'react';
import { Tabs, Input, Typography, Icon, Button, Upload, Card } from 'antd';
import { FormGroup } from 'reactstrap';

const { TabPane } = Tabs;
const { Dragger } = Upload;

export default class UploadBox extends React.Component {
    render() {
        const {
            draggerProps,
            inputProps,
            editButtonProps,
        } = this.props;

        return (
            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab={<p><Icon type="link" />Video URL</p>} key="1">
                        <FormGroup>
                            <Typography.Title level={4} style={{ color: "Black" }}>

                            </Typography.Title>
                            <Input
                                {...inputProps}
                            />
                        </FormGroup>
                    </TabPane>
                    <TabPane tab={<p><Icon type="upload" />Upload Video</p>} key="2">
                        <Dragger {...draggerProps}>
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Dragger>
                    </TabPane>
                </Tabs>
                <div className="p-2">
                    <Button
                        {...editButtonProps}
                    >
                        Edit Video
                        </Button>
                    <Button
                        type="default"
                        style={{ float: "right", marginTop: "12px" }}
                    >
                        <a href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool">
                            <Icon type="question-circle" />
                        </a>
                    </Button>
                </div>
            </Card>
        )
    }
}