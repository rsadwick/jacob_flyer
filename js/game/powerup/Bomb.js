define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Bomb = function () {
        Powerup.call(this);
        this.start_chance = 0.40;
        this.end_chance = 0.99;
        this.start = false;
        this.emitter;
        this.tween;
    }

    Bomb.prototype = Object.create(Powerup.prototype);

    Bomb.prototype.constructor = Bomb;

    Bomb.prototype.init = function (game) {
        this._game = game;
    };

    Bomb.prototype.preload = function () {
        this._game.load.image('bomb', 'assets/bomb.png');
        this._game.load.image('burst_blue', 'assets/laserBlueBurst.png');
        this._game.load.image('burst_green', 'assets/laserGreenBurst.png');
        this._game.load.image('burst_red', 'assets/laserRedBurst.png');
        this._game.load.image('burst_yellow', 'assets/laserYellowBurst.png');
    };

    Bomb.prototype.create = function (player) {
        this.bombs = this._game.add.group();
        this.bombs.enableBody = true;
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombs.createMultiple(1, 'bomb');
        this.bombs.setAll('checkWorldBounds', true);
        this.bombs.setAll('outOfBoundsKill', true)
    };

    Bomb.prototype.update = function () {
        if (this.bombs.length >= 1 && this.start == false && this.emitter != null) {
            var current_bomb = this.get_instances();

            if (current_bomb.inWorld) {
                this.emitter.start(false, 0, 10, 50, true);
                this.start = true;
            }
        }
    };


    Bomb.prototype.add = function(){
        var bomb = this.bombs.getFirstDead();

        if(bomb){
            bomb.reset(this._game.width, 100);
            bomb.body.gravity.y = 7;
            bomb.body.velocity.x = -60;
            bomb.body.velocity.y = 20;

            bomb.body.bounce.y = 0.7 + Math.random() * 0.2;
            bomb.body.bounce.x = 1.7 + Math.random() * 0.2;
        }

        this.tween = this._game.add.tween(bomb)
            .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 1000)
            .to({ tint: 0x0066f5}, 1000, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff}, 1000, Phaser.Easing.Elastic.In);

        this.tween.start();
        this.tween.onComplete.add(on_complete, this);
        var _scope = this;
        function on_complete(){
            _scope.explode();
        }
    };

    Bomb.prototype.remove = function(){
        var bomb = this.get_instances();
        if(bomb && this.emitter){
            if(this.bombs.length >= 1){
                this.emitter.destroy(true, false);
                bomb.kill();
            }
        }
    };

    Bomb.prototype.get_powerup = function(){
        return this.bombs;
    };

    Bomb.prototype.get_instances = function(){
        var instance;
        for (var currentBombos = 0; currentBombos < this.bombs.length; currentBombos++) {
            instance = this.bombs.getAt(currentBombos);
        }
        return instance;
    };

    Bomb.prototype.explode = function(){

        this.emitter = this._game.add.emitter(0, 0, 0, 250);
        this._game.physics.enable(this.emitter, Phaser.Physics.ARCADE);

        this.emitter.makeParticles(['burst_blue', 'burst_green', 'burst_red', 'burst_yellow'], 0, 5, true);
        this.emitter.setRotation(360, 180);
        this.emitter.setScale(0.1, 2, 0.1, 2, 200, Phaser.Easing.Quintic.Out);
        this.emitter.mass = 10;
        this.emitter.setAlpha(1, 0, 500);

        var bomb = this.get_instances();
        bomb.addChild(this.emitter);
        //bomb.anchor.setTo(0.5, 0.5);
        bomb.tint = 0xffffff;
        this.start = false;

        //clean up and remove
        this._game.time.events.add(500, this.remove, this);

    };

    Bomb.prototype.get_emitter = function(){
        return this.emitter;
    };

    Bomb.prototype.on_collide = function(bomb, pipe){
        if(pipe){
            pipe.angle += 45;
            pipe.body.mass = 3;
            pipe.body.velocity.y = 400;
            pipe.body.velocity.x = 200;
            pipe.body.gravity.setTo(300);
        }
    };

    return Bomb;

});