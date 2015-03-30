define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/Boss.js'], function (Level, Player) {

    "use strict";

    var Clown = function () {
        Boss.call(this);
    }

    Clown.prototype = Object.create(Boss.prototype);

    Clown.prototype.constructor = Clown;

    Clown.prototype.init = function (game) {
        this._game = game;
    };

    Clown.prototype.preload = function () {
        this._game.load.image('clown', 'assets/clown_boss.png');
    };

    Clown.prototype.create = function (player) {
        console.log("created")
    };

    Clown.prototype.update = function () {

    };

    Clown.prototype.attack = function(){
        //boss picks randomly what attack to use
    };

    Clown.prototype.attack_charge = function(){

    };

    Clown.prototype.attack_shoot = function(){

    };

    Clown.prototype.on_collide = function (boss, obj) {
        console.log("on collide!")
    };

    Clown.prototype.remove = function(){
        console.log("removed")
    };

    return Clown;

});