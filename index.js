const express = require("express");
const WebSocket = require("ws");
require("dotenv").config();
const sequelize = require("./config");
const apiRoutes = require("./routes/api");
const cors = require("cors");

const path = require("path");
const app = express();
const port = process.env.PORT_APP;

app.use(cors());
app.use(express.json());

app.use(cors({ origin: "*" }));

app.use("/api", apiRoutes);

app.use(express.static(path.join(__dirname, "public")));

var ro = [
  "/",
  "/kelas",
  "/gelanggang",
  "/liga",
  "/peserta",
  "/match",
  "/device",
];

ro.map((ro) => {
  app.get(ro, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
});


// sequelize.sync().then(() => {
//   console.log("Database synced");
// });

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const wsAuthMiddleware = (ws, req, next) => {
  const token = req.headers["sec-websocket-protocol"];
  // if (token && token === "mysecrettoken") {
  //   next();
  // } else {
  //   ws.close(1008, "Unauthorized");
  // }

  next();
};

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  wsAuthMiddleware(ws, req, () => {
    console.log("New WebSocket client connected");
    ws.on("message", (message) => {
      console.log(`Received: ${message}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
});
