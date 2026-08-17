import Axios from "./axios";

export const NotificationApi = {
  list(page = 1, limit = 10) {
    return Axios.get("/notification/get", {
      params: { page, limit },
    });
  },
  markRead(notificationId) {
    return Axios.patch(`/notification/read/${notificationId}`);
  },
};
