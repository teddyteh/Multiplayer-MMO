function Player(name, x, y, dir) {
    this.name = name;
    this.pos = {
        x: x,
        y: y
    };
    this.frame = 0;
    this.dir = dir;
    this.finalDir;
    this.moving = false;
    this.path = [
        []
    ];
    this.tileSize = 32;
    this.speed = 200;

    this.setPath = function(path) {
        this.path = path;
        this.moving = true;

        if(this.path[this.path.length-1][0] > this.path[this.path.length-2][0]) {
            this.finalDir = 1;
        }
        else if(this.path[this.path.length-1][0] < this.path[this.path.length-2][0]) {
            this.finalDir = 3;
        }
        else if(this.path[this.path.length-1][1] > this.path[this.path.length-2][1]) {
            this.finalDir = 2;
        }
        else if(this.path[this.path.length-1][1] < this.path[this.path.length-2][1]) {
            this.finalDir = 0;
        }
    };

    this.playerMove = function(dt) {
        // console.log("player move path[0][0] " + this.path[0][0]);
        // console.log("player move path[0][1] " + this.path[0][1]);
        // console.log("player pos x " + this.pos.x);
        // console.log("player pos y " + this.pos.y);

        // Moving left
        if (this.path[0][0] * this.tileSize < this.pos.x) {
            this.dir = 3;
            this.pos.x = this.path[0][0] * this.tileSize;
        }
        // Moving right
        else if (this.path[0][0] * this.tileSize > this.pos.x) {
            this.dir = 1;
            this.pos.x = this.path[0][0] * this.tileSize;
        }
        // Moving up
        else if (this.path[0][1] * this.tileSize < this.pos.y) {
            this.dir = 0;
            this.pos.y = this.path[0][1] * this.tileSize;
        }
        // Moving down
        else if (this.path[0][1] * this.tileSize > this.pos.y) {
            this.dir = 2;
            this.pos.y = this.path[0][1] * this.tileSize;
        }

        if(this.path.length > 1) {
            // Remove the first item of the path array
            this.path.shift();
        } else {
            this.moving = false;
            this.dir = this.finalDir;
        }
    };
};