define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Feather = function () {
        Powerup.call(this);
        this.start_chance = -0.0;
        this.end_chance = -0.50;
        this.velocity = -350;
        this.speed = 9500;
        this.gravity = 100;
        this.duration = 7;
        this.tint = 0x999999;
        this._player;
        this.effect;
        this.tween;

        this.is_feather_buff = true;
    }

    Feather.prototype = Object.create(Powerup.prototype);

    // Set the "constructor" property to refer to Shield
    Feather.prototype.constructor = Feather;

    Feather.prototype.preload = function () {
        this._game.load.image('feather', 'assets/feather.png');

        //get chance from settings:
        this.start_chance = this._settings.level[this._level.get_level()].powerUpTypes.FEATHERWEIGHT.start;
        this.end_chance = this._settings.level[this._level.get_level()].powerUpTypes.FEATHERWEIGHT.end;
    };

    Feather.prototype.create = function () {
        this.feathers = this._game.add.group();
        this.feathers.enableBody = true;
        this.feathers.physicsBodyType = Phaser.Physics.ARCADE;
        this.feathers.createMultiple(20, 'feather');
        this.feathers.setAll('checkWorldBounds', true);
        this.feathers.setAll('outOfBoundsKill', true)
        this._game.physics.enable(this.feathers, Phaser.Physics.ARCADE);
    };

    Feather.prototype.update = function () {};

    Feather.prototype.on_collect = function (player, powerup) {
        console.log("collect")
        if(player){

            this.set_affected_player(player);
            player.get_powerup_effect().remove();
            this._game.events.onPlayerJump.add(this.affect, this);
            player.set_powered(true);
            player.get_player().tint = 0xff9900;
            player.get_player().alpha = 0.4
            //player.get_player().body.velocity.y += 10;

            //how long does it last?
            this.timer = this._game.time.events.loop(Phaser.Timer.SECOND * this.duration, this.remove, this);
            window.dispatchEvent(this.power_started);
        }
    };

    Feather.prototype.add = function(){
        var feather = this.feathers.getFirstDead();
        feather.reset(this._game.width, 100);
        feather.body.gravity.y = 1;
        feather.body.velocity.x = -100;
        feather.body.velocity.y = 20;
        var rotationStart = -0.5;
        var rotationEnd = 1;
        feather.rotation = rotationStart;
        this._game.add.tween(feather).to({ rotation: rotationEnd }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);

    };

    Feather.prototype.remove = function(){
        this._game.events.onPlayerJump.removeAll();
        this._game.time.events.remove(this.timer);
        var player = this.get_affected_player();
        if(player){
            player.set_powered(false);
            player.get_player().body.gravity.y = 1000;
            player.get_player().blendMode = Phaser.blendModes.NORMAL;
            player.get_player().tint = 0xFFFFFF;
            player.get_player().alpha = 1;
        }
        window.dispatchEvent(this.power_ended);
    };

    Feather.prototype.get_powerup = function(){
        return this.feathers;
    };

    Feather.prototype.get_affected_player = function(){
        return this._player;
    };

    Feather.prototype.set_affected_player = function(player){
        this._player = player;
    };

    Feather.prototype.affect = function(){
        var player = this.get_affected_player();
        if(player){
            player.get_player().body.velocity.y = -250;
            player.get_player().body.gravity.y = 500;
        }
    };

    Feather.prototype.get_speed = function(){
        return this.speed;
    };

    Feather.prototype.get_gravity = function(){
        return this.gravity;
    };

    return Feather;

});