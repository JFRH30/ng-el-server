const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// this will serve as database for now.
const rooms = [];
const users = [];
let roomId = 1;
// will listen to 'connection' event,
// meaning if there is someone connected to this server.
io.on('connection', (socket) => {
	let previousRoom;

	// leave and join a room.
	const join = (currentRoom) => {
		socket.leave = previousRoom;
		socket.join = currentRoom;
		previousRoom = currentRoom;
	};

	socket.on('addUser', (user) => {
		users.push(user);
		// this will inform everyone except the user itself.
		socket.broadcast.emit('users', users);
	});

	// enter room
	socket.on('enterRoom', (id) => {
		join(id);

		// find the room.
		const room = rooms.find((room) => room.id === id);
		console.log('Enter Room :: ', room);

		// emit room event so user can enter
		socket.emit('room', room);
	});

	// createRoom
	socket.on('addRoom', (room) => {
		// addRoom dont emit room with id.
		join(roomId);

		// assign room number and push it to array of the rooms.
		room.id = roomId;
		rooms.push(room);

		// will emit room event so user that create room,
		// will automaticall enter themselves.
		socket.emit('room', room);

		// this will send all the rooms to users connected to this server.
		io.emit('rooms', rooms);

		// prepare roomId for next create.
		roomId++;
	});

	// newMessage
	socket.on('chat', (room) => {
		// find the room.
		const currentRoom = rooms.find((room) => room.id === room.id);

		// update room for massages.
		Object.assign(currentRoom, room);
		console.log(currentRoom);
	});

	// this will emit rooms to everyone connected.
	io.emit('rooms', rooms);
});

// this will listen to 'localhost:3000'.
// to run 'node [this filelocation]'.
http.listen(3000);
