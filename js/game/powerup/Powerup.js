define(['/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var Powerup = function () {
        console.log("POWER UP")
        this._game;
        this._player;
        this.start_chance;
        this.end_chance;

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

    Powerup.prototype.get_powerup = function(){};

    Powerup.prototype.get_start_chance = function(){
        return this.start_chance;
    };

    Powerup.prototype.get_end_chance = function(){
        return this.end_chance;
    };

    return Powerup;

});