define(['/js/game/Level.js', '/js/game/Player.js', '/js/game/powerup/Powerup.js'], function (Level, Player, Powerup) {

    "use strict";

    var Bomb = function () {
        Powerup.call(this);
        this.start_chance = 0.0;
        this.end_chance = 1;
        this.start = false;
        this.emitter;
        this.tween;
        this.delay_timer;
        this.timer;
    }

    Bomb.prototype = Object.create(Powerup.prototype);

    Bomb.prototype.constructor = Bomb;

    Bomb.prototype.preload = function () {
        this._game.load.image('bomb', 'assets/bomb.png');
        this._game.load.image('burst_blue', 'assets/laserBlueBurst.png');
        this._game.load.image('burst_green', 'assets/laserGreenBurst.png');
        this._game.load.image('burst_red', 'assets/laserRedBurst.png');
        this._game.load.image('burst_yellow', 'assets/laserYellowBurst.png');
    };

    Bomb.prototype.create = function () {

        this.bombs = this._game.add.group();
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombs.enableBody = true;

        this.bombs.createMultiple(1, 'bomb');
        this.bombs.setAll('checkWorldBounds', true);
        this.bombs.setAll('outOfBoundsKill', true)
    };

    Bomb.prototype.update = function () {
        if (this.bombs.length >= 1 ) {
            var bomber = this.get_instances();
            if(bomber){
                bomber.body.velocity.x = Math.cos(this._game.time.now) / 200 * 100;
                bomber.body.velocity.y = Math.sin(this._game.time.now / 500) * 90;
            }
        }
    };

    Bomb.prototype.add = function(){
        //pick a place to explode:
        var bomb = this.bombs.getFirstDead();

        if(bomb){
            bomb.reset(this._game.width / 2, this._game.height / 2);
            this.delay_timer = this._game.time.events.add(Phaser.Timer.SECOND * 5, this.track_pipes, this);
        }
    };

    Bomb.prototype.remove = function(){
        if(this.timer)
            this._game.time.events.remove(this.timer);

        var bomb = this.get_instances();

        if(bomb && this.emitter){
            if(this.bombs.length >= 1){
                this.emitter.destroy(true, false);
                this.tween.stop();
                bomb.tint = 0xFFFFFF;
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
        return (instance.alive) ? instance : null;
    };

    Bomb.prototype.explode = function(){

        this.emitter = this._game.add.emitter(0, 0, 0, 250);

        this.emitter.makeParticles(['burst_blue', 'burst_green', 'burst_red', 'star', 'burst_yellow'], 0, 20, true);
        this.emitter.setRotation(360, 180);
        this.emitter.setAlpha(1, 0, 500);

        var bomb = this.get_instances();
        if(bomb){
             bomb.addChild(this.emitter);
            //bomb.anchor.setTo(0.5, 0.5);
        }

        this.emitter.start(false, 0, 10, 50, true);

        this.start = false;
        //clean up and remove
        this.timer = this._game.time.events.add(500, this.remove, this);

    };

    Bomb.prototype.on_collide = function(bomb, pipe){
        if(pipe && pipe.name === "current"){
            pipe.angle += 45;
            pipe.body.mass = 3;
            pipe.body.velocity.y = 400;
            pipe.body.velocity.x = 200;
            pipe.body.gravity.setTo(300);

            this.explode();
        }
    };

    Bomb.prototype.track_pipes = function(){
        this._game.time.events.remove(this.delay_timer);
        var bomb = this.bombs.getFirstDead();
        this.tween = this._game.add.tween(bomb)
            .to({ tint: 0xf50400 }, 2000, Phaser.Easing.Elastic.InOut, false, 1000)
            .to({ tint: 0x0066f5}, 1000, Phaser.Easing.Elastic.InOut)
            .to({ tint: 0xffffff}, 1000, Phaser.Easing.Elastic.In);

        this.tween.start();
        this.tween.repeat(-1, 20);

        var pipe = this._level.get_pipes();
        if(pipe){

            for(var pipe_index = 0; pipe_index < 4; pipe_index++){
                var pipe_instance = pipe.getChildAt(pipe_index);
                pipe_instance.name = "current";
            }
        }
    }

    return Bomb;

});