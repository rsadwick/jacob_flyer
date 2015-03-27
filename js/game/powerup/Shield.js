define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Shield = function () {
        Powerup.call(this);

    }

    Shield.prototype = Object.create(Powerup.prototype);

    // Set the "constructor" property to refer to Shield
    Shield.prototype.constructor = Shield;

    Shield.prototype.init = function (game) {
        this._game = game;

    };

    Shield.prototype.preload = function () {

    };

    Shield.prototype.create = function (player) {
        console.log("created a shield bra")
    };

    Shield.prototype.update = function () {

    };

    Shield.prototype.on_collect = function (player, powerup) {
        console.log("I got a shield")
    };

    Shield.prototype.add = function(){
        console.log("added a shield")
    };

    Shield.prototype.remove = function(){
        console.log("removed a shield")

    };

    return Shield;

});