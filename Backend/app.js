import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import { Server } from 'socket.io';

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/ticTacToe')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/user', userRoutes);

const appServer = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

const io = new Server(appServer, { cors: { origin: '*' } });
// Store users and rooms
const users = {}; // { socketId: username }
const rooms = {}; // { roomId: { players: [{id,name,symbol}], board: Array(9), turn: "O" } }
const socketToRoom = {}; // { socketId: roomId }

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);

  // Register username
  socket.on('registerUsername', ({ username }) => {
    users[socket.id] = username;
    io.emit("active_users", users);
  });

  // Invite a player
  socket.on("invite_player", ({ room, opponentId }) => {
    socket.join(room);
    io.to(opponentId).emit("join_room_invite", { room });
  });

  // Join a room
  socket.on("join", ({ name, room }) => {
    socket.join(room);
    socketToRoom[socket.id] = room;

    if (!rooms[room]) rooms[room] = { players: [], board: Array(9).fill(""), turn: "O" };
    const players = rooms[room].players;

    if (players.length >= 2) {
      socket.emit("room_full");
      return;
    }

    // Assign symbol
    const symbol = players.length === 1 ? "O" : "X";
    console.log(`${name} joined room ${room} as ${symbol}`);
    players.push({ id: socket.id, name, symbol });

    // Update room
    rooms[room].players = players;

    console.log(`Room ${room} players:`, players);

    // Notify all players in room
    io.to(room).emit("active_players", players);

    if (players.length === 2) {
      io.to(room).emit("game_start", {
        message: "Game started!",
        board: rooms[room].board,
        turn: rooms[room].turn,
        players: rooms[room].players
      });
    }
  });

  // Handle moves
  socket.on("event", ({ index }) => {
    const room = socketToRoom[socket.id];
    if (!room || !rooms[room]) return;

    const state = rooms[room];
    const player = state.players.find(p => p.id === socket.id);
    if (!player) return;

    // Only allow player if it is their turn
    if (state.turn !== player.symbol) return;

    // Update board
    if (state.board[index] !== "") return;
    state.board[index] = player.symbol;

    // Emit move
    if (player.symbol === "O") {
      io.to(room).emit("OeventOccured", { i: index, name: player.name });
    } else {
      io.to(room).emit("XeventOccured", { i: index, name: player.name });
    }

    // Switch turn
    state.turn = state.turn === "O" ? "X" : "O";

    // Emit updated state
    io.to(room).emit("board_update", state);
  });

  // Restart game
  socket.on("restart", () => {
    const room = socketToRoom[socket.id];
    if (!room || !rooms[room]) return;

    rooms[room].board = Array(9).fill("");
    rooms[room].turn = "O";
    io.to(room).emit("board_update", rooms[room]);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const room = socketToRoom[socket.id];
    delete users[socket.id];
    io.emit("active_users", users);

    if (room && rooms[room]) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
      io.to(room).emit("active_players", rooms[room].players);

      // If no players left, delete room
      if (rooms[room].players.length === 0) delete rooms[room];
    }

    delete socketToRoom[socket.id];
    console.log('user disconnected: ' + socket.id);
  });
});
