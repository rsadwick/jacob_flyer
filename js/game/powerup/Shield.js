define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Shield = function () {
        Powerup.call(this);
        this.duration = 7;
        this.current_time = 0;
        this.chance = 0.50;
        this.blend_mode = Phaser.blendModes.ADD;
        this.shields;
        this.shield_timer;
        this._player;
        this.effect;
        this.tween;
    }

    Shield.prototype = Object.create(Powerup.prototype);

    // Set the "constructor" property to refer to Shield
    Shield.prototype.constructor = Shield;

    Shield.prototype.init = function (game) {
        this._game = game;

    };

    Shield.prototype.preload = function () {
        this._game.load.image('shield', 'assets/shield.png');
        this._game.load.image('shield_effect', 'assets/shield_effect.png');

    };

    Shield.prototype.create = function (player) {
        console.log("created a shield bra");
        this.shields = this._game.add.group();
        this.shields.enableBody = true;
        this.shields.physicsBodyType = Phaser.Physics.ARCADE;
        this.shields.createMultiple(20, 'shield');
        this.shields.setAll('checkWorldBounds', true);
        this.shields.setAll('outOfBoundsKill', true);
    };

    Shield.prototype.update = function () {

    };

    Shield.prototype.on_collect = function (player, powerup) {
        console.log("I got a shield")
        console.log(player)
        if(player){
            this.set_affected_player(player);
            this.remove();

            this.effect = this._game.add.sprite(0, 0, 'shield_effect');
            this.effect.anchor.setTo(0.5, 0.5);
            this.effect.alpha = 0.6;
            this.effect.blendMode = this.blend_mode;
            this.tween = this._game.add.tween(this.effect).to({ alpha: 0.8}, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
            player.get_player().addChild(this.effect);
            player.is_shielded = true;

            this._game.physics.enable(powerup, Phaser.Physics.ARCADE);

            //how long does it last?
            this.shield_timer = this._game.time.events.loop(Phaser.Timer.SECOND, this.check_duration, this);
            player.get_player().body.mass = 45;
            player.get_player().body.immovable = true;
        }

    };

    Shield.prototype.check_duration = function(){
        if(this.duration > this.current_time){
            this.current_time++;
        }
        else if(this.duration == this.current_time){
            this.remove();
            this.current_time = 0;
        }

        //start fading shield:
        if(this.current_time >= 6){
            this.effect.alpha = 0.1;
            this.tween = this._game.add.tween(this.effect).to({ alpha: 0.3 }, 300, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        }
    };

    Shield.prototype.add = function(){
        var shield = this.shields.getFirstDead();
        shield.reset(this._game.width, 100);
        shield.body.gravity.y = 1;
        shield.body.velocity.x = -100;
        shield.body.velocity.y = 20;
    };

    Shield.prototype.remove = function(){
        console.log("removed a shield")
        this.current_time = 0;
        this._game.time.events.remove(this.shield_timer);
        var player = this.get_affected_player();
        player.set_powered(false);
        player.get_player().body.mass = 1;
        player.get_player().body.immovable = false;
        player.get_player().removeChild(this.effect);
        player.is_shielded = false;

    };

    Shield.prototype.get_powerup = function(){
        return this.shields;
    };

    Shield.prototype.get_affected_player = function(){
        return this._player;
    };

    Shield.prototype.set_affected_player = function(player){
        this._player = player;
    };

    return Shield;

});