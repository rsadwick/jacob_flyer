// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};
//particle
var emitter;

var shieldTween;
//powerups: only 1 powerup state at a time.  No stacking.
var powerupState;
var powerUpTypes = {
    OVERWEIGHT: {
        velocity: -350,
        gravity: 2500,
        creation: 5,
        duration: 2
    },
    FEATHERWEIGHT:{
        velocity: -250,
        gravity: 500,
        creation: 2,
        duration: 7
    },
    NORMAL: {
        velocity: -350,
        gravity: 1000

    },
    SHIELD:{
        duration: 7,
        currentTime: 0
    }
};

var playerDefault;

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };  
game_state.main.prototype = {

    preload: function() { 
		// Function called first to load all the assets
        this.game.stage.backgroundColor = '#71c5cf';

        //load sprite:
        this.game.load.spritesheet('bird', 'assets/jacob.png', 144, 111 );

        //laying the pipe:
        this.game.load.image('pipe', 'assets/pipe.png');

        //star powerup
        this.game.load.image('star', 'assets/star.png');

        //candy
        this.game.load.image('candy', 'assets/cherry.png');

        //bg
        this.game.load.image('shrooms', 'assets/bg_shroom.png');

        //powerups:
        //ton
        this.game.load.image('ton', 'assets/ton.png');
        //feather
        this.game.load.image('feather', 'assets/feather.png');
        //shield
        this.game.load.image('shield', 'assets/shield.png');
        this.game.load.image('shield_effect', 'assets/shield_effect.png');
    },

    create: function() {

        this.background = this.game.add.tileSprite(0, 0, 600, 800, 'shrooms');

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    	this.player_hit_wall = false;
        this.player_powered = false;
        this.player_hit_score = false;
        this.game.input.keyboard.disabled = false
    	// Fuction called after 'preload' to setup the game

        //display bird:
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.game.physics.enable( this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;
        this.bird.body.bounce.x = 0.9;
        this.bird.body.bounce.y = 0.9;
        this.bird.anchor.setTo(0.5, 0.5);

        //animations
        this.bird.animations.add('flying', [0, 1, 2], 10, true);
        this.bird.animations.add('up', [3, 4], 10, true);
        this.bird.animations.add('down', [2, 5], 8, true);

        //controls
        this.space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space_key.onDown.add(this.jump, this);
        this.bird.animations.play('flying');

        //pipes:
        this.pipes = this.game.add.group();
        this.pipes.enableBody = true;
        this.pipes.physicsBodyType = Phaser.Physics.ARCADE;
        this.pipes.createMultiple(15, 'pipe', 0);
        this.pipes.setAll('checkWorldBounds', true);
        this.pipes.setAll('outOfBoundsKill', true);
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

        //hole indicator:
        this.holes = this.game.add.group();
        this.holes.enableBody = true;
        this.holes.physicsBodyType = Phaser.Physics.ARCADE;
        this.holes.createMultiple(15, 'candy', 0);
        this.holes.setAll('checkWorldBounds', true);
        this.holes.setAll('outOfBoundsKill', true);
        this.game.add.tween( this.holes).to( { y: this.holes.y + 12 }, 500, Phaser.Easing.Back.InOut, true, 0, 1000, true);

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ff9900" };
        this.label_score = this.game.add.text(20, 20, "0", style);

        /* power ups */
        //stars:
        this.powerups = this.game.add.group();
        this.powerups.enableBody = true;
        this.powerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.powerups.createMultiple(20, 'ton');
        this.powerups.setAll('checkWorldBounds', true);
        this.powerups.setAll('outOfBoundsKill', true);

        //feather:
        this.feathers = this.game.add.group();
        this.feathers.enableBody = true;
        this.feathers.physicsBodyType = Phaser.Physics.ARCADE;
        this.feathers.createMultiple(20, 'feather');
        this.feathers.setAll('checkWorldBounds', true);
        this.feathers.setAll('outOfBoundsKill', true);

        //shield
        this.shields = this.game.add.group();
        this.shields.enableBody = true;
        this.shields.physicsBodyType = Phaser.Physics.ARCADE;
        this.shields.createMultiple(20, 'shield');
        this.shields.setAll('checkWorldBounds', true);
        this.shields.setAll('outOfBoundsKill', true);

        this.shield_effect = this.game.add.sprite(this.bird.x, this.bird.y, 'shield_effect');
        this.shield_effect.visible = false;

         //random roll for timer duration:
        this.powerup_timer = this.game.time.events.loop(Phaser.Timer.SECOND * 6, this.add_powerup, this);

    },
    
    update: function() {

        //background logic:
        if(!this.player_hit_wall)
            this.background.tilePosition.x -= 0.7;
        else
            this.background.tilePosition.x += 0.3;


		// Function called 60 times per second
        //if bird is out of the world, restart game:
        if(this.bird.inWorld == false){
            this.on_hit();
        }
        if(this.shield_effect.visible == true){
            if(this.shield_effect.inWorld != false)
            {
                this.shield_effect.x = this.bird.x;
                this.shield_effect.y = this.bird.y;
            }
        }

        //player and pipe collision
        this.game.physics.arcade.collide(this.bird, this.pipes, this.on_hit, null, this);

        //player is falling:
        if(!this.space_key.isDown && this.bird.body.velocity.y > 1 && !this.player_hit_wall )
        {
            this.bird.animations.play('down');
        }

        //powerup player:
        this.game.physics.arcade.overlap(this.bird, this.powerups, this.collect_powerup, null, this);
        this.game.physics.arcade.overlap(this.bird, this.feathers, this.collect_feather, null, this);
        this.game.physics.arcade.overlap(this.bird, this.shields, this.collect_shield, null, this);

        //add score when player hits pipe safty zone:
        this.game.physics.arcade.overlap(this.bird, this.holes, this.collect_score, null, this);
    },

    render: function(){
        /*this.game.debug.bodyInfo(this.bird, 32, 32);
        this.game.debug.body(this.bird);
        this.game.debug.body(this.holes, '#ff9900');*/
    },

    //jump:
    jump: function(){
        if(this.player_powered)
        {
            switch(powerupState){
                case powerUpTypes.OVERWEIGHT:
                    this.bird.body.velocity.y = powerUpTypes.OVERWEIGHT.velocity;
                    this.bird.body.gravity.y = powerUpTypes.OVERWEIGHT.gravity;
                    break;
                case powerUpTypes.FEATHERWEIGHT:
                    this.bird.body.velocity.y = powerUpTypes.FEATHERWEIGHT.velocity;
                    this.bird.body.gravity.y = powerUpTypes.FEATHERWEIGHT.gravity;
                    break;
                default:
                    this.bird.body.velocity.y = powerUpTypes.NORMAL.velocity;
                    this.bird.body.gravity.y = powerUpTypes.NORMAL.gravity;
            }
        }
        else
        {
            this.bird.body.velocity.y = powerUpTypes.NORMAL.velocity;
            this.bird.body.gravity.y = powerUpTypes.NORMAL.gravity;
            //maybe use for neat game play for x velo:
            //this.bird.body.velocity.x = 20;
        }
        this.bird.animations.play('up');
    },

    on_hit: function(){
        if(!this.player_hit_wall && powerupState != powerUpTypes.SHIELD)
        {
            this.player_hit_wall = true;
           // this.bird.body.velocity.x =  -300;
            this.game.input.keyboard.disabled = true;
            this.bird.animations.stop();
            this.bird.frame = 6;

            this.game.stage.backgroundColor = '#ff0000';
            this.background.alpha = 0.3;

            //particles
            emitter = game.add.emitter(0, 0, 100);
            emitter.makeParticles(['star']);
            emitter.start(true, 2000, null, 10);
            emitter.x = this.bird.x;
            emitter.y = this.bird.y;
            this.death_timer = this.game.time.events.add(Phaser.Timer.SECOND * 1, this.restart_game, this);
        }
    },

    collect_powerup: function(player, star)
    {
        this.remove_powerup();
        powerupState = powerUpTypes.OVERWEIGHT;
        this.game.physics.enable( star, Phaser.Physics.ARCADE);
        star.kill();
        this.player_powered = true;
        this.bird.body.velocity.y += 10;

        //how long does it last?
        this.overweightTimer = this.game.time.events.add(Phaser.Timer.SECOND * powerUpTypes.OVERWEIGHT.duration, this.remove_powerup, this);
    },

    collect_feather: function(player, star)
    {
        this.remove_powerup();
        powerupState = powerUpTypes.FEATHERWEIGHT;
        this.game.physics.enable( star, Phaser.Physics.ARCADE);
        star.kill();
        this.player_powered = true;
        this.bird.body.velocity.y += 10;

        //how long does it last?
        this.featherTimer = this.game.time.events.add(Phaser.Timer.SECOND * powerUpTypes.FEATHERWEIGHT.duration, this.remove_powerup, this);
    },

    collect_shield: function(player, shield)
    {
        this.remove_powerup();
        powerupState = powerUpTypes.SHIELD;
        this.game.physics.enable( shield, Phaser.Physics.ARCADE);
        shield.kill();

        this.shield_effect.anchor.setTo(0.5, 0.5);
        this.shield_effect.alpha = 0.6;
        this.shield_effect.visible = true;
        shieldTween = this.game.add.tween(this.shield_effect).to( { alpha: 0.8 }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        this.player_powered = true;
        this.bird.body.mass = 9;
        this.bird.body.immovable = true;
        //how long does it last?
        this.shieldTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.shieldCheck, this);


    },

    shieldCheck: function(){
         console.log(powerUpTypes.SHIELD.duration, powerUpTypes.SHIELD.currentTime)
        if (powerUpTypes.SHIELD.duration > powerUpTypes.SHIELD.currentTime){
            powerUpTypes.SHIELD.currentTime++;
            console.log(powerUpTypes.SHIELD.duration, powerUpTypes.SHIELD.currentTime)
        }
        else if (powerUpTypes.SHIELD.duration == powerUpTypes.SHIELD.currentTime){
            this.remove_powerup()
            powerUpTypes.SHIELD.currentTime = 0;
        }

        //start fading shield:
        if( powerUpTypes.SHIELD.currentTime >= 6)
        {
             this.shield_effect.alpha = 0.1
             shieldTween = this.game.add.tween(this.shield_effect).to( { alpha: 0.3 }, 300, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        }
    },

    remove_powerup: function(){

        switch(powerupState){
            case powerUpTypes.OVERWEIGHT:
                this.game.time.events.remove(this.overweightTimer);
                powerupState = powerUpTypes.NORMAL;
                this.player_powered = false;
                this.bird.body.gravity.y = 1000;
            break;

            case powerUpTypes.FEATHERWEIGHT:
                this.game.time.events.remove(this.featherTimer);
                powerupState = powerUpTypes.NORMAL;
                this.player_powered = false;
                this.bird.body.gravity.y = 1000;

            break;

            case powerUpTypes.SHIELD:
                powerUpTypes.SHIELD.currentTime = 0;
                this.game.time.events.remove(this.shieldTimer);
                powerupState = powerUpTypes.NORMAL;
                this.player_powered = false;
                this.bird.body.mass = 1;
                this.bird.body.immovable = false;
                this.shield_effect.visible = false;
            break;
        }
    },

    restart_game: function(){

        powerupState = powerUpTypes.NORMAL;
        //clean up timers:
        this.game.time.events.remove(this.timer);
        this.game.time.events.remove(this.death_timer);
        this.game.time.events.remove(this.powerup_timer);
        this.game.time.events.remove(this.choosePowerupTimer);
        this.game.time.events.remove(this.shieldTimer);
        this.game.time.events.remove(this.overweightTimer);
        this.game.time.events.remove(this.featherTimer);
        this.game.state.start('main');
    },

    add_one_pipe: function(x, y){
        var pipe = this.pipes.getFirstDead();
        if(pipe ){
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;
            pipe.body.bounce.x = 1;
            pipe.body.bounce.y = 1;
           // pipe.body.mass = 1;
        }
    },

    add_row_of_pipes: function(){
        var hole = Math.floor(Math.random() * 5) - 1;

        for(var i = 0; i < 8; i++){
            if(i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3){
                this.add_one_pipe(400, i * 60 + 10);
            }
            else
            {
                var single_hole = this.holes.getFirstDead();
                if(single_hole){
                    single_hole.reset(400, i * 60 + 10);
                    //single_hole.alpha = 0.1;
                    single_hole.body.velocity.x = -200;
                    single_hole.body.bounce.x = 10;
                }
            }
        }
    },

    add_powerup: function(){
        //roll for duration
        this.powerup_creation = Math.floor(Math.random() * 3) + 1;
        if( this.choosePowerupTimer)
            this.game.time.events.remove(this.choosePowerupTimer);
        this.choosePowerupTimer = this.game.time.events.loop(Phaser.Timer.SECOND * this.powerup_creation, this.choose_powerup, this);
        console.log(this.powerup_creation);
    },

    choose_powerup: function(){
        var powerUp;
        var totalPowerups = 3;
        var randomSeed = Math.floor(Math.random() * totalPowerups);
        //randomSeed = 2;
        switch(randomSeed){
            case 0:
                powerUp = this.powerups.getFirstDead();
                //this.game.physics.enable( star, Phaser.Physics.ARCADE);
                powerUp.reset(this.game.width, 100);
                powerUp.body.gravity.y = 4;
                powerUp.body.velocity.x = -200;
                powerUp.body.velocity.y = 45;
                powerUp.body.rotation.y = 3;
                powerUp.body.bounce.y = 0.7 + Math.random() * 0.2;
                powerUp.body.bounce.x = 1.7 + Math.random() * 0.2;
                break;
            case 1:
                powerUp = this.feathers.getFirstDead();
                powerUp.reset(this.game.width, 100);
                powerUp.body.gravity.y = 1;
                powerUp.body.velocity.x = -100;
                powerUp.body.velocity.y = 20;
                var rotationStart = -0.5;
                var rotationEnd = 1;
                powerUp.rotation = rotationStart;
                this.game.add.tween(powerUp).to( { rotation: rotationEnd }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
                break;

            case 2:
                powerUp = this.shields.getFirstDead();
                powerUp.reset(this.game.width, 100);
                powerUp.body.gravity.y = 1;
                powerUp.body.velocity.x = -100;
                powerUp.body.velocity.y = 20;

                //this.game.add.tween(powerUp).to( { scale: 2 }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
                break;

        }
    },

    collect_score: function(obj, obj2){
        obj2.kill();
        //score player based on powerups
        switch(powerupState)
        {
            case powerUpTypes.OVERWEIGHT:
                this.score += 5;
                break;

            case powerUpTypes.FEATHERWEIGHT:
                this.score += 5;
                break;

            default:
                this.score += 1;
        }
        this.score += 1;
        this.label_score.text = this.score;
    },

    processCo: function(){
        console.log("YPPPPPPP")
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 