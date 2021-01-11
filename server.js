var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Maps = require("./Maps").Maps;
var Player = require("./Player").Player;

// Connected players
players = [];

// Socket connection is made
io.on('connection', onSocketConnection);

// Set listeners
function onSocketConnection(client) {
	// Authenticate the player
	client.on("player login", onPlayerLogin);

	// Update player info
	client.on("player update", onPlayerUpdate);

	// Player disconnected
	client.on("disconnect", onPlayerDisconnect);
}

// Authenticate the player
function onPlayerLogin(data) {
	var client = this;

	// New player
	if (getPlayer(data.name) == null) {
		// Player validated
		client.emit("logged in");
		
		// Send game information to the player
		playerJoin(client, data);
	} else {
		// Existing player
		client.emit("name taken");
	}
}

// Send game information to the player
function playerJoin(client, data) {
	console.log(data.name + " has joined the game.");

	// Send map data
	var map = Maps.getMap(1);
	client.emit("load map", { ground: map.ground, layer: map.layer });

	// Send information about players already connected
	for (var p = 0; p < players.length; p++) {
		client.emit("player join", { name: players[p].name, x: players[p].pos.x, y: players[p].pos.y, dir: players[p].dir });
	}

	// Add the new player to the connected players list
	var newPlayer = new Player(data.name, client.id);
	players.push(newPlayer);
	
	// Send player spawn info back to the player
	client.emit("init local player", { name: newPlayer.name, x: newPlayer.pos.x, y: newPlayer.pos.y, dir: newPlayer.dir });

	// Notify connected players that a new player has joined
	client.broadcast.emit("player join", { name: newPlayer.name, x: newPlayer.pos.x, y: newPlayer.pos.y, dir: newPlayer.dir });
}

// Update player info
function onPlayerUpdate(data) {
	console.log(data.name + " has moved to position (" + data.x + "," + data.y + ") facing direction " + data.dir + ".");

	var client = this;

	var player = getPlayer(data.name);
	if (player != null) {
		player.pos.x = data.x;
		player.pos.y = data.y;
		player.dir = data.dir;

		client.broadcast.emit("player update", player);
	}
}

// Player disconnected
function onPlayerDisconnect(data) {
	var client = this;

	var player = getPlayerById(client.id);

	if (player != null) {
		console.log(player.name + " has left the game.");

		// Remove players from the connected players list
		var index = players.indexOf(player);
		players.splice(index, 1);

		// Notify connected players that the player has left
		client.broadcast.emit("player leave", { name: player.name });
	}
}

// Get a player by name
function getPlayer(name) {
	for (var p = 0; p < players.length; p++) {
		if (players[p].name == name) {
			return players[p];
		}
	}
	
	// Player not found
	return null;
}

// Get a player by socket id
function getPlayerById(id) {
	for (var p = 0; p < players.length; p++) {
		if (players[p].id == id) {
			return players[p];
		}
	}
	
	// Player not found
	return null;
}

http.listen(3000, function(){
  console.log('Listening on port 3000');
});