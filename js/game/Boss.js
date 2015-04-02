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
        this.phase = 0;
    }

    Boss.prototype.init = function (game) {
        this._game = game;
    };

    Boss.prototype.preload = function () {};

    Boss.prototype.create = function (player) {};

    Boss.prototype.update = function () {};

    Boss.prototype.attack = function(){
        //boss picks randomly what attack to use
    };

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

    return Boss;

});