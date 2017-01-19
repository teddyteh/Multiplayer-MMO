var canvas,
    ctx,
    ground,
    lastRender = Date.now(),
    layer,
    localPlayer,
    players = [], // Connected players
    playerSprite,
    socket,
    spritesheet,
    tilesetImage;

// Connect to the server when the entire page including its content loads
window.onload = function() {
    // Attempt to establish a connection to the server
    socket = io('http://localhost:3000', {
        'reconnection': false
    });

	// Set event handlers
	setEventHandlers();
}

// Set event handlers
var setEventHandlers = function() {
    // Return an object that provides methods and properties for drawing on the canvas.
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");

    // Attaach a click event handler to the canvas
    canvas.addEventListener('click', function(event) {
        movePlayer(event);
    }, false);

    // Connection was successfully established with the server
    socket.on("connect", onSocketConnected);

    // Server is offline
    socket.on("connect_error", serverOffline);

    // Server unexpectedly closed connection
    socket.on("disconnect", disconnected);

    // User successfully logged in 
    socket.on("logged in", initGame);

    // A player with the same name already exists
    socket.on("name taken", nameTaken);

    // Load map
    socket.on("load map", loadMap);

    // Player joins game
    socket.on("player join", playerJoin);

    // Retrieve player info
    socket.on("init local player", initLocalPlayer);

    // Update player info
    socket.on("player update", updatePlayer);

    // Player disconnected from the server
    socket.on("player leave", removePlayer);
}

// Connection was successfully established with the server
function onSocketConnected() {
	// Show prompt for name
	var name_prompt = document.getElementById("name-prompt");
	name_prompt.style.visibility = "visible";

	// Prompt the player for a name
    var goBtn = document.getElementById("goBtn");
    goBtn.addEventListener('click', function(event) {
    	var name = document.getElementById("playerName");
 		sessionStorage.playerName = name.value;

		// Authenticate the player
    	socket.emit("player login", { name: sessionStorage.playerName });

    	// Hide prompt for name
 		name_prompt.style.visibility = "hidden";
    }, false);
}

// Server is offline
function serverOffline() {
	var message = document.getElementById("message");
	message.style = "width:300px; height:150px;"
	message.innerHTML = "<p>Server is offline</p></br><a href='./index.html'>Try again</a>";

	document.getElementById("message-container").style.visibility = "visible";
}

// Server unexpectedly closed connection
function disconnected() {
	var message = document.getElementById("message");
	message.style = "width:600px; height:150px;"
	message.innerHTML = "<p>Connection to the server has been lost</p></br><a href='./index.html'>Reload</a>";
	
	document.getElementById("message-container").style.visibility = "visible";
}

// Initialize game
function initGame() {
    console.log("Initializing game");

    playerSprite = new Image();
    playerSprite.src = "sprites/player.png";

    tilesetImage = new Image();
    tilesetImage.src = 'sprites/tileset.png';

    canvas.width = 1024;
    canvas.height = 640;

	// Play background music
	var music = document.getElementById("music");
	music.play();

    // Show game canvas
    var game_container = document.getElementById("game-container");
	game_container.style.visibility = "visible";
}

// A player with the same name already exists 
function nameTaken() {
	var message = document.getElementById("message");
	message.style = "width:400px; height:150px;"
	message.innerHTML = "<p>Name is already taken</p></br><a href='./index.html'>Try another name</a>";
	
	document.getElementById("message-container").style.visibility = "visible";
}

// Load map
function loadMap(data) {
    console.log("Retrieving game data");

    ground = data.ground;
    layer = data.layer;
}

// Add a player to the game
function playerJoin(data) {
    console.log(data.name + " has joined the game.");

    var player = new Player(data.name, data.x, data.y, data.dir);
    players.push(player);
}

// Retrieve player info
function initLocalPlayer(data) {
    console.log("Retrieving player info");

    localPlayer = new Player(data.name, data.x, data.y, data.dir);

    animate();
}

// Update player info
function updatePlayer(data) {
    var player = getPlayer(data.name);

    if (player != null) {
        player.pos.x = data.pos.x;
        player.pos.y = data.pos.y;
        player.dir = data.dir;
    }
}

