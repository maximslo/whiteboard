import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import fs from 'fs';

// initialize firebase
const serviceAccount = JSON.parse(fs.readFileSync('./whiteboard-c8704-firebase-adminsdk-fbsvc-fb36e0ad0f.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://whiteboard-c8704-default-rtdb.firebaseio.com'
});

const db = admin.database();
const historyRef = db.ref('history');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

let userCount = 0;
let history = [];

// Load history from Firebase at startup
historyRef.once('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    history = data;
    console.log(`✅ Loaded ${history.length} history items from Firebase`);
  } else {
    console.log('ℹ️ No history in Firebase yet');
  }
});

io.on('connection', (socket) => {
  userCount++;
  console.log(`✅ User connected: ${socket.id} — Total: ${userCount}`);
  io.emit('users', userCount);

  // send history to new client
  history.forEach((data) => socket.emit('draw', data));

  socket.on('draw', (data) => {
    history.push(data);
    socket.broadcast.emit('draw', data);

    // save to firebase
    historyRef.set(history).catch(console.error);
  });

  socket.on('disconnect', () => {
    userCount--;
    console.log(`❌ User disconnected: ${socket.id} — Total: ${userCount}`);
    io.emit('users', userCount);
  });
});

httpServer.listen(3001, () => {
  console.log('🚀 Socket.IO server running at http://localhost:3001/');
});
