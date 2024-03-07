export const file_storage_path = {
  uploads: "src/uploads",
};

export const login_type = {
  phone: "phone",
  email: "email",
  google: "google",
  facebook: "facebook",
  instagram: "instagram",
};

export const CLIENT_SOCKET_EVENT = {
  ONLINE: "online",
  TYPING: "typing",
  JOIN: "join",
  LEAVE: "leave",
  SEND_MESSAGE: "sendMessage",
};

export const SERVER_SOCKET_EVENT = {
  VOTE: "vote",
  NEW_VOTE: "new_vote",
  POLL: "poll",
  NEW_POLL: "new_poll",
};

export const NEW_USER_WALLET = {
  coins: 100,
  swipes: 50,
};

export const DUMMY_LOCATION = {
  type: "Point",
  coordinates: [72.67, 23.05],
};
