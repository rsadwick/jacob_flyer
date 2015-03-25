define(['/js/game/HUD.js', '/js/game/Player.js'], function (HUD, Player) {

    "use strict";

    var Level = function () {
        this._game;
        this.player;
        this.level = {
             name: "level 1",
             background: 'assets/bg_desert.png'
        }
        this.background;
        this.pipes;
    }

    Level.prototype.init = function (game) {
        this._game = game;
    };

    Level.prototype.preload = function () {
        this._game.stage.backgroundColor = '#71c5cf';

        //laying the pipe:
        this._game.load.image('pipe', 'assets/pip_wall.png');

        //background:
        this._game.load.image('shrooms', this.level.background);
    };

    Level.prototype.create = function () {
        this.background = this._game.add.tileSprite(0, 0, 600, 800, 'shrooms');
        this._game.input.keyboard.disabled = false;

        //pipes:
        this.pipes = this._game.add.group();
        this.pipes.enableBody = true;
        this.pipes.physicsBodyType = Phaser.Physics.ARCADE;
        this.pipes.createMultiple(25, 'pipe', 0);
        this.pipes.setAll('checkWorldBounds', true);
        this.pipes.setAll('outOfBoundsKill', true);
        this.timer = this._game.time.events.loop(1500, this.add_row_of_pipes, this);

        //hole indicator:
        this.holes = this._game.add.group();
        this.holes.enableBody = true;
        this.holes.physicsBodyType = Phaser.Physics.ARCADE;
        this.holes.createMultiple(15, 'candy', 0);
        this.holes.setAll('checkWorldBounds', true);
        this.holes.setAll('outOfBoundsKill', true);
        this._game.add.tween(this.holes).to({ y: this.holes.y + 12 }, 500, Phaser.Easing.Back.InOut, true, 0, 1000, true);
    };

    Level.prototype.update = function () {
        console.log(Player.prototype.get_sprite());
    };

    return Level;

});