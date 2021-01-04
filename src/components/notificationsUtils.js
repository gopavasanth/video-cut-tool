//notificationsUtils.js
// Notification Messages
import { notification } from "antd";

const OverwriteBtnTooltipMsg = (state, banana) => {
    if (state.uploadedFile) {
      return banana.i18n('notifications-not-overwritable');
    }
    else {
      return banana.i18n('notifications-not-existing');
    }
  }

const showNotificationWithIcon = (type, desc, banana) => {
    notification[type]({
      message: banana.i18n('notifications-title'),
      description: desc
    });
};

const NotifUtils = {
    OverwriteBtnTooltipMsg: OverwriteBtnTooltipMsg,
    showNotificationWithIcon: showNotificationWithIcon
}

export default NotifUtils;
