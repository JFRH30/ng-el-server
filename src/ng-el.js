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
		// update users collection.
		users.push(user.name);

		// for login function.
		socket.emit('user', user);

		// this will inform everyone except the user itself.
		console.log('User :: ' + user.name + ' has join.');
		socket.broadcast.emit('users', users);
	});

	/**
	 * this will listen to 'enterRoom' event and emit 'room + id' event.
	 */
	socket.on('enterRoom', (data) => {
		join(data.id);

		// find the room.
		const room = rooms.find((room) => room.id === data.id);

		// emit room event so user can enter
		socket.emit('room' + data.id, room);

		// this will broadcast who join the group chat.
		socket.broadcast.emit('join' + data.id, data.name);

		console.log(data.id);
		console.log(data.name + ' Entered room ::', room);
	});

	/**
	 * this will listen to 'addRoom' event,
	 * emit 'room + id' event and the client can listen to this.
	 * this is design to create channel.
	 */
	socket.on('addRoom', (room) => {
		// addRoom dont emit room with id.
		join(roomId);

		// assign room number and push it to array of the rooms.
		room.id = roomId;
		rooms.push(room);

		// this will send all the rooms to all users connected to this server.
		io.emit('rooms', rooms);

		console.log('Created Room ::', room);
		// prepare roomId for next create.
		roomId++;
	});

	/**
	 * this will listen to chat event and emit the updated data in to specific room.
	 */
	socket.on('chat', (room) => {
		// find the room.
		const currentRoom = rooms.find((res) => res.id === room.id);

		// update room for massages.
		const result = Object.assign(currentRoom, room);

		// this will be recieved by socket.
		socket.emit('room' + room.id, result);

		// this will be recieved by everyone who listen to this room in 'room + id' event.
		socket.broadcast.emit('room' + room.id, result);

		console.log(result);
	});

	// this will emit rooms to all socket,
	// meanning this will be broadcast by the node server.
	// note: this is not equal to socket.broadcast.
	io.emit('rooms', rooms);
});

// this will listen to 'localhost:3000'.
// to run 'node [this filelocation]'.
http.listen(3000);
