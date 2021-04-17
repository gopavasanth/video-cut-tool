import React  from 'react';
import { Tabs, Input, Typography, Icon, Button, Upload, Card, Form } from 'antd';
import { Message } from '@wikimedia/react.i18n';

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
                    <TabPane tab={<p><Icon type="link" /><Message id="upload-tab-video-url" /></p>} key="1">
                        <Form>
                            <Typography.Title level={4} style={{ color: "Black" }}>

                            </Typography.Title>
                            <Input
                                {...inputProps}
                            />
                        </Form>
                    </TabPane>
                    <TabPane tab={<p><Icon type="upload" /><Message id="upload-tab-upload-video" /></p>} key="2">
                        <div className="container-fluid">
                            <div className="pt-4">
                                <Dragger {...draggerProps}>
                                    <p className="ant-upload-drag-icon"></p>
                                    <p className="ant-upload-text"><Message id="upload-upload-text" /></p>
                                </Dragger>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
                <div className="p-2">
                    <Button
                        {...editButtonProps}
                    >
                        <Message id="upload-edit-button" />
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
