define(['/js/game/HUD.js', '/js/game/Level.js', '/js/game/powerup/Shield.js'], function (HUD, Level, Shield) {

    "use strict";

    var Player = function () {
        this.lives = 3;
        this._game;
        this.bird;
        this.player_hit_wall = false;
        this.is_powered = false;
        this.is_shielded = false;
        this.settings = {};
        this.space_key;
        this.powerup;
        this.is_player = true;
    }

    Player.prototype.constructor = Player;

    Player.prototype.init = function (game, settings) {
        this._game = game;
        this.settings = settings;
        this._game.events.onPlayerJump = new Phaser.Signal();
        this._game.events.onPlayerDamage = new Phaser.Signal();
        this._game.events.onPlayerHeal = new Phaser.Signal();
        this._game.events.onPlayerKilled = new Phaser.Signal();
        this._game.events.onPlayerDeath = new Phaser.Signal();
    };

    Player.prototype.preload = function () {
        this._game.load.spritesheet('bird', '/assets/jacob.png', 144, 111);
    };

    Player.prototype.create = function () {
        this._game.events.onPlayerDamage.add(this.on_damage, this);
        this._game.events.onPlayerHeal.add(this.on_heal, this);
        this._game.events.onPlayerKilled.add(this.kill, this);
        this.set_hit_wall(false);
        this._game.physics.startSystem(Phaser.Physics.ARCADE);
        this.bird = this._game.add.sprite(100, 245, 'bird');
        this._game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;
        this.bird.body.mass = 1;
        this.bird.body.bounce.setTo(1,1);
        this.bird.body.bounce.y = 0.9;
        this.bird.anchor.setTo(0.5, 0.5);

        //animations
        this.bird.animations.add('flying', [0, 1, 2], 10, true);
        this.bird.animations.add('up', [3, 4], 10, true);
        this.bird.animations.add('down', [2, 5], 8, true);
        this.bird.animations.play('flying');

        //controls:
        this.space_key = this._game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space_key.onDown.add(this.jump, this);

        //temperary heal
        this.heal_key = this._game.input.keyboard.addKey(Phaser.Keyboard.H);
        this.heal_key.onDown.add(this.heal, this);
    };

    Player.prototype.update = function () {
        //player is falling:
        if (!this.space_key.isDown && this.bird.body.velocity.y > 1 && !this.get_hit_wall()) {
            this.bird.animations.play('down');
        }

        if (!this.bird.inWorld) {
            this.kill();
        }
    };

    Player.prototype.get_hit_wall = function(){
        return this.player_hit_wall;
    };

    Player.prototype.set_hit_wall = function(state){
        this.player_hit_wall = state;
    };

    Player.prototype.get_player = function(){
        return this.bird;
    };

    Player.prototype.get_powered = function(){
        return this.is_powered;
    };

    Player.prototype.set_powered = function(state){
        this.is_powered = state;
    };

    Player.prototype.jump = function(){

        this.bird.animations.play('up');

        this._game.events.onPlayerJump.dispatch();
        if(this.get_powered()){
            return;
        }
        this.bird.body.velocity.y = this.settings.level[0].powerUpTypes.NORMAL.velocity;
        this.bird.body.gravity.y = this.settings.level[0].powerUpTypes.NORMAL.gravity;
    };

    Player.prototype.set_powerup_effect = function(powerup, old_powerup){
        if(old_powerup)
            old_powerup.remove();

        this.powerup = powerup;
        powerup.on_collect(this, powerup.get_powerup());
    };

    Player.prototype.get_powerup_effect = function(){
        return this.powerup;
    };

    Player.prototype.hit = function(player, obj){
        if(obj){
            obj.body.gravity.y = 300;
        }

        if (!this.player_hit_wall && !this.get_powerup_effect()) {
            this.kill();
        }
        else if(this.get_powerup_effect() && !this.get_powerup_effect().is_shield_buff){
            this.kill();
        }
    };

    Player.prototype.kill = function(){

        this._game.input.keyboard.disabled = true;
        this.bird.animations.stop();
        this.bird.frame = 6;

        //particles
        if(!this.get_hit_wall()){
            this.on_damage();

            this._game.events.onPlayerDeath.dispatch();
            this.set_hit_wall(true);
        }
    };

    Player.prototype.on_damage = function(){
        var emitter = this._game.add.emitter(0, 0, 100);
        emitter.makeParticles(['star']);
        emitter.start(false, 2000, 0, 10);
        emitter.x = this.bird.body.x + this.bird.width / 2;
        emitter.y = this.bird.body.y;
    };

    Player.prototype.on_heal = function(){
        var emitter = this._game.add.emitter(0, 0, 100);
        emitter.makeParticles(['leaf']);
        emitter.start(false, 1200, 0, 6);
        emitter.x = this.bird.body.x + this.bird.width / 2;
        emitter.y = this.bird.body.y + this.bird.height / 2;

        var heal_tween = this._game.add.tween(this.bird)
            .to({ tint: 0x00ff00 }, 400)
            .to({ tint: 0x00CC00}, 400)
            .to({ tint: 0xe3ff00}, 400);

        heal_tween.onComplete.add(reset_heal_effect, this);
        heal_tween.start();

        function reset_heal_effect(){
            this.bird.tint = 0xFFFFFF;
        }
    }

    Player.prototype.heal = function(){
        this._game.events.onPlayerHeal.dispatch(this, this, 1, true);
    };

    return Player;
});