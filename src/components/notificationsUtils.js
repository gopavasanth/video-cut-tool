//notificationsUtils.js
// Notification Messages
import { notification } from "antd";

const WaitMsg = "Your video is being processed, Please wait until the new video is generated";

const OverwriteBtnTooltipMsg = (state) => {
    if (state.uploadedFile) {
      return "You can't overwrite a video from a device";
    }
    else {
      return "File doesn't exist at Wikimedia Commons";
    }
  }

const showNotificationWithIcon = (type, desc) => {
    notification[type]({
      message: "Notification !",
      description: desc
    });
};

const NotifUtils = {
    WaitMsg: WaitMsg,
    OverwriteBtnTooltipMsg: OverwriteBtnTooltipMsg,
    showNotificationWithIcon: showNotificationWithIcon
}

export default NotifUtils;
