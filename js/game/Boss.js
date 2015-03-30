define(['/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var Boss = function () {
        this._game;
        this._player;
        this.lives;
    }

    Boss.prototype.init = function (game) {
        this._game = game;
    };

    Boss.prototype.preload = function () {};

    Boss.prototype.create = function (player) {
        console.log("boss created")
    };

    Boss.prototype.update = function () {};

    Boss.prototype.attack = function(){
        //boss picks randomly what attack to use
    };

    Boss.prototype.on_collide = function (boss, obj) {
        console.log("boss on collide!")
    };

    Boss.prototype.remove = function(){};

    Boss.prototype.set_lives = function(live){
        this.lives = live;
    };

    Boss.prototype.get_lives = function(){
        return this.lives;
    };

    return Boss;

});