// Remove a player from the game
function removePlayer(data) {
    var player = getPlayer(data.name);

    if (player != null) {
        console.log(player.name + " has left the game.");

        var index = players.indexOf(player);
        players.splice(index, 1);
    }
}

// Get a player by name
function getPlayer(name) {
    for(var p = 0; p < players.length; p++) {
        if (players[p].name == name) {
            return players[p];
        }
    }

    // Player not found
    return null;
}

// Animation loop
function animate() {
    var delta = (Date.now() - lastRender) / 1000;
    update(delta);
    lastRender = Date.now();

    draw();

    requestAnimationFrame(animate);
}

// Report player position to the server
function update(delta) {
    if (localPlayer.moving) {
        localPlayer.playerMove(delta);  
        socket.emit("player update", { name: localPlayer.name, x: localPlayer.pos.x, y: localPlayer.pos.y, dir: localPlayer.dir });
        console.log("player " + localPlayer.name +  " is at " + localPlayer.pos.x + "," + localPlayer.pos.y + " facing direction " + localPlayer.dir);
    }
}

// Draw map and local player
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();

    for (var p = 0; p < players.length; p++) {
        drawPlayer(players[p]);
    }

    drawPlayer(localPlayer);
}

// Draw map
function drawMap() {
    var tileSize = 32; // The size of a tile (32×32)
    var rowTileCount = 20; // The number of tiles in a row of our background
    var colTileCount = 32; // The number of tiles in a column of our background
    var imageNumTiles = 16; // The number of tiles per row in the tileset image

    for (var r = 0; r < rowTileCount; r++) {
        for (var c = 0; c < colTileCount; c++) {
            var tile = ground[r][c];
            var tileRow = (tile / imageNumTiles) | 0; // Bitwise OR operation
            var tileCol = (tile % imageNumTiles) | 0;
            ctx.drawImage(tilesetImage, (tileCol * tileSize), (tileRow * tileSize), tileSize, tileSize, (c * tileSize), (r * tileSize), tileSize, tileSize);

            tile = layer[r][c];
            tileRow = (tile / imageNumTiles) | 0;
            tileCol = (tile % imageNumTiles) | 0;
            ctx.drawImage(tilesetImage, (tileCol * tileSize), (tileRow * tileSize), tileSize, tileSize, (c * tileSize), (r * tileSize), tileSize, tileSize);
        }
    }
}

// Draw a player
function drawPlayer(player) {
    ctx.fillStyle = "white";
    ctx.fillText(player.name, player.pos.x + (42 / 2 - player.name.length * 2), player.pos.y + (43 + 12.5));
    ctx.drawImage(playerSprite, player.frame * 42, player.dir * 43, 42, 43, player.pos.x, player.pos.y, 42, 43);
}

// Handle player movement
function movePlayer(event) {
    var playerTile = coordsToTile(localPlayer.pos.x, localPlayer.pos.y);
    var clickedTile = getClickedTile(event);

    var start = [playerTile.x, playerTile.y];
    var end = [clickedTile.x, clickedTile.y];

    var path = Pathfinder(ground, start, end);

    if (path.length > 0) {
        localPlayer.setPath(path);        
    }
}

// Determine which tile on the canvas is clicked 
function getClickedTile(event) {
	// Position of the canvas obtained from the getBoundingClientRect() method of the window object
    var r = canvas.getBoundingClientRect();
    
    // Get mouse coordinates based on the position of the mouse and the position of the canvas
    var x = event.pageX - r.left;
    var y = event.pageY - r.top;

    // console.log("Mouse pointer position | x: " + x + " y: " + y);

    var tile = coordsToTile(x, y);

    // console.log("Translated tile position | x: " + tile.x + " y: " + tile.y);

    return {
        x: tile.x,
        y: tile.y
    };
}

// Convert mouse coordinates to tile coordinates
function coordsToTile(x, y) {
    x = Math.floor(x / 32);
    y = Math.floor(y / 32);

    // console.log("Translated tile position | x: " + x + " y: " + y);

    return {
        x: x,
        y: y
    };
}

// Go full screen
function goFullScreen(){
    if(canvas.webkitRequestFullScreen) {
        canvas.webkitRequestFullScreen();
    }
    else {
        canvas.mozRequestFullScreen();
    }
}