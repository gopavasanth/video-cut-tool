import React from "react";
import { Button, Icon } from "antd";
import { Message } from '@wikimedia/react.i18n';

class Setting extends React.Component {
    render () {
      return  (<div className="row">
                <div className="col-md-6">
                    <Button
                        type="primary"
                        disabled={this.props.property}
                        onClick={this.props.click}
                        block
                    >
                        <Icon type={this.props.icon} /> {this.props.text}
                    </Button>
                </div>
                <div className="col-md-6">
                    <Button
                        disabled={this.props.undoProperty}
                        onClick={this.props.undoClick}
                        block
                    >
                        <Icon type="undo" /> <Message id="undo" />
                    </Button>
                 </div>
            </div>);
    }
}

export default Setting;