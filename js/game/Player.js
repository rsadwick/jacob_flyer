define(['/js/game/HUD.js', '/js/game/Level.js'], function (HUD, Level) {

    "use strict";

    var Player = function () {
        this._game;
        this.bird;
        this.player_hit_wall;
        this.is_powered;
        this.test_var = 12;
    }

    Player.prototype.init = function (game) {
        this._game = game;
    };

    Player.prototype.preload = function () {
        this._game.load.spritesheet('bird', '/assets/jacob.png', 144, 111);
    };

    Player.prototype.create = function () {
        this._game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bird = this._game.add.sprite(100, 245, 'bird');
        this._game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;
        this.bird.body.mass = 1;
        //this.bird.body.bounce.setTo(1,1);
        //this.bird.body.bounce.y = 0.9;
        this.bird.anchor.setTo(0.5, 0.5);

        //animations
        this.bird.animations.add('flying', [0, 1, 2], 10, true);
        this.bird.animations.add('up', [3, 4], 10, true);
        this.bird.animations.add('down', [2, 5], 8, true);
        this.bird.animations.play('flying');
    };

    Player.prototype.update = function () {

    };

    Player.prototype.get_sprite = function(){
        return this.test_var;
    };

    return Player;
});