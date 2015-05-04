define(['/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var Powerup = function () {
        this._game;
        this._level;
        this._player;
        this.start_chance;
        this.end_chance;
        this.is_feather_buff = false;
        this.is_shield_buff = false;
        this.is_weight_buff = false;
        this.power_started = new CustomEvent("power_started");
        this.power_ended = new CustomEvent("power_ended");

    }

    Powerup.prototype.init = function (game, level) {
        this._game = game;
        this._level = level;

    };

    Powerup.prototype.preload = function () {

    };

    Powerup.prototype.create = function (level) {
        this._level = level;
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
        window.dispatchEvent(this.power_ended);
    };

    Powerup.prototype.get_powerup = function(){};

    Powerup.prototype.get_start_chance = function(){
        return this.start_chance;
    };

    Powerup.prototype.get_end_chance = function(){
        return this.end_chance;
    };

    Powerup.prototype.is_feather = function(){
        return this.is_feather_buff;
    };

    Powerup.prototype.is_weight = function(){
        return this.is_weight_buff;
    };

    Powerup.prototype.is_shield = function(){
        return this.is_shield_buff;
    };

    return Powerup;

});