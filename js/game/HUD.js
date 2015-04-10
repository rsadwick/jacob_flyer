define([ '/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var HUD = function () {
        this._game;

        this.lives;
        this.boss_lives;
        this.player_lives;
        this.current_life;
        this.max_life = 3;

        this.score = 0;
        this.score_label;

        //boss
        this.boss_lives = 3;

        //events

    }

    HUD.prototype.init = function (game, settings) {
        this._game = game;

        var scope = this;
        window.addEventListener('score_event', function (event) {

            console.log(event.detail.obj.key)
            //todo: ajax to server with key and will return a score.
            scope.score += 5;
            //update UI
            scope.score_update();

        }, false);
    };

    HUD.prototype.preload = function () {
        this._game.load.spritesheet('lives', 'assets/lives.png', 52, 45);
    };

    HUD.prototype.create = function () {
        //lives ui groups for player and boss
         this.lives = this._game.add.group();
        //player lives:
        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            this.current_life = this.lives.create(10 + (60 * i), 20, 'lives');
            this.current_life.frame = 2;
        }

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ff9900" };
        this.score_label = this._game.add.text(10, this.current_life.y + this.current_life.height + 12, "0", style);


    };

    HUD.prototype.update = function () {

    };

    HUD.prototype.score_update = function(){
        this.score_label.text = this.score;
    };

    HUD.prototype.create_boss_lives = function(){
        this.boss_lives = this._game.add.group();

        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            this.boss_lives = this.lives.create(220 + (60 * i), 20, 'lives');
            this.boss_lives.frame = 2;
            this.boss_lives.tint = 0x999999;
        }
    };


    return HUD;
});