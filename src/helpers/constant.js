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
  UPDATE_TYPING: "update_typing",
  UPDATE_IN_ROOM: "update_in_room",
  UPDATE_UNREAD_MESSAGE: "update_unread_message",
  NEW_MESSAGE: "newMessage",
  ROOM_CREATED: "roomCreated",
};

export const NEW_USER_WALLET = {
  coins: 100,
  swipes: 50,
};

export const DUMMY_LOCATION = {
  type: "Point",
  coordinates: [72.67, 23.05],
};
