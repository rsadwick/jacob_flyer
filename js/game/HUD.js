define([ '/js/game/Level.js', '/js/game/Player.js'], function (Level, Player) {

    "use strict";

    var HUD = function () {
        this._game;

        this.lives;
        this.boss_lives;
        this.player_lives;
        this.current_life;

        this.player_max_life = 3;
        this.score = 0;
        this.score_label;

        //boss
        this.boss_max_life = 3;
        this.player_group;
        this.boss_group;
    }

    HUD.prototype.init = function (game, settings) {
        this._game = game;
        var scope = this;
        window.addEventListener('score_event', function (event) {
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
        //player lives:
        this.player_group = this._game.add.group();

        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            this.current_life = this.player_group.create(10 + (60 * i), 20, 'lives');
            this.current_life.frame = 2;
        }

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ff9900" };
        this.score_label = this._game.add.text(10, this.current_life.y + this.current_life.height + 12, "0", style);
        this._game.events.onPlayerDamage.add(this.update_lives, this);
        this._game.events.onPlayerHeal.add(this.update_lives, this);
        this._game.events.onBossDamage.add(this.update_lives, this);

    };

    HUD.prototype.update = function () {

    };

    HUD.prototype.score_update = function () {
        this.score_label.text = this.score;
    };

    HUD.prototype.create_boss_lives = function () {
        this.boss_group = this._game.add.group();
        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            this.boss_lives = this.boss_group.create(220 + (60 * i), 20, 'lives');
            this.boss_lives.frame = 2;
            this.boss_lives.tint = 0x999999;
        }
    };

    HUD.prototype.update_lives = function (e, obj, amount, isAdding) {
        var lives = 0;
        var life_sprite;
        var life_group;

        if (this.get_entity_type(obj)) {
            lives = this.player_max_life;
            life_sprite = this.player_group;
        }
        else {
            lives = this.boss_max_life;
            life_sprite = this.boss_group;
        }

        if (amount >= 3) {
            life_sprite.setAll("frame", 0);
        }
        else {
            life_group = life_sprite.getAt(lives - 1);

            /*todo: this is just hacking away at the HUD.  Player/Boss should have subclasses through a base class
             and each entity would have a lives variable   */

            if (isAdding) {
                life_group = life_sprite.getAt(lives - 1);

                if (life_group.frame == 1) {
                    life_group.frame = 2;
                }
                else if (life_group.frame == 0) {
                    life_group.frame = 1;
                }
                else {
                     if(lives < 3){
                         life_group = life_sprite.getAt(lives)
                          life_group.frame = 1;
                        (this.get_entity_type(obj)) ? this.player_max_life += 1 : this.boss_max_life += 1;
                    }
                }
            }

            else if (!isAdding) {
                if (life_group.frame == 2) {
                    life_group.frame = 1;
                }
                else {
                    life_group.frame = 0;

                    (this.get_entity_type(obj)) ? this.player_max_life -= 1 : this.boss_max_life -= 1;

                    if (this.player_max_life == 0) {
                        this._game.events.onPlayerKilled.dispatch();
                    }
                }
            }
        }
    };

    HUD.prototype.get_entity_type = function (entity) {
        var ret = false;
        if (entity.is_player) {
            ret = true;
        }
        return ret;
    };

    HUD.prototype.reset = function () {
        //todo: call server to get max lives
        this.player_max_life = 3;
        this.boss_max_life = 3;
    }

    return HUD;
});