define(['/js/game/HUD.js', '/js/game/Level.js'], function (HUD, Level) {

    "use strict";

    var Player = function () {
        this._game;
        this.bird;
        this.player_hit_wall = false;
        this.is_powered = false;
        this.settings = {};
    }

    Player.prototype.init = function (game, settings) {
        this._game = game;
        this.settings = settings;
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
        this.bird.body.bounce.setTo(1,1);
        this.bird.body.bounce.y = 0.9;
        this.bird.anchor.setTo(0.5, 0.5);

        //animations
        this.bird.animations.add('flying', [0, 1, 2], 10, true);
        this.bird.animations.add('up', [3, 4], 10, true);
        this.bird.animations.add('down', [2, 5], 8, true);
        this.bird.animations.play('flying');

        //controls:
        this.space_key = this._game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space_key.onDown.add(this.jump, this);
    };

    Player.prototype.update = function () {

    };

    Player.prototype.get_hit_wall = function(){
        return this.player_hit_wall;
    };

    Player.prototype.set_hit_wall = function(state){
        this.player_hit_wall = state;
    };

    Player.prototype.get_player = function(){
        return this.bird;
    };

    Player.prototype.get_powered = function(){
        return this.is_powered;
    };

    Player.prototype.set_powered = function(state){
        this.is_powered = state;
    };

    Player.prototype.jump = function(){
        this.bird.body.velocity.y = this.settings.level.powerUpTypes.NORMAL.velocity;
        this.bird.body.gravity.y = this.settings.level.powerUpTypes.NORMAL.gravity;
    };

    Player.prototype.set_powerup_effect = function(powerup){
        powerup.on_collect(this, powerup.get_powerup());

    };

    return Player;
});