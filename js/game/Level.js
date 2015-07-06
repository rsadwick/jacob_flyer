define(['/js/game/HUD.js', '/js/game/Player.js', 'js/game/powerup/Powerup.js', 'js/game/powerup/Shield.js', 'js/game/powerup/Weight.js', 'js/game/powerup/Feather.js', 'js/game/powerup/Bomb.js'], function (HUD, Player, Powerup, Shield, Weight, Feather, Bomb) {

    "use strict";

    var Level = function () {
        this._game;
        this._player;
        this.background;
        this.pipes;
        this.settings;
        this.powerups;
        this.old_powerup;
        this.powerup;
        this.powerup_timer;
        this.choosePowerupTimer;
        this.death_timer;
        this.boss_timer;
        this.current_level = 0;

        this.hud;

    }

    Level.prototype.init = function (game, settings, powerups) {
        this._game = game;
        this.settings = settings;
        this.powerups = powerups;
    };

    Level.prototype.preload = function () {
        this._game.stage.backgroundColor = '#71c5cf';

        //laying the pipe:
        this._game.load.image('pipe', 'assets/pip_wall.png');

        //star powerup
        this._game.load.image('star', 'assets/star.png');

        //leaf heal
        this._game.load.image('leaf', 'assets/leaf.png');

        //candy
        this._game.load.image('candy', 'assets/cherry.png');

        //background:
        this._game.load.image('shrooms', this.settings.level[this.get_level()].background);
    };

    Level.prototype.create = function (player, hud) {

        //events
        this._game.events.onPlayerDeath.add(this.kill_player, this);

        this.hud = hud;

        this._player = player;
        this.background = this._game.add.tileSprite(0, 0, 600, 800, 'shrooms');
        this._game.input.keyboard.disabled = false;

        //pipes:
        this.pipes = this._game.add.group();
        this.pipes.physicsBodyType = Phaser.Physics.ARCADE;
        this.pipes.enableBody = true;

        this.pipes.createMultiple(25, 'pipe', 0);
        this.pipes.setAll('checkWorldBounds', true);
        this.pipes.setAll('outOfBoundsKill', true);
        this.timer = this._game.time.events.loop(1500, this.add_row_of_pipes, this);

        //hole indicator:
        this.holes = this._game.add.group();
        this.holes.enableBody = true;
        this.holes.physicsBodyType = Phaser.Physics.ARCADE;
        this.holes.createMultiple(15, 'candy', 0);
        this.holes.setAll('checkWorldBounds', true);
        this.holes.setAll('outOfBoundsKill', true);
        this._game.add.tween(this.holes).to({ y: this.holes.y + 12 }, 500, Phaser.Easing.Back.InOut, true, 0, 1000, true);

         //random roll for timer duration:
        this.powerup_timer = this._game.time.events.loop(Phaser.Timer.SECOND * 3, this.create_powerup, this);

        //boss timer:
        this.boss_timer = this._game.time.create(false);
        this.boss_timer.add(20000, this.summon_boss, this);
        this.boss_timer.start();

    };

    Level.prototype.update = function () {
        //background logic:
        if(!this._player.get_hit_wall())
            this.background.tilePosition.x -= 0.7;
        else
            this.background.tilePosition.x += 0.3;

        //player and pipe collision
        this._game.physics.arcade.collide(this._player.get_player(), this.pipes, this._player.hit, null, this._player);
        this._game.physics.arcade.collide(this.pipes, this.pipes, this.on_pipe_on_pipe, null, this);

        //collect cherries:
        this._game.physics.arcade.overlap(this._player.get_player(), this.holes, this.validate_score, null, this);

        //powerups:
        if(this.powerup)
            this._game.physics.arcade.overlap(this._player.get_player(), this.powerup.get_powerup(), this.on_collect, null, this);

        //bomb emitters
        if(this.powerup instanceof Bomb)
        {
            this._game.physics.arcade.overlap(this.powerup.get_powerup(), this.pipes, this.powerup.on_collide, null, this.powerup);
        }
    };

    Level.prototype.add_one_pipe = function(x, y){
        var pipe = this.pipes.getFirstDead();
        if (pipe) {
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;
            pipe.body.mass = 10;
            pipe.body.bounce.setTo(1, 1);
            pipe.angle = 0;
            pipe.body.gravity.setTo(0, 0);
        }
    };

    Level.prototype.add_row_of_pipes = function(){
        var hole = Math.floor(Math.random() * 5) - 1;

        for (var i = 0; i < 8; i++) {
            if (i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3) {
                this.add_one_pipe(400, i * 60 + 10);
            }
            else {
                var single_hole = this.holes.getFirstDead();
                if (single_hole) {
                    single_hole.reset(400, i * 60 + 10);
                    //single_hole.alpha = 0.1;
                    single_hole.body.velocity.x = -200;
                    single_hole.body.bounce.x = 10;
                }
            }
        }
    };

    Level.prototype.on_pipe_on_pipe = function(pipe1, pipe2){
        if(pipe1){
            pipe1.body.velocity.setTo(200);
        }
    };

    Level.prototype.create_powerup = function(){
        var powerup_creation = Math.floor(Math.random() * 2) + 2;
        this.choosePowerupTimer = this._game.time.events.add(Phaser.Timer.SECOND * powerup_creation, this.choose_powerup, this);
    };

    Level.prototype.choose_powerup = function(){
        this._game.time.events.remove(this.choosePowerupTimer);

        //roll for powerup
        var randomSeed = Math.random();
        console.log(randomSeed);
        this.old_powerup = this.powerup;
        for(var powerup in this.powerups){
            if(randomSeed >= this.powerups[powerup].get_start_chance() && randomSeed <= this.powerups[powerup].get_end_chance() ){
                this.powerups[powerup].add();
                this.powerup = this.powerups[powerup];
            }
        }
    };

    Level.prototype.on_collect = function(player, powerup){
        if(this.powerup instanceof Bomb)
            return;

        powerup.kill();
        this._player.set_powerup_effect(this.powerup, this.old_powerup);
    };

    Level.prototype.kill_player = function(){
        this._game.stage.backgroundColor = '#ff0000';
        this.background.alpha = 0.3;
        this.death_timer = this._game.time.events.add(Phaser.Timer.SECOND * 1, this.restart, this);
    };

    Level.prototype.restart = function(){
        this.dispose();
        this._game.state.start('main');
    };

    Level.prototype.get_settings = function(){
        return this.settings;
    };

    Level.prototype.validate_score = function(player, obj){
        obj.kill();
        var collide_obj = {player: player, obj: obj}
        this.score_event = new CustomEvent("score_event", {'detail': collide_obj});
        window.dispatchEvent(this.score_event, collide_obj);
    };

    Level.prototype.summon_boss = function(){
        this._game.time.events.remove(this.boss_timer);
        this._game.time.events.remove(this.timer);

        //background change to denote boss phase starting:
        this._game.stage.backgroundColor = '#999999';
        this._game.add.tween(this.background).to({ alpha: 0.5 }, 2000, Phaser.Easing.Linear.None, true);
        var boss = this.settings.level[this.get_level()].character.BOSS.type;
        boss.add();
        this.hud.create_boss_lives();
    };

    Level.prototype.get_pipes = function(){
        return this.pipes;
    };

    Level.prototype.get_level = function(){
        return this.current_level;
    };

    Level.prototype.set_level = function(level){
        this.current_level = level;
    };

    Level.prototype.dispose = function(){
        this._game.time.events.remove(this.death_timer);
        this._game.time.events.remove(this.choosePowerupTimer);
        this._game.time.events.remove(this.powerup_timer);
        this.hud.reset();

        for(var powerup in this.powerups){
            this.powerups[powerup].remove();
        }
    };

    return Level;

});