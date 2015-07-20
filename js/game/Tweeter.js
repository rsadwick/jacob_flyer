define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/Boss.js'], function (Level, Player, Boss) {

    "use strict";

    var Tweeter = function () {
        Boss.call(this);

        this.tween;
        this.charge_start_chance = 0.0;
        this.charge_end_chance = 0.10;

        this.shoot_start_chance = 0.11;
        this.shoot_end_chance = 0.20;

        this.heal_start_chance = 0.21;
        this.heal_end_chance = 1

        this.shotsFired = 0;

        this._player;
        this.attack_speed = 900;

        this.charging = false;

        this.bullet_hit_shield = false;
        this.boss_hit_player = false;
        this.is_dead = false;
        this.maximumBullets = 6;
    }

    Tweeter.prototype = Object.create(Boss.prototype);

    Tweeter.prototype.constructor = Tweeter;

    Tweeter.prototype.preload = function () {
        this._game.load.spritesheet('tweet', 'assets/tweet_boss.png', 92, 94, 4);
    };

    Tweeter.prototype.create = function () {
        this.bullets = this._game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(this.maximumBullets * 2, 'candy');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
        this._game.events.onBossDeath = new Phaser.Signal();
        this._game.events.onBossDeath.add(this.on_death, this);
    };

    Tweeter.prototype.update = function () {

        this._game.physics.arcade.overlap(this._player.get_player(), this.bullets, this.on_player_bullet, null, this);
        this._game.physics.arcade.overlap(this.boss, this.bullets, this.on_boss_bullets, null, this);
        this._game.physics.arcade.overlap(this.boss, this._player.get_player(), this.on_boss_attack, null, this);
    };

    Tweeter.prototype.attack = function () {
        if (this.is_dead)
            return false;

        var random = Math.random();
        if (random >= this.charge_start_chance && random <= this.charge_end_chance) {
            this.attack_charge();
        }
        else if (random >= this.shoot_start_chance && random <= this.shoot_end_chance) {
            this.attack_shoot();
        }
        else if (random >= this.heal_start_chance && random <= this.heal_end_chance) {
            this._game.events.shouldBossHeal.dispatch(this);
        }
        else {
            this._game.events.shouldBossHeal.dispatch(this);
        }
    };

    Tweeter.prototype.attack_charge = function () {
        this.boss_hit_player = false;
        var oldPositionX = this.boss.x;
        var oldPositionY = this.boss.y;
        var nextPositionX = this._player.get_player().x;
        var nextPositionY = this._player.get_player().y;
        var speed = this.get_attack_speed();

        //affect charge attack based on powerup the player possesses:
        if (this._player.get_powered()) {

            if (this._player.get_powerup_effect().is_weight()) {
                nextPositionX = this.boss.x;
                nextPositionY = this._game.height;
            }
            else if (this._player.get_powerup_effect().is_feather()) {
                speed = this.attack_speed * 3;
            }
        }

        this.tween = this._game.add.tween(this.boss)
            .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 300)
            .to({ tint: 0x0066f5, x: nextPositionX, y: nextPositionY }, speed, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff, x: oldPositionX, y: oldPositionY}, 300, Phaser.Easing.Elastic.In);
        this.tween.onComplete.add(on_attack_complete, this);
        this.tween.start();
        this.charging = true;

        function on_attack_complete() {
            this.tween.stop();
            this.charging = false;
            //try to heal again
           // this._game.events.shouldBossHeal.dispatch(this);
            this.attack();
        }
    };

    Tweeter.prototype.is_charging = function () {
        return this.charging;
    },

        Tweeter.prototype.attack_shoot = function () {
            //boss figures out where he is and moves according to top/bottom.
            var bossPosition;
            (this.boss.y < this._game.height / 2) ? bossPosition = 300 : bossPosition = 5;
            this.fireweed = this._game.add.tween(this.boss).to({ y: bossPosition }, 1100, Phaser.Easing.Elastic.InOut, true, 300);
            this.fireweed.onComplete.add(loadFireBalls, this);

            //loads the timer that shoots the fireballs:
            function loadFireBalls() {
                this.fireballTimer = this._game.time.create(false);
                this.fireballTimer = this._game.time.events.loop(Phaser.Timer.SECOND, shootFireballs, this);
            }

            //shots fired!
            function shootFireballs() {

                var bullet = this.bullets.getFirstDead();
                if (!this.is_dead) {
                    //reset bullet gravity:
                    bullet.body.gravity.y = 0;
                    bullet.reset(this.boss.x - 8, this.boss.y - 8);
                    var speed = 900;

                    if (this._player.get_powered()) {
                        //feather
                        if (this._player.get_powerup_effect().is_feather()) {
                            speed = this._player.get_powerup_effect().get_speed();
                            bullet.body.gravity.y = this._player.get_powerup_effect().get_gravity();
                        }
                    }

                    this._game.physics.arcade.moveToObject(bullet, this._player.get_player(), 50, speed);
                    this.shotsFired++;
                    if (this.shotsFired >= this.maximumBullets) {
                        this._game.time.events.remove(this.fireballTimer);
                        this.shotsFired = 0;
                        this.attack();
                    }
                }
            }
        };

    Tweeter.prototype.on_boss_attack = function (boss, player) {
        if (!this.boss_hit_player) {
            if (this._player.get_powered()) {
                if (this._player.get_powerup_effect().is_shield()) {
                    this.on_damage();
                    this._game.events.onBossDamage.dispatch(this, this, 1);
                    this.boss_hit_player = true;
                }
            }
            else {
                this.boss_hit_player = true;
                this._game.events.onPlayerDamage.dispatch(this, this._player, 1, false);
            }
        }
    };

    Tweeter.prototype.on_collide = function (boss, obj) {
        console.log("on collide!")
    };

    Tweeter.prototype.on_player_bullet = function (player, bullet) {

        if (this._player.get_powered()) {
            if (this._player.get_powerup_effect().is_shield() ||
                this._player.get_powerup_effect().is_weight()) {
                this.bullet_hit_shield = true;
                this._game.physics.arcade.moveToObject(bullet, this.boss, 100, 500);
            }
        }
        else {
            bullet.kill();
            this._game.events.onPlayerDamage.dispatch(this, this._player, 1, false);
        }
    };

    Tweeter.prototype.on_boss_bullets = function (boss, bullet) {
        if (this.bullet_hit_shield) {
            this.bullet_hit_shield = false;
            bullet.kill();
            this.on_damage();
            this._game.events.onBossDamage.dispatch(this, this, 1);
        }
    };

    Tweeter.prototype.on_damage = function () {
        var damage_tween = this._game.add.tween(this.boss)
            .to({ tint: 0xf50400 }, 100, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0x0066f5 }, 100, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff }, 100, Phaser.Easing.Elastic.In);
        damage_tween.start();
    };

    Tweeter.prototype.add = function () {
        //create boss:
        this.boss = this._game.add.sprite(84, 84, 'tweet');
        this.boss.animations.add('walk');
        this.boss.animations.play('walk', 20, true);

        this.boss.alpha = 0;
        this.boss.x = this._game.width - this.boss.width;
        this.boss.y = this._game.height / 2 - this.boss.height;
        this.boss.enableBody = true;
        this._game.physics.enable(this.boss, Phaser.Physics.ARCADE);

        this.tween = this._game.add.tween(this.boss).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, false, 2000)
        this.tween.onComplete.add(this.attack, this);
        this.tween.start();
    };

    Tweeter.prototype.remove = function () {
        console.log("removed")
    };

    Tweeter.prototype.set_player = function (player) {
        this._player = player;
    };

    Tweeter.prototype.set_attack_speed = function (speed) {
        this.attack_speed = speed;
    };

    Tweeter.prototype.get_attack_speed = function () {
        return this.attack_speed;
    };

    Tweeter.prototype.analyze_player = function () {

        //return obj instances
        function get_instance(object) {

            var instances = [];
            for (var instance_obj = 0; instance_obj < object.length; instance_obj++) {
                instances.push(object.getAt(instance_obj));
            }

            return instances;
        }

        //if player is powered, adjust boss abilities that have already happened:
        if (this._player.get_powered()) {
            //feather
            if (this._player.get_powerup_effect().is_feather()) {
                //if boss is charging, update
                if (this.is_charging()) {
                    if (this.tween.isRunning) {
                        console.log("running, slow down")
                        this.tween.updateTweenData("duration", this.attack_speed * 3, 1);
                    }
                }
                //if boss is shooting, update
                else {

                    var instance = get_instance(this.bullets);
                    for (var bullet in instance) {
                        if (instance[bullet].alive) {
                            this._game.physics.arcade.moveToObject(instance[bullet], this._player.get_player(), 50, this._player.get_powerup_effect().get_speed());
                            instance[bullet].body.gravity.y = this._player.get_powerup_effect().get_gravity();
                            instance[bullet].body.velocity.y = 120;
                            instance[bullet].body.velocity.x += 29;
                        }
                    }
                }
            }
            else if (this._player.get_powerup_effect().is_weight()) {
                if (this.is_charging()) {
                    if (this.tween.isRunning) {
                        this.tween.updateTweenData("x", 9999, -1);
                    }
                }
            }
        }
        else {
            //if player is not powered - update boss abilities to normal:
            //charging
            if (this.is_charging()) {
                if (this.tween.isRunning) {
                    console.log("back to NORMAL")
                }
            }
            //shooting
            else {

                var instance = get_instance(this.bullets);
                for (var bullet in instance) {
                    if (instance[bullet].alive) {
                        instance[bullet].body.gravity.y = 0;
                        this._game.physics.arcade.moveToObject(instance[bullet], this._player.get_player(), 50, 1500);
                    }
                }
            }
        }
    };

    Tweeter.prototype.on_death = function () {
        this.is_dead = true;
        this.tween.stop();
        this.bullets.destroy();

        var damage_tween = this._game.add.tween(this.boss)
            .to({ tint: 0xf50400 }, 200, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0x0066f5 }, 1000, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff }, 2000, Phaser.Easing.Elastic.In);
        damage_tween.start();
        var scope = this;
        damage_tween.onComplete.add(function () {
            scope._game.events.onLevelComplete.dispatch(this);
        });
    };

    Tweeter.prototype.heal = function(){
        var emitter = this._game.add.emitter(0, 0, 100);
        emitter.makeParticles(['leaf']);
        emitter.start(false, 1200, 0, 6);
        emitter.x = this.boss.x + this.boss.width / 2;
        emitter.y = this.boss.y + this.boss.height / 2;

        var heal_tween = this._game.add.tween(this.boss)
            .to({ tint: 0x00ff00 }, 400)
            .to({ tint: 0x00CC00}, 400)
            .to({ tint: 0xe3ff00}, 400);

        heal_tween.onComplete.add(reset_heal_effect, this);
        heal_tween.start();

        function reset_heal_effect(){
            this.boss.tint = 0xFFFFFF;
            this.attack();
        }
        this._game.events.onBossHeal.dispatch(this, this, 1, true);
    };

    return Tweeter;

});