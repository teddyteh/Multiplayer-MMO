function Player(name, id) {
    this.name = name;
    this.pos = {
        x: 0,
        y: 160
    };
    this.dir = 2;
    this.id = id;
};

exports.Player = Player;