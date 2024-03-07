import { sameio } from "../app";
import { SERVER_SOCKET_EVENT } from "../helpers/constant";
import Models from "../models";

const updateLastMessage = async (room, message) => {
  await Models.ChatRooms.findOneAndUpdate(
    { _id: room._id },
    { lastMessage: message._id }
  );
};

const checkForUnreadMessage = async (message) => {
  const roomData = await Models.ChatRooms.findOne({ _id: message?.room });
  const oppUsersWhoIsNotInRoom = roomData?.users?.filter(
    (user) => user !== message?.user && !roomData.liveDetails[user]?.inRoom
  );

  let liveDetails = roomData.liveDetails;
  for (let i = 0; i < oppUsersWhoIsNotInRoom?.length; i++) {
    liveDetails[oppUsersWhoIsNotInRoom[i]] = {
      ...liveDetails[oppUsersWhoIsNotInRoom[i]],
      unreadMessage:
        (liveDetails[oppUsersWhoIsNotInRoom[i]]?.unreadMessage || 0) + 1,
    };
  }

  await Models.ChatRooms.findOneAndUpdate(
    { _id: roomData?._id },
    { liveDetails }
  );
  sendSocketEventtoUserList(
    SERVER_SOCKET_EVENT.UPDATE_UNREAD_MESSAGE,
    message,
    oppUsersWhoIsNotInRoom
  );
};

const updateMessage = async (room, data) => {
  const newMessage = {
    message: data?.message,
    type: data?.type,
    user: data?.senderId,
    room: room?._id,
  };

  sameio
    .to(room?._id.toString())
    .emit(SERVER_SOCKET_EVENT.NEW_MESSAGE, newMessage);
  const newRoom = new Models.Messages(newMessage);
  newRoom.save(async (saveErr, message) => {
    if (saveErr) {
      return saveErr;
    }
    await updateLastMessage(room, message);
    await checkForUnreadMessage(newMessage);
    return true;
  });
};

export const sendMessage = async (data, client) => {
  let users = [data?.targetId, data?.senderId];
  users = users.sort((a, b) => b.localeCompare(a));
  let chatRoom = await Models.ChatRooms.findOne({
    users: {
      $eq: users,
    },
  });

  if (!chatRoom) {
    const chatData = {
      users: [data?.targetId, data?.senderId],
      liveDetails: {
        [data?.senderId]: {
          typing: false,
          unreadMessage: 0,
          inRoom: true,
        },
        [data?.targetId]: {
          typing: false,
          unreadMessage: 0,
          inRoom: false,
        },
      },
    };

    const newRoom = new Models.ChatRooms(chatData);
    newRoom.save((saveErr, room) => {
      if (saveErr) {
        return saveErr;
      }
      client.emit(SERVER_SOCKET_EVENT.ROOM_CREATED, room);

      updateMessage(room, data);
      return true;
    });
  } else {
    updateMessage(chatRoom, data);
  }
};

export const updateUserStatus = async (id, status) => {
  Models.User.findOneAndUpdate({ _id: id }, { online_status: status });
};

export const updateTypingStatus = async (data, roomId) => {
  handleSocketEventForChatRoom(SERVER_SOCKET_EVENT.UPDATE_TYPING, data, roomId);

  const roomData = await Models.ChatRooms.findOne({ _id: roomId });
  let liveDetails = roomData.liveDetails;
  liveDetails[data?.senderId] = {
    ...liveDetails[data?.senderId],
    typing: data?.typing,
  };
  Models.ChatRooms.findOneAndUpdate({ _id: roomId }, { liveDetails });
};

export const updateInRoomStatus = async (data, roomId) => {
  if (roomId) {
    handleSocketEventForChatRoom(
      SERVER_SOCKET_EVENT.UPDATE_IN_ROOM,
      data,
      roomId
    );

    const roomData = await Models.ChatRooms.findOne({ _id: roomId });
    let liveDetails = roomData.liveDetails;
    liveDetails[data?.senderId] = {
      ...liveDetails[data?.senderId],
      inRoom: data?.inRoom,
      unreadMessage: 0,
      typing: false,
    };

    Models.ChatRooms.findOneAndUpdate({ _id: roomId }, { liveDetails })
      .then((res) => {})
      .catch((error) => {});
  }
};

const handleSocketEventForChatRoom = async (
  socketEvent = "",
  socketData = {},
  roomId = ""
) => {
  sameio.to(String(roomId)).emit(socketEvent, { ...socketData, roomId });

  const roomData = await Models.ChatRooms.findOne({ _id: roomId });
  for (let i = 0; i < roomData?.users?.length; i++) {
    sameio
      .to(String(roomData?.users[i]))
      .emit(socketEvent, { ...socketData, roomId });
  }
};

const sendSocketEventtoUserList = async (
  socketEvent = "",
  socketData = {},
  users = []
) => {
  for (let i = 0; i < users?.length; i++) {
    sameio.to(String(users[i])).emit(socketEvent, { ...socketData });
  }
};
