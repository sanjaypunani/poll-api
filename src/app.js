import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./routes";
import { SERVER_SOCKET_EVENT } from "./helpers/constant";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

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

io.on("connection", (client) => {
  client.on(SERVER_SOCKET_EVENT.VOTE, (data) => {
    io.emit(SERVER_SOCKET_EVENT.NEW_VOTE, data);
  });

  client.on(SERVER_SOCKET_EVENT.POLL, (data) => {
    io.emit(SERVER_SOCKET_EVENT.NEW_POLL, data);
  });
});

server.listen(process.env.PORT);
console.log(`The magic happens at ${process.env.HOST}:${process.env.PORT}`);
