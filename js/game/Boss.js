define(['/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var Boss = function () {

        var scope = this;
         //player powered up
        window.addEventListener('power_started', function (event) {
            scope.analyze_player();
        }, false);

        window.addEventListener('power_ended', function (event) {
            scope.analyze_player();
        }, false);

        this._game;
        this._player;
        this.lives;
        this.boss;
        this.is_player = false;
    }

    Boss.prototype.init = function (game) {
        this._game = game;
        this._game.events.onBossDamage = new Phaser.Signal();
    };

    Boss.prototype.preload = function () {};

    Boss.prototype.create = function (player) {
        //this._game.events.onBossDamage.add(this.on_damage, this);
    };

    Boss.prototype.update = function () {};

    Boss.prototype.attack = function(){
        //boss picks randomly what attack to use
    };

    Boss.prototype.on_damage = function() {};

    Boss.prototype.on_collide = function (boss, obj) {
        console.log("boss on collide!")
    };

    Boss.prototype.add = function () {
        console.log("boss added")
    };

    Boss.prototype.remove = function(){};

    Boss.prototype.set_lives = function(live){
        this.lives = live;
    };

    Boss.prototype.get_lives = function(){
        return this.lives;
    };

    Boss.prototype.analyze_player = function(){};

    Boss.prototype.on_death = function(){

    };

    return Boss;

});