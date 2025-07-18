import { createServer } from "http";
import { Server } from "socket.io";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";

// 🔗 Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whiteboard-c8704-default-rtdb.firebaseio.com",
});

const db = admin.database();
const historyRef = db.ref("history");

// 🛠️ Setup Express
const app = express();
app.use(cors({ origin: "https://whiteboard-502.vercel.app" }));

app.get("/", (_, res) => {
  res.send("✅ Whiteboard Socket.IO server is alive!");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://whiteboard-502.vercel.app",
    methods: ["GET", "POST"]
  }
});

let userCount = 0;

io.on("connection", (socket) => {
  userCount++;
  console.log(`✅ User connected: ${socket.id} — Total: ${userCount}`);
  io.emit("users", userCount);

  // send full history when a client connects
  historyRef.once("value").then((snapshot) => {
    const val = snapshot.val() || {};
    const history = Object.values(val);
    socket.emit("history", history);
  });

  // handle incoming draw events
  socket.on("draw", (data) => {
    // broadcast to others
    socket.broadcast.emit("draw", data);

    // just append to Firebase
    historyRef.push(data)
      .then(() => {
        // optionally log
        console.log("✅ Segment written to Firebase");
      })
      .catch((err) => {
        console.error("🔥 Failed to write to Firebase:", err);
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
