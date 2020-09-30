import React from "react";
import { Button, Icon } from "antd";

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
                        <Icon type="undo" /> Undo
                    </Button>
                 </div>
            </div>);
    }
}

export default Setting;