define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/Boss.js'], function (Level, Player, Boss) {

    "use strict";

    var Clown = function () {
        Boss.call(this);

        this.tween;
        this.charge_start_chance = 0.91;
        this.charge_end_chance = 0.100;

        this.shoot_start_chance = 0.0;
        this.shoot_end_chance = 0.90;

        this.shotsFired = 0;

        this._player;
        this.attack_speed = 1000;

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
        else{
            this.attack_charge();
        }
    };

    Clown.prototype.attack_charge = function(){
        this.boss_hit_player = false;
        var oldPositionX = this.boss.x;
        var oldPositionY = this.boss.y;
        var nextPositionX = this._player.get_player().x;
        var nextPositionY = this._player.get_player().y;
        var speed = this.get_attack_speed();

        //affect charge attack based on powerup the player possesses:

        if(this._player.get_powered()){
            speed = this._player.get_powerup_effect().get_speed();
            if(this._player.get_powerup_effect().is_position_debuff()){
                nextPositionX = this.boss.x;
                nextPositionY = this._game.height;
            }
        }

        this.tween = this._game.add.tween(this.boss)
            .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 500)
            .to({ tint: 0x0066f5, x: nextPositionX, y: nextPositionY }, speed, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff, x: oldPositionX, y: oldPositionY}, 500, Phaser.Easing.Elastic.In);
        this.tween.onComplete.add(on_attack_complete, this);
        this.tween.start();

        function on_attack_complete() {
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
                var speed = 1500;

                if(this._player.get_powered()){

                    if(this._player.get_powerup_effect().is_shooting_debuff()){
                        speed = this._player.get_powerup_effect().get_speed();
                        bullet.body.gravity.y = this._player.get_powerup_effect().get_gravity();
                    }
                }

                this._game.physics.arcade.moveToObject(bullet, this._player.get_player(), 50, speed);
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
    };

    Clown.prototype.set_attack_speed = function (speed){
        this.attack_speed = speed;
    };

    Clown.prototype.get_attack_speed = function (){
        return this.attack_speed;
    };

    Clown.prototype.analyze_player = function(){
        if(this._player.get_powered()){

            if(this._player.get_powerup_effect().is_shooting_debuff()){

                var instance;
                for (var shot_bullet = 0; shot_bullet < this.bullets.length; shot_bullet++) {
                    instance = this.bullets.getAt(shot_bullet);
                    if(instance.alive && instance.body.velocity.x <= 0){
                        instance.body.velocity.x = -122.66666666666663;
                        this._game.physics.arcade.moveToObject(instance, this._player.get_player(), 50, this._player.get_powerup_effect().get_speed());
                        instance.body.gravity.y = this._player.get_powerup_effect().get_gravity();
                    }
                }
            }
        }
        else{
            var instance;
            for (var shot_bullet = 0; shot_bullet < this.bullets.length; shot_bullet++) {
                instance = this.bullets.getAt(shot_bullet);
                if(instance.alive){
                    instance.body.gravity.y = 0;
                    this._game.physics.arcade.moveToObject(instance, this._player.get_player(), 50, 1500);

                }
            }
        }
    };

    return Clown;

});