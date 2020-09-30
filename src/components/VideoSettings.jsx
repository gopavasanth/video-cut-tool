import React from "react";
import Setting from './Setting';

class VideoSettings extends React.Component {
    render () {
        return  (
        <div className="button-columns">
          <>
          {this.props.settings.map((elem) =>
              (<div>
                  <Setting {... elem} />
                  <br/>
                </div>)
            )}
          </>
        </div>);
    }
}

export default VideoSettings;