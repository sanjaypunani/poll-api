import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./routes";
import { CLIENT_SOCKET_EVENT, file_storage_path } from "./helpers/constant";
import NodeMediaServer from "node-media-server";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import {
  sendMessage,
  updateInRoomStatus,
  updateTypingStatus,
  updateUserStatus,
} from "./services/messages";

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
  },
};

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

export const sameio = io;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));

app.use("/api", route);
app.use("/uploads", express.static(file_storage_path.uploads));

// Connect to Database new
mongoose.connect(
  process.env.DB_CON_STRING,
  { useNewUrlParser: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully Connected to the database");
    }
  }
);

const nms = new NodeMediaServer(config);
nms.run();

nms.on("prePublish", (id, streamPath, args) => {
  console.log("[Node-Media-Server] Stream started:", streamPath);
});

nms.on("donePublish", (id, streamPath, args) => {
  console.log("[Node-Media-Server] Stream stopped:", streamPath);
});

io.on("connection", (client) => {
  client.on(CLIENT_SOCKET_EVENT.ONLINE, (data) => {
    const onlineUser = data?.senderId;
    updateUserStatus(onlineUser, true);
    client.on(CLIENT_SOCKET_EVENT.JOIN, (joinData) => {
      const roomId = joinData?.roomId;
      client.join(roomId);
      if (joinData.isChatRoom) {
        updateInRoomStatus({ ...joinData, inRoom: true }, roomId);
      }
    });
    client.on(CLIENT_SOCKET_EVENT.LEAVE, (joinData) => {
      console.log("leave: ", joinData);
      const roomId = joinData?.roomId;
      client.leave(roomId);
      if (joinData.isChatRoom) {
        updateInRoomStatus({ ...joinData, inRoom: false }, roomId);
      }
    });
    client.on(CLIENT_SOCKET_EVENT.TYPING, (data) => {
      updateTypingStatus(data, data?.roomId);
    });
    client.on(CLIENT_SOCKET_EVENT.SEND_MESSAGE, (data) =>
      sendMessage(data, client)
    );
    client.on("disconnect", () => {
      updateUserStatus(onlineUser, false);
    });
  });

  client.on("create_or_join_video_call_room", (data) => {
    const { room, user, user_id } = data;
    if (user === "creator") {
      client.join(room);
      console.log("Client ID " + client.id + " created room " + room);
      client.emit("created", room, client.id);
    } else {
      console.log("Client ID " + client.id + " joined room " + room);
      io.sockets.in(room).emit("join", { room, user_id });
      client.join(room);
      client.emit("joined", room, client.id);
      io.sockets.in(room).emit("ready");
    }

    client.on("disconnect", () => {
      client.in(room).emit("message", "bye", room);
    });
  });

  client.on("message", function (message, room) {
    console.log("Client said: ", message);
    // for a real app, would be room-only (not broadcast)
    client.in(room).emit("message", message, room);
  });
});

server.listen(process.env.PORT);
console.log(`The magic happens at ${process.env.HOST}:${process.env.PORT}`);
