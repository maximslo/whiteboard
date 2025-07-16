import { createServer } from "http";
import { Server } from "socket.io";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whiteboard-c8704-default-rtdb.firebaseio.com",
});

const db = admin.database();
const historyRef = db.ref("history");

// Setup Express
const app = express();
app.use(cors({ origin: "https://whiteboard-eosin-one.vercel.app" }));

app.get("/", (_, res) => {
  res.send("✅ Whiteboard Socket.IO server is alive!");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://whiteboard-eosin-one.vercel.app",
    methods: ["GET", "POST"]
  }
});

let userCount = 0;

io.on("connection", (socket) => {
  userCount++;
  console.log(`✅ User connected: ${socket.id} — Total: ${userCount}`);
  io.emit("users", userCount);

  // send all history at once
  historyRef.once("value").then((snapshot) => {
    const history = snapshot.val() || [];
    socket.emit("history", history);
  });

  socket.on("draw", (data) => {
    historyRef.once("value").then((snapshot) => {
      const history = snapshot.val() || [];
      history.push(data);

      socket.broadcast.emit("draw", data);

      historyRef.set(history)
        .then(() => console.log("✅ Firebase write complete"))
        .catch((err) => console.error("🔥 Firebase write failed", err));
    });
  });

  socket.on("disconnect", () => {
    userCount--;
    console.log(`❌ User disconnected: ${socket.id} — Total: ${userCount}`);
    io.emit("users", userCount);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Socket.IO server running at http://0.0.0.0:${PORT}/`);
});
