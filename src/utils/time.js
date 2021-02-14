// This is to display the time in Visual Trimming in hh:mm:ss formate
export function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    let time = hours + ":" + minutes + ":" + seconds;
    if ((parseFloat(seconds) === seconds || parseFloat(seconds) === 0) && String(seconds).indexOf(".") === -1) {
      time += ".000";
    }
    if (time.indexOf(".") === -1) {
      time += ".";
    }
    if (time.length < 12) {
      for (let i = 0; i < Array(12 - time.length).length; i++) {
        time += "0";
      }
    }
    return time.substr(0, 12);
}

export function decodeTime( time ) {
    let timeregex = new RegExp ( '([0-9]*):([0-9]*):([0-9]*.[0-9]*)' );
    if ( timeregex.test( time ) ) {
      let regexOutput = timeregex.exec( time );
      let second = 3600 * parseInt( regexOutput[1] )
      + 60 * parseInt( regexOutput[2] )
      + parseFloat( regexOutput[3] );
      return second;
    } else {
      return null;
    }
}