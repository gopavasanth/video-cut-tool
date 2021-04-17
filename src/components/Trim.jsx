import React, { useState, useReducer, useRef, useEffect, useLayoutEffect } from 'react';
import { Icon, Radio, Spin } from 'antd';
import { Message } from '@wikimedia/react.i18n';
import { formatTime } from '../utils/time';

import '../style/trim.css';

function Trim(props) {
  // Set main variables
  const thumbnailsCount = 12;
  const rangeOffset = 50;

  // Range schema is used to add a new timeline with fresh values
  const rangeSchema = {
    left: 0,
    right: 0,
    marker_position: 0,
    marker_time: 0,
    show_marker: false,
    from: 0,
    to: 0,
    playing: false,
    resizing: false,
    dragging: false,
    dragInitialX: 0,
  };

  // Manage touch and click events on one object
  const isTouch = 'ontouchstart' in window ? true : false;
  const events = {
    POINTER_DOWN: isTouch ? 'touchstart' : 'mousedown',
    POINTER_UP: isTouch ? 'touchend' : 'mouseup',
    POINTER_MOVE: isTouch ? 'touchmove' : 'mousemove',
  };

  // Destruct props
  const { player, videoReady, videoSelector, trimsUpdater } = props;
  const { player: playerState } = player.getState();

  // Main player element
  const mainVideoEl = useRef(null);

  // Hidden player and canvase elements (used to extract thumbnails)
  const trimVideoEl = useRef(null);
  const canvasEl = useRef(null);

  // Canvas context (used with canvasEl to extract thumbnails)
  const context = useRef(null);

  // The current thumbnail being extracted
  const currentTimelineImage = useRef(0);

  // Get the interval at which the thumbnail will be extracted
  const timelineInterval = useRef(0);

  // The total duration of all trimmed videos
  const totalDuration = useRef(0);

  // Bounds element to limit range
  const containerBounds = useRef({});

  // The current range element being manipulated
  const currentRangeIndex = useRef(0);

  // Timeout variable to show range control after a certian time when resizing
  const timeout = useRef(null);

  /**
   * useReducer callback to update state
   *
   * @param {object} state The current state of trims
   * @param {object|array} newState Either object of key-value pair to change part of the state,
   * or an array to replace the state
   * @returns {array} The updated trim state
   */
  const updateRange = (state, newState) => {
    let updatedState = [];
    if (Array.isArray(newState)) {
      updatedState = [...newState];
    } else {
      updatedState = [...state];
      const index = currentRangeIndex.current;
      const selectState = updatedState[index];

      updatedState[index] = { ...selectState, ...newState };
    }

    // Accumulate duration state to update totalDuration
    let totalDurationAccumulate = 0;

    // Update parent state
    const trims = updatedState.map(attrs => {
      totalDurationAccumulate += attrs.to - attrs.from;
      return { from: attrs.from, to: attrs.to };
    });
    console.log('UPDATE RANGE child');
    trimsUpdater('trims', trims);

    totalDuration.current = totalDurationAccumulate;
    return updatedState;
  };

  // Holds all ranges attributes
  const [rangeAttr, updateRangeAttr] = useReducer(updateRange, [rangeSchema]);

  // State to minimize or show the options box
  const [hideOptions, setHideOptions] = useState(false);

  // Hold video thumbnails
  const [videoThumbnails, setVideoThumbnails] = useState([]);

  // Holds main video attributes
  const [videoAttr, setVideoAttr] = useState({
    height: 0,
    width: 0,
    duration: 0,
  });

  // Hold trim mode values to update parent componenet
  const [trimMode, setTrimMode] = useState({
    trimIntoMultipleVideos: false,
    trimIntoSingleVideo: true,
  });

  // Helper methods
  /**
   * Toggle text selection for better UX when dragging/resizing
   *
   * @param {boolean} disable True to disable, faluse otherwise
   */
  const disableSelection = disable => {
    const body = document.querySelector('body');
    body.setAttribute('data-no-selection', disable ? 'true' : 'false');
  };

  /**
   * Update trim mode in current and parent compoenent
   *
   * @param {object} e Event
   */
  const updateTrimMode = e => {
    const mode = e.target.value;
    let trimModeData = {
      trimIntoMultipleVideos: false,
      trimIntoSingleVideo: true,
    };

    if (mode === 'multiple') {
      trimModeData = {
        trimIntoMultipleVideos: true,
        trimIntoSingleVideo: false,
      };
    }

    setTrimMode(trimModeData);
    trimsUpdater('trimMode', trimModeData);
  };

  /**
   * Show/Hide options
   */
  const toggleOptionsHide = () => {
    setHideOptions(!hideOptions);
  };

  /**
   * Retrieve the total duration of all trims without milliseconds
   *
   * @returns {string} Total duration of all trims
   */
  const getTotalDuration = () => {
    const formatDuration = formatTime(totalDuration.current).split('.');
    return formatDuration[0];
  };

  /**
   * Update range UI. Set left and right handle position
   *
   * @param {string} handle The handle name (left, right)
   * @param {int} position The starting position of the movement
   */
  const updateRangeUI = (handle, position) => {
    const { width: boundsWidth } = containerBounds.current;
    const { right: rangeRight, left: rangeLeft } = rangeAttr[currentRangeIndex.current];
    const { duration } = videoAttr;

    if (handle === 'left') {
      const maxBoundRight = boundsWidth - rangeRight - rangeOffset;
      const left = Math.min(Math.max(position, 0), maxBoundRight);

      // Calculate from time based on left pixels
      const from = ((left * duration) / boundsWidth).toFixed(2);

      updateRangeAttr({
        left,
        from,
      });
    }

    if (handle === 'right') {
      const maxBoundLeft = boundsWidth - rangeLeft - rangeOffset;
      const right = Math.min(Math.max(position, 0), maxBoundLeft);

      // Calculate to time based on right pixels
      const to = (((boundsWidth - right) * duration) / boundsWidth).toFixed(2);
      updateRangeAttr({
        right,
        to,
      });
    }
  };

  /**
   * Get pointer position for click and touch events
   *
   * @param {object} e Event
   * @returns {object} X and Y positions
   */
  const getPointerPosition = e => {
    return {
      clientX: isTouch ? e.changedTouches[0].clientX : e.clientX,
      clientY: isTouch ? e.changedTouches[0].clientY : e.clientY,
    };
  };

  // Main setup
  useLayoutEffect(() => {
    if (!videoReady) {
      return;
    }

    // Set elements to ref
    mainVideoEl.current = document.querySelector(videoSelector);
    trimVideoEl.current = document.querySelector('#trim-video');
    canvasEl.current = document.querySelector('canvas');
    context.current = canvasEl.current.getContext('2d');

    // Get width/height ratio
    const ratio = playerState.videoWidth / playerState.videoHeight;

    // miniumum width would be 100
    const w = Math.min(playerState.videoWidth, 100);

    // Calculate the height based on the video's width and the ratio
    const h = parseInt(w / ratio, 10);

    // Set the canvas width and height to the values just calculated
    canvasEl.current.width = w;
    canvasEl.current.height = h;

    // Save to state to use later
    setVideoAttr({
      height: h,
      width: w,
      duration: playerState.duration,
    });

    // Set time interval to take thumbnails
    timelineInterval.current = playerState.duration / thumbnailsCount;

    // Create an empty array to store thumbnails
    setVideoThumbnails(Array(thumbnailsCount).fill('none'));

    // Update initial range value
    updateRangeAttr({
      from: 0,
      to: playerState.duration,
    });

    // Start generating thumbnails
    trimVideoEl.current.currentTime = 0.01;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoReady]);

  /**
   * Extract thumbnail from video by drawing it to the canvas element
   * and then save it as data URL.
   */
  function extractThumbnail() {
    const { height, width } = videoAttr;
    // Define the size of the rectangle that will be filled (basically the entire element)
    context.current.fillRect(0, 0, width, height);

    // Grab the image from the video
    context.current.drawImage(trimVideoEl.current, 0, 0, width, height);

    const imgaeDataURL = canvasEl.current.toDataURL('image/jpeg', 0.5);
    const newTimeline = [...videoThumbnails];
    newTimeline[currentTimelineImage.current] = imgaeDataURL;
    setVideoThumbnails(newTimeline);
  }

  /**
   * Callback for onSeeked. Extract thumbnails sequentially
   */
  const onVideoSeeked = () => {
    extractThumbnail();

    const currentImageCount = currentTimelineImage.current;
    const newImageCount = currentImageCount + 1;

    // Tigger seeked event again if not all thumbnails are completed
    if (newImageCount < thumbnailsCount) {
      currentTimelineImage.current = newImageCount;
      trimVideoEl.current.currentTime = newImageCount * timelineInterval.current;
    }
  };

  // Range UI
  useEffect(() => {
    if (mainVideoEl.current === null) {
      return;
    }
    mainVideoEl.current.addEventListener('timeupdate', onMainVideoPlay);
    window.addEventListener(events.POINTER_DOWN, hideRangeControls);

    return () => {
      mainVideoEl.current.removeEventListener('timeupdate', onMainVideoPlay);
      window.removeEventListener(events.POINTER_DOWN, hideRangeControls);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainVideoEl.current, rangeAttr]);

  /**
   * Callback for timeupdate. Display a marker on range showing what part is playing
   * when main video is playing
   */
  const onMainVideoPlay = () => {
    const { to, playing } = rangeAttr[currentRangeIndex.current];

    // Execute the rest of the code only if playing was intiated by range
    // and not by interacting with main video plyer
    if (!playing) {
      return;
    }
    const { duration } = videoAttr;
    const { width: boundsWidth } = containerBounds.current;

    const { currentTime } = mainVideoEl.current;
    const marker_position = (currentTime * boundsWidth) / duration;

    updateRangeAttr({
      marker_position,
      marker_time: formatTime(currentTime),
      show_marker: true,
    });

    // Pause if reached the end
    if (currentTime >= to) {
      mainVideoEl.current.pause();
      updateRangeAttr({
        show_marker: false,
        playing: false,
      });
    }
  };

  /**
   * Hide find range contols when clicking outside them
   *
   * @param {object} e Event
   */
  const hideRangeControls = e => {
    if (!e.target.matches('[data-handle]') && e.target.closest('[data-handle]') === null) {
      const controls = document.querySelectorAll('[data-handle]');
      for (const control of controls) {
        control.setAttribute('data-show-controls', 'false');
      }
    }
  };

  /**
   * Pause all playing ranges and then play the selected range
   *
   * @param {object} e Event
   */
  const playRange = e => {
    const currentIndex = parseInt(e.currentTarget.closest('.video-trim-single').getAttribute('data-trim-index'));
    currentRangeIndex.current = currentIndex;
    const { from } = rangeAttr[currentIndex];

    // Update range array to pause all ranges and play selected one
    const rangeAttrWithPause = rangeAttr.map((range, index) => {
      range.playing = index === currentIndex ? true : false;
      range.show_marker = false;

      return range;
    });

    mainVideoEl.current.currentTime = from;
    mainVideoEl.current.play();

    updateRangeAttr(rangeAttrWithPause);
  };

  /**
   * Pause currenlty playing range
   *
   * @param {object} e Event
   */
  const pauseRange = e => {
    const currentIndex = parseInt(e.currentTarget.closest('.video-trim-single').getAttribute('data-trim-index'));
    currentRangeIndex.current = currentIndex;

    mainVideoEl.current.pause();
    updateRangeAttr({
      playing: false,
      show_marker: false,
    });
  };

  /**
   * Add a new timeline
   */
  const addTimeline = () => {
    // Update range schame
    rangeSchema.to = playerState.duration;

    // Add it to timeline
    const newTimeline = [...rangeAttr, rangeSchema];
    updateRangeAttr(newTimeline);
  };

  /**
   * Remove a specific timeline
   *
   * @param {object} e Event
   */
  const deleteTimeline = e => {
    const deleteIndex = parseInt(e.currentTarget.closest('.video-trim-single').getAttribute('data-trim-index'));
    rangeAttr.splice(deleteIndex, 1);
    currentRangeIndex.current = 0;
    updateRangeAttr(rangeAttr);
  };

  /**
   * Show range controls for a specific handle
   *
   * @param {object} e Event
   */
  const showHandleControls = e => {
    e.currentTarget.parentElement.setAttribute('data-show-controls', 'true');
  };

  /**
   * Increase/Decrease time when clicking on rrange controls
   *
   * @param {object} e Event
   */
  const changeTime = e => {
    e.stopPropagation();
    const { right: rangeRight, left: rangeLeft } = rangeAttr[currentRangeIndex.current];

    // Get change type
    const changeType = e.currentTarget.getAttribute('data-type');

    // Get which handle is being modified
    const handle = e.currentTarget.closest('[data-handle]').getAttribute('data-handle');

    let newPosition = changeType === 'decrease' ? rangeLeft - 3 : rangeLeft + 3;

    // Right handle values are opposite to left. It starts from 0 on the right
    // That's why the calculations are reversed here
    if (handle === 'right') {
      newPosition = changeType === 'decrease' ? rangeRight + 3 : rangeRight - 3;
    }

    updateRangeUI(handle, newPosition);
  };

  // Resize and drag
  useEffect(() => {
    window.addEventListener(events.POINTER_MOVE, onResize);
    window.addEventListener(events.POINTER_MOVE, onDrag);
    window.addEventListener(events.POINTER_UP, onMoveStop);

    return () => {
      window.removeEventListener(events.POINTER_MOVE, onResize);
      window.removeEventListener(events.POINTER_MOVE, onDrag);
      window.removeEventListener(events.POINTER_UP, onMoveStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeAttr, hideOptions]);

  /**
   * Resize callback for mousedown/touchstart
   *
   * @param {object} e Event
   */
  const onResizeStart = e => {
    e.stopPropagation();
    // Presist event so it can be used it in sequentially
    e.persist();
    disableSelection(true);

    currentRangeIndex.current = parseInt(e.currentTarget.closest('.video-trim-single').getAttribute('data-trim-index'));
    containerBounds.current = e.currentTarget.closest('.video-range-box').getBoundingClientRect();

    // Show range control after 700 ms
    timeout.current = setTimeout(() => {
      e.target.parentElement.setAttribute('data-show-controls', 'true');
    }, 700);

    updateRangeAttr({
      resizing: true,
      handle: e.currentTarget.parentElement.getAttribute('data-handle'),
    });
  };

  /**
   * Resizing callback for mousemove/touchmove
   *
   * @param {object} e Event
   * @returns
   */
  const onResize = e => {
    const { resizing, handle } = rangeAttr[currentRangeIndex.current];

    if (!resizing) return;

    const { left: boundsLeft, width: boundsWidth } = containerBounds.current;
    const { clientX } = getPointerPosition(e);
    const currentX = clientX - boundsLeft;

    updateRangeUI(handle, handle === 'right' ? boundsWidth - currentX : currentX);
  };

  /**
   * Callback for mouseup/touchend.
   * This method is used for both resizing and dragging
   */
  const onMoveStop = () => {
    clearTimeout(timeout.current);

    // restore selection
    disableSelection(false);
    updateRangeAttr({
      resizing: false,
      dragging: false,
    });
  };

  /**
   * Drag callback for mousedown/touchstart
   *
   * @param {object} e Event
   */
  const onDragStart = e => {
    //e.stopPropagation();
    disableSelection(true);
    currentRangeIndex.current = parseInt(e.currentTarget.closest('.video-trim-single').getAttribute('data-trim-index'));
    containerBounds.current = e.currentTarget.parentElement.getBoundingClientRect();

    // Update drag state
    const { left: offsetX } = rangeAttr[currentRangeIndex.current];
    const { clientX } = getPointerPosition(e);

    updateRangeAttr({
      dragging: true,
      dragInitialX: clientX - offsetX,
    });
  };

  /**
   * Drag callback for mousemove/touchmove
   *
   * @param {object} e Event
   * @returns
   */
  const onDrag = e => {
    const { dragging, dragInitialX } = rangeAttr[currentRangeIndex.current];

    if (!dragging) return;

    const { width: boundsWidth } = containerBounds.current;
    const { width: rangeBoxWidth } = document
      .querySelector(`[data-trim-index='${currentRangeIndex.current}'] .handle-wrapper`)
      .getBoundingClientRect();

    const { duration } = videoAttr;
    const { clientX } = getPointerPosition(e);

    const currentX = clientX - dragInitialX;

    // Calculate left and right values based on containers and rangebox coordinates
    const left = Math.min(Math.max(currentX, 0), boundsWidth - rangeBoxWidth);
    const right = Math.max(boundsWidth - (left + rangeBoxWidth), 0);

    // Calculate from time based on left distance
    const from = ((left * duration) / boundsWidth).toFixed(2);

    // Calculate to time based on right distance
    const to = (((boundsWidth - right) * duration) / boundsWidth).toFixed(2);

    updateRangeAttr({
      left,
      right,
      from,
      to,
    });
  };

  // Loading icon to replace the spin icon when extract thumbnails
  const loadingIcon = <Icon type="loading" style={{ fontSize: 20 }} spin />;

  return (
    <div id="trim-video-wrapper" data-hide-options={hideOptions ? 'true' : 'false'}>
      <canvas></canvas>
      <video
        crossOrigin="anonymous"
        id="trim-video"
        autoPlay
        muted
        src={playerState.currentSrc}
        onSeeked={onVideoSeeked}></video>

      <div className="video-trim-options">
        <div className="total-duration">
          <Message id="trim-total-duration" />: {getTotalDuration()}
        </div>
        {rangeAttr.length > 1 && (
          <Radio.Group
            defaultValue={trimMode.trimIntoSingleVideo ? 'single' : 'multiple'}
            buttonStyle="solid"
            size="small"
            onChange={updateTrimMode}>
            <Radio.Button value="single">
              <Message id="video-trim-more-concatenate" />
            </Radio.Button>
            <Radio.Button value="multiple">
              <Message id="video-trim-more-multiple" />
            </Radio.Button>
          </Radio.Group>
        )}
        <Icon type="plus-circle" theme="filled" onClick={addTimeline} onTouchStart={addTimeline} />
        <div className="hide-options-wrapper" onClick={toggleOptionsHide} onTouchStart={toggleOptionsHide}>
          {!hideOptions && <Icon type="caret-down" />}
          {hideOptions && <Icon type="caret-up" />}
        </div>
      </div>

      <div className="video-trim-container">
        {rangeAttr.map((range, i) => (
          <div className="video-trim-single" data-trim-index={i} key={`timeline-${i}`}>
            <div className="timelime-controls">
              {!range.playing && <Icon type="play-circle" onClick={playRange} />}
              {range.playing && <Icon type="pause-circle" onClick={pauseRange} />}
              {rangeAttr.length > 1 && (
                <Icon type="minus-circle" theme="filled" onClick={deleteTimeline} onTouchStart={deleteTimeline} />
              )}
            </div>
            <div className="timeline-wrapper">
              <div className="video-range-box">
                <div
                  className="video-marker"
                  style={{ left: range.marker_position }}
                  data-show={range.show_marker ? 'true' : 'false'}
                  data-timestamp={range.marker_time}></div>
                <div className="left-shadow" style={{ width: range.left }}></div>
                <div
                  className="handle-wrapper"
                  onMouseDown={onDragStart}
                  onTouchStart={onDragStart}
                  style={{ left: range.left, right: range.right }}
                  data-dragging={range.dragging ? 'true' : 'false'}>
                  <div
                    className="left-handle-wrapper"
                    data-timestamp={formatTime(range.from)}
                    data-display-timestamp={range.resizing && range.handle === 'left' ? 'true' : 'false'}
                    data-show-controls="false"
                    data-handle="left">
                    <div
                      className="left-handle"
                      onMouseDown={onResizeStart}
                      onTouchStart={onResizeStart}
                      onDoubleClick={showHandleControls}></div>
                    <div className="handle-controls">
                      <Icon type="caret-left" data-type="decrease" onClick={changeTime} onTouchStart={changeTime} />
                      <Icon type="caret-right" data-type="increase" onClick={changeTime} onTouchStart={changeTime} />
                    </div>
                  </div>
                  <div
                    className="right-handle-wrapper"
                    data-timestamp={formatTime(range.to)}
                    data-display-timestamp={range.resizing && range.handle === 'right' ? 'true' : 'false'}
                    data-show-controls="false"
                    data-handle="right">
                    <div
                      className="right-handle"
                      onMouseDown={onResizeStart}
                      onTouchStart={onResizeStart}
                      onDoubleClick={showHandleControls}></div>
                    <div className="handle-controls">
                      <Icon type="caret-left" data-type="decrease" onClick={changeTime} onTouchStart={changeTime} />
                      <Icon type="caret-right" data-type="increase" onClick={changeTime} onTouchStart={changeTime} />
                    </div>
                  </div>
                </div>
                <div className="right-shdaow" style={{ width: range.right }}></div>
              </div>
              <div className="timeline-images">
                {videoThumbnails.length > 0 &&
                  videoThumbnails.map((image, imageIndex) => (
                    <div className="timeline-image-container" key={`image-${imageIndex}`}>
                      {image !== 'none' && <img src={image} alt=""></img>}
                      {image === 'none' && <Spin indicator={loadingIcon} />}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Trim;
