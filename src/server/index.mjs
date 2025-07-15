import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const history = []; // all drawing events

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  history.forEach((data) => socket.emit('draw', data));

  socket.on('draw', (data) => {
    history.push(data);
    socket.broadcast.emit('draw', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(3001, () => {
  console.log('Socket.IO server running at http://localhost:3001/');
});
