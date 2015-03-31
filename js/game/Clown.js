define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/Boss.js'], function (Level, Player, Boss) {

    "use strict";

    var Clown = function () {
        Boss.call(this);

        this.tween;
        this.charge_start_chance = 0.0;
        this.charge_end_chance = 0.50;

        this.shoot_start_chance = 0.51;
        this.shoot_end_chance = 0.99;

        this.shotsFired = 0;

        this._player;
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
        this.bullets = this._game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(3, 'candy');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);

    };

    Clown.prototype.update = function () {

    };

    Clown.prototype.attack = function(){
        //boss picks randomly what attack to use
        var random = Math.random();
        if(random >= this.charge_start_chance && random <= this.charge_end_chance){
            this.attack_charge();
        }
        else if(random >= this.shoot_start_chance && random <= this.shoot_end_chance){
            this.attack_shoot();
        }

    };

    Clown.prototype.attack_charge = function(){
        this.boss_hit_player = false;
        var oldPositionX = this.boss.x;
        var oldPositionY = this.boss.y;
        var nextPositionX = this._player.get_player().x;
        var nextPositionY = this._player.get_player().y;

        //affect charge attack based on which powerup the player has:
        /*switch (powerupState) {
            case powerUpTypes.OVERWEIGHT:
                bossAbilties.CHARGE_ATTACK.speed = 1000;
                nextPositionX = this.clown.x;
                nextPositionY = this.game.height;
                break;

            case powerUpTypes.FEATHERWEIGHT:
                bossAbilties.CHARGE_ATTACK.speed = 3000;
                break;

            default:
                bossAbilties.CHARGE_ATTACK.speed = 1000
        }*/

        this.tween = this._game.add.tween(this.boss)
            .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 500)
            .to({ tint: 0x0066f5, x: nextPositionX, y: nextPositionY }, 1000, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff, x: oldPositionX, y: oldPositionY}, 500, Phaser.Easing.Elastic.In);
        this.tween.onComplete.add(onChargeComplete, this);
        this.tween.start();

        function onChargeComplete() {
            this.tween.stop();
            this.attack();
        }
    };

    Clown.prototype.attack_shoot = function(){
            //boss figures out where he is and moves according to top/bottom.
            var bossPosition;
            (this.boss.y < this._game.height / 2) ? bossPosition = 300 : bossPosition = 5;
            this.fireweed = this._game.add.tween(this.boss).to({ y: bossPosition }, 2000, Phaser.Easing.Elastic.InOut, true, 500);
            this.fireweed.onComplete.add(loadFireBalls, this);

            //loads the timer that shoots the fireballs:
            function loadFireBalls() {
                this.fireballTimer = this._game.time.create(false);
                this.fireballTimer = this._game.time.events.loop(Phaser.Timer.SECOND * 2, shootFireballs, this);
            }

            //shots fired!
            function shootFireballs() {

                var bullet = this.bullets.getFirstDead();
                //reset bullet gravity:
                bullet.body.gravity.y = 0;
                bullet.reset(this.boss.x - 8, this.boss.y - 8);
                //when player is powered with feather weight, the boss throws like a pee wee:
                /*if (powerupState == powerUpTypes.FEATHERWEIGHT) {
                    this.game.physics.arcade.moveToObject(bullet, this.bird, 60, 9500);
                    bullet.body.gravity.y = 100;
                }
                else {
                    this.game.physics.arcade.moveToObject(bullet, this.bird, 60, 1500);
                }*/

                this._game.physics.arcade.moveToObject(bullet, this._player.get_player(), 50, 1500);

                this.shotsFired++;
                if (this.shotsFired >= 3) {
                    this._game.time.events.remove(this.fireballTimer);
                    this.shotsFired = 0;
                    this.attack();
                }
            }
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

    Clown.prototype.set_player = function (player){
        this._player = player;
    }

    return Clown;

});