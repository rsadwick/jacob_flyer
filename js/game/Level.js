define(['/js/game/HUD.js', '/js/game/Player.js'], function (HUD, Player) {

    "use strict";

    var Level = function () {
        this._game;
        this._player;
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

        //star powerup
        this._game.load.image('star', 'assets/star.png');

        //candy
        this._game.load.image('candy', 'assets/cherry.png');

        //background:
        this._game.load.image('shrooms', this.level.background);
    };

    Level.prototype.create = function (player) {
        this._player = player;
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
        //background logic:
        if(!this._player.get_hit_wall())
            this.background.tilePosition.x -= 0.7;
        else
            this.background.tilePosition.x += 0.3;

    };

    Level.prototype.add_one_pipe = function(x, y){
        var pipe = this.pipes.getFirstDead();
        if (pipe) {
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;
            pipe.body.mass = 10;
            pipe.body.bounce.setTo(1, 1);
            pipe.angle = 0;
            pipe.body.gravity.setTo(0, 0);
        }
    };

    Level.prototype.add_row_of_pipes = function(){
        var hole = Math.floor(Math.random() * 5) - 1;

        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3) {
                this.add_one_pipe(400, i * 60 + 10);
            }
            else {
                var single_hole = this.holes.getFirstDead();
                if (single_hole) {
                    single_hole.reset(400, i * 60 + 10);
                    //single_hole.alpha = 0.1;
                    single_hole.body.velocity.x = -200;
                    single_hole.body.bounce.x = 10;
                }
            }
        }
    }

    return Level;

});