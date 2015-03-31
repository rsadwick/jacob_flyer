define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Weight = function () {
        Powerup.call(this);
        this.start_chance = 0.31;
        this.end_chance = 0.50;
        this.velocity = -350;

        this.duration = 7;
        this.tint = 0x999999;
        this._player;
        this.effect;
        this.tween;

        //debuff effects
        this.speed = 1000;
        this.gravity = 100;
        this.change_position = true;
    }

    Weight.prototype = Object.create(Powerup.prototype);

    // Set the "constructor" property to refer to Shield
    Weight.prototype.constructor = Weight;

    Weight.prototype.init = function (game) {
        this._game = game;
    };

    Weight.prototype.preload = function () {
        this._game.load.image('ton', 'assets/weight.png');

    };

    Weight.prototype.create = function (player) {
        this.weights = this._game.add.group();
        this.weights.enableBody = true;
        this.weights.physicsBodyType = Phaser.Physics.ARCADE;
        this.weights.createMultiple(20, 'ton');
        this.weights.setAll('checkWorldBounds', true);
        this.weights.setAll('outOfBoundsKill', true);
    };

    Weight.prototype.update = function () {

    };

    Weight.prototype.on_collect = function (player, powerup) {
        if(player){
            this._game.physics.enable(powerup, Phaser.Physics.ARCADE);
            this.set_affected_player(player);
            this.remove();

            player.set_powered(true);
            player.get_player().tint = 0x999999;
            player.get_player().body.velocity.y += 10;

            //how long does it last?
            this.timer = this._game.time.events.loop(Phaser.Timer.SECOND * this.duration, this.remove, this);
        }

    };

    Weight.prototype.add = function(){
        var weight = this.weights.getFirstDead();
        weight.reset(this._game.width, 100);
        weight.body.gravity.y = 4;
        weight.body.velocity.x = -200;
        weight.body.velocity.y = 45;
        //weight.body.rotation.y = 3;
        weight.body.bounce.y = 0.7 + Math.random() * 0.2;
        weight.body.bounce.x = 1.7 + Math.random() * 0.2;

        var scope = this;
        window.addEventListener('jump_event', function (e) {
            scope.affect();
        }, false);
    };

    Weight.prototype.remove = function(){
        this._game.time.events.remove(this.timer);
        var player = this.get_affected_player();
        if(player){
            player.set_powered(false);
            player.get_player().body.gravity.y = 1000;
            player.get_player().blendMode = Phaser.blendModes.NORMAL;
            player.get_player().tint = 0xFFFFFF;
            player.get_player().alpha = 1;
        }
    };

    Weight.prototype.get_powerup = function(){
        return this.weights;
    };

    Weight.prototype.get_affected_player = function(){
        return this._player;
    };

    Weight.prototype.set_affected_player = function(player){
        this._player = player;
    };

    Weight.prototype.affect = function(){
        var player = this.get_affected_player();
        if(player){
            player.get_player().body.velocity.y = -350;
            player.get_player().body.gravity.y = 2500;
        }
    };

    Weight.prototype.get_speed = function(){
        return this.speed;
    };

    Weight.prototype.get_gravity = function(){
        return this.gravity;
    };

    return Weight;

});