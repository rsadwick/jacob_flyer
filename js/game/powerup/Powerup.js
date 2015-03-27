define(['/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var Powerup = function () {
        console.log("POWER UP")
        this._game;
        this._player;

    }

    Powerup.prototype.init = function (game) {
        this._game = game;

    };

    Powerup.prototype.preload = function () {

    };

    Powerup.prototype.create = function (player) {
        console.log("created")
    };

    Powerup.prototype.update = function () {

    };

    Powerup.prototype.on_collect = function (player, powerup) {
        console.log("on collect!")
    };

    Powerup.prototype.add = function(){
        console.log("added")
    };

    Powerup.prototype.remove = function(){
        console.log("removed")

    };

    return Powerup;

});