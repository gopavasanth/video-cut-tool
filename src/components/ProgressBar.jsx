import { Progress, Spin} from 'antd';
import React from 'react';
import { Message } from '@wikimedia/react.i18n';

function ProgressBar(props) {
  if (props.info === null) return <Spin/>;
  const { bitrate, frame, progress, speed, time } = props.info;

  return (
    <div id="progress-bar-wrapper">
      <div className="progress-bar-info">
        <div className="progress-info-container">
          <span className="progress-info-title">
            <Message id="progress-bitrate" />
          </span>
          <span className="progress-info-value">{bitrate}</span>
        </div>
        <div className="progress-info-container">
          <span className="progress-info-title">
            <Message id="progress-time" />
          </span>
          <span className="progress-info-value">{time}</span>
        </div>
        <div className="progress-info-container">
          <span className="progress-info-title">
            <Message id="progress-speed" />
          </span>
          <span className="progress-info-value">{speed}</span>
        </div>
        <div className="progress-info-container">
          <span className="progress-info-title">
            <Message id="progress-frame" />
          </span>
          <span className="progress-info-value">{frame}</span>
        </div>
      </div>
      {!progress && <div class="progress-bar-indeterminant" />}
      {progress && <Progress percent={progress} status="active" />}
    </div>
  );
}
export default ProgressBar;
