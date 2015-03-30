define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/Boss.js'], function (Level, Player, Boss) {

    "use strict";

    var Clown = function () {
        Boss.call(this);

        this.tween;
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

    Clown.prototype.add = function () {
        //create boss:
        this.boss = this._game.add.sprite(108, 180, 'clown');
        this.boss.alpha = 0;
        this.boss.x = this._game.width - this.boss.width;
        this.boss.y = this._game.height / 2 - this.boss.height;
        this.boss.enableBody = true;
        this._game.physics.enable(this.boss, Phaser.Physics.ARCADE);

        this.tween = this._game.add.tween(this.boss).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, false, 2000)
        this.tween.onComplete.add(this.attack, this);
        this.tween.start();
    };

    Clown.prototype.remove = function(){
        console.log("removed")
    };


    return Clown;

});