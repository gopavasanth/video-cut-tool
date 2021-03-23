import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

function DragResize(props) {
  // Set main variables
  const isTouch = 'ontouchstart' in window ? true : false;
  const events = {
    POINTER_DOWN: isTouch ? 'touchstart' : 'mousedown',
    POINTER_UP: isTouch ? 'touchend' : 'mouseup',
    POINTER_MOVE: isTouch ? 'touchmove' : 'mousemove',
  };
  const dragResizeEl = useRef(null);
  let videoBounds = useRef({});
  let boxBounds = useRef({});
  let containerBounds = useRef({});
  const [boxStyle, setBoxStyle] = useState({
    full: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    numbers: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
  });

  // Helper methods to update state
  const updateDragState = newDragState => {
    setDragState({ ...dragState, ...newDragState });
  };

  const updateBoxStyle = newBoxStyle => {
    // Apply math.round and math.abs to each value
    Object.keys(newBoxStyle).forEach(position => {
      newBoxStyle[position] = roundAbs(newBoxStyle[position]);
    });

    // Add px to each property
    const newPositionWithPx = Object.keys(newBoxStyle).reduce((acc, key) => {
      acc[key] = newBoxStyle[key] + 'px';
      return acc;
    }, {});

    // Merge values
    const updateBoxStyle = {
      full: {
        ...boxStyle.full,
        ...newPositionWithPx,
      },
      numbers: {
        ...boxStyle.numbers,
        ...newBoxStyle,
      },
    };
    setBoxStyle(updateBoxStyle);
  };

  // Helper methods
  function roundAbs(number) {
    return Math.round(Math.abs(number));
  }

  const updateResizeState = newResizeState => {
    setResizeState({ ...resizeState, ...newResizeState });
  };

  const getPointerPosition = e => {
    return {
      clientX: isTouch ? e.changedTouches[0].clientX : e.clientX,
      clientY: isTouch ? e.changedTouches[0].clientY : e.clientY,
    };
  };

  // Toggle text selection for better UX when dragging/resizing
  const disableSelection = disable => {
    const body = document.querySelector('body');
    body.setAttribute('data-no-selection', disable ? 'true' : 'false');
  };

  /**
   * Get position percentage after resizing and dragging to supply
   * to callback methods
   */
  function getPositionPercentages() {
    let positionValues;

    // Retrive the latest using a callback methods
    setBoxStyle(newState => {
      const { width: containerWidth, height: containerHeight } = containerBounds.current;
      const { height: boundsHeight, width: boundsWidth, left: boundsLeft, top: boundsTop } = videoBounds.current;
      const { left: boxLeft, top: boxTop, right: boxRight, bottom: boxBottom } = newState.numbers;

      const boxWidth = containerWidth - boxRight - boxLeft;
      const boxHeight = containerHeight - boxTop - boxBottom;

      positionValues = {
        left: roundAbs(((boxLeft - boundsLeft) * 100) / boundsWidth),
        top: roundAbs(((boxTop - boundsTop) * 100) / boundsHeight),
        width: roundAbs((boxWidth * 100) / boundsWidth),
        height: roundAbs((boxHeight * 100) / boundsHeight),
      };
      return newState;
    });

    return positionValues;
  }

  useLayoutEffect(() => {
    // Only calculate dimensions once video is ready
    if (!props.videoReady) {
      return;
    }

    const videoEl = document.querySelector(props.boundsEl);

    // Convert Rect to object so it could be merged with other object using spread operator
    const { top, right, bottom, left, width, height, x, y } = videoEl.getBoundingClientRect();

    videoBounds.current = { top, right, bottom, left, width, height, x, y };
    containerBounds.current = dragResizeEl.current.parentElement.getBoundingClientRect();
    boxBounds.current = dragResizeEl.current.getBoundingClientRect();

    // Update video bounds on initial render
    const {
      left: videoLeft,
      top: videoTop,
      right: videoRight,
      bottom: videoBottom,
      width: videoWidth,
      height: videoHeight,
    } = videoBounds.current;

    const {
      left: containerLeft,
      top: containerTop,
      right: containerRight,
      bottom: containerBottom,
    } = containerBounds.current;

    const marginX = videoWidth / 6;
    const marginY = videoHeight / 6;

    const updateVideoBounds = {
      left: videoLeft - containerLeft,
      top: videoTop - containerTop,
      right: containerRight - videoRight,
      bottom: videoBottom - containerBottom,
    };

    videoBounds.current = { ...videoBounds.current, ...updateVideoBounds };

    // Add margin to box
    const updateBoxBounds = {
      left: updateVideoBounds.left + marginX,
      top: updateVideoBounds.top + marginY,
      right: updateVideoBounds.right + marginX,
      bottom: updateVideoBounds.bottom + marginY,
    };

    updateBoxStyle(updateBoxBounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rotateValue, props.videoReady]);

  // Drag
  const [dragState, setDragState] = useState({
    dragging: false,
    initialX: 0,
    initialY: 0,
  });

  useEffect(() => {
    window.addEventListener(events.POINTER_MOVE, onDrag);
    window.addEventListener(events.POINTER_UP, onDragStop);

    return () => {
      window.removeEventListener(events.POINTER_MOVE, onDrag);
      window.removeEventListener(events.POINTER_UP, onDragStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragState]);

  const onDragStart = e => {
    e.stopPropagation();
    disableSelection(true);
    boxBounds.current = dragResizeEl.current.getBoundingClientRect();

    const offsetX = parseInt(dragResizeEl.current.style.left) || 0;
    const offsetY = parseInt(dragResizeEl.current.style.top) || 0;
    const { clientX, clientY } = getPointerPosition(e);
    const newDragState = {
      dragging: true,
      initialX: clientX - offsetX,
      initialY: clientY - offsetY,
    };
    updateDragState(newDragState);
  };

  const onDrag = e => {
    const { dragging, initialX, initialY } = dragState;

    if (!dragging) return;

    const { height: boundsHeight, width: boundsWidth, left: boundsLeft, top: boundsTop } = videoBounds.current;
    const { height: containerHeight, width: containerWidth } = containerBounds.current;
    const { height: boxHeight, width: boxWidth } = boxBounds.current;

    const { clientX, clientY } = getPointerPosition(e);

    const currentX = clientX - initialX;
    const currentY = clientY - initialY;

    const maxBoundX = boundsLeft + (boundsWidth - boxWidth);
    const maxBoundY = boundsTop + (boundsHeight - boxHeight);

    const x = Math.max(boundsLeft, Math.min(currentX, maxBoundX));
    const y = Math.max(boundsTop, Math.min(currentY, maxBoundY));

    updateBoxStyle({
      left: x,
      top: y,
      right: containerWidth - (x + boxWidth),
      bottom: containerHeight - (y + boxHeight),
    });
  };

  const onDragStop = e => {
    // e.stopPropagation is not working. Make sure drag is not fired
    // when user is resizing
    const { resizing } = resizeState;
    if (resizing) {
      return;
    }

    // restore selection
    disableSelection(false);

    updateDragState({
      dragging: false,
    });

    boxBounds.current = dragResizeEl.current.getBoundingClientRect();

    if (props.onDragStop === undefined) {
      return;
    }

    const percentages = getPositionPercentages();
    props.onDragStop(percentages);
  };

  // Resize
  const [resizeState, setResizeState] = useState({
    resizing: false,
    initialX: 0,
    initialY: 0,
    position: '',
  });

  useEffect(() => {
    window.addEventListener(events.POINTER_MOVE, onResize);
    window.addEventListener(events.POINTER_UP, onResizeStop);

    return () => {
      window.removeEventListener(events.POINTER_MOVE, onResize);
      window.removeEventListener(events.POINTER_UP, onResizeStop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeState]);

  /**
   * Helper methods to update resize box to fit video bounds
   * @param {string} position the position to calulcate
   * @param {int} newValue The new value where user resized
   * @returns
   */
  function updateUi(position, newValue) {
    let newPosition = Math.max(0, newValue);

    const { height: boundsHeight, left: boundsLeft, right: boundsRight } = videoBounds.current;
    const { width: containerWidth } = containerBounds.current;
    const { left: boxLeft, top: boxTop, right: boxRight, bottom: boxBottom } = boxStyle.numbers;

    let limit;
    switch (position) {
      case 'top':
        limit = boundsHeight - boxBottom - 100;
        break;
      case 'bottom':
        limit = boundsHeight - boxTop - 100;
        break;
      case 'left':
        newPosition = Math.max(boundsLeft, newValue);
        limit = containerWidth - boxRight - 100;
        break;
      case 'right':
        newPosition = Math.max(boundsRight, newValue);
        limit = containerWidth - boxLeft - 100;
        break;
      default:
        break;
    }

    return Math.min(newPosition, roundAbs(limit));
  }

  const onResizeStart = e => {
    e.stopPropagation();

    // Disable text selection for better UX
    disableSelection(true);

    updateDragState({
      dragging: false,
    });
    const { clientX, clientY } = getPointerPosition(e);
    updateResizeState({
      resizing: true,
      initResizeX: clientX,
      initResizeY: clientY,
      position: e.target.getAttribute('data-position'),
    });
  };

  const onResize = e => {
    e.stopPropagation();

    const { resizing, initResizeX, initResizeY, position } = resizeState;

    if (!resizing) return;
    const { clientX, clientY } = getPointerPosition(e);
    const { left: boxLeft, top: boxTop, right: boxRight, bottom: boxBottom } = boxStyle.numbers;
    const currentResizeX = clientX - initResizeX;
    const currentResizeY = clientY - initResizeY;
    const newPosition = {};
    switch (position) {
      case 'top-right':
        newPosition.right = updateUi('right', currentResizeX * -1 + boxRight);
      // falls through

      case 'top-center':
        newPosition.top = updateUi('top', currentResizeY + boxTop);
        break;

      case 'bottom-right':
        newPosition.bottom = updateUi('bottom', currentResizeY * -1 + boxBottom);
      // falls through
      case 'middle-right':
        newPosition.right = updateUi('right', currentResizeX * -1 + boxRight);
        break;

      case 'bottom-left':
        newPosition.bottom = updateUi('bottom', currentResizeY * -1 + boxBottom);
      // falls through
      case 'middle-left':
        newPosition.left = updateUi('left', currentResizeX + boxLeft);
        break;

      case 'top-left':
        newPosition.top = updateUi('top', currentResizeY + boxTop);
        newPosition.left = updateUi('left', currentResizeX + boxLeft);
        break;

      case 'bottom-center':
        newPosition.bottom = updateUi('bottom', currentResizeY * -1 + boxBottom);
        break;
      default:
        break;
    }

    // update state
    updateBoxStyle(newPosition);
  };

  const onResizeStop = e => {
    e.stopPropagation();

    // enable user selection
    disableSelection(false);

    setResizeState({
      resizing: false,
    });

    boxBounds.current = dragResizeEl.current.getBoundingClientRect();

    if (props.onResizeStop === undefined) {
      return;
    }

    const percentages = getPositionPercentages();
    props.onResizeStop(percentages);
  };

  return (
    <div id="drag-resize" ref={dragResizeEl} onMouseDown={onDragStart} onTouchStart={onDragStart} style={boxStyle.full}>
      <div
        className="resize-handle"
        data-position="top-left"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="top-center"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="top-right"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="bottom-left"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="bottom-center"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="bottom-right"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="middle-right"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
      <div
        className="resize-handle"
        data-position="middle-left"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}></div>
    </div>
  );
}
export default DragResize;
