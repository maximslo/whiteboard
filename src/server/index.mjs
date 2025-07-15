import { createServer } from "http";
import { Server } from "socket.io";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";

// initialize firebase
// const serviceAccount = JSON.parse(fs.readFileSync('./whiteboard-c8704-firebase-adminsdk-fbsvc-fb36e0ad0f.json', 'utf-8'));
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whiteboard-c8704-default-rtdb.firebaseio.com",
});

const db = admin.database();
const historyRef = db.ref("history");

// express app
const app = express();
app.use(cors({ origin: "https://whiteboard-eosin-one.vercel.app" }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "https://whiteboard-eosin-one.vercel.app",
    methods: ["GET", "POST"]
  }
});
// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin: ["https://whiteboard-eosin-one.vercel.app", "http://localhost:3000"],
//     methods: ["GET", "POST"]
//   }
// });

let userCount = 0;
let history = [];

// Load history from Firebase at startup
historyRef.once("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    history = data;
    console.log(`✅ Loaded ${history.length} history items from Firebase`);
  } else {
    console.log("ℹ️ No history in Firebase yet");
  }
});

io.on("connection", (socket) => {
  userCount++;
  console.log(`✅ User connected: ${socket.id} — Total: ${userCount}`);
  io.emit("users", userCount);

  // send history to new client
  history.forEach((data) => socket.emit("draw", data));

  socket.on('draw', (data) => {
    history.push(data);
    socket.broadcast.emit('draw', data);
  
    console.log(`📝 Writing history to Firebase (${history.length} items)…`);
    historyRef.set(history)
      .then(() => console.log('✅ Firebase write complete'))
      .catch(err => console.error('🔥 Firebase write failed', err));
  });
  

  socket.on("disconnect", () => {
    userCount--;
    console.log(`❌ User disconnected: ${socket.id} — Total: ${userCount}`);
    io.emit("users", userCount);
  });
});


const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('✅ Whiteboard Socket.IO server is alive!');
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Socket.IO server running at http://0.0.0.0:${PORT}/`);
});
