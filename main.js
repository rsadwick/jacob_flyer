// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};
//particle
var emitter;

var bombEmitter;
var bombStart = false;

//boss switch for bullets
var bulletHitShield = false;

//player lives
var lives;
var maxLife = 3;
var currentLifeSprite;

//boss lives
var bossLife = 3;
var currentBossLife;

//tweens: need to be moved into game state
var bossTween;
var shieldTween;
//powerups: only 1 powerup state at a time.  No stacking.
var powerupState;
var powerUpTypes = {
    OVERWEIGHT: {
        velocity: -350,
        gravity: 2500,
        creation: 5,
        duration: 7,
        chance: -1,
        tint: 0x999999,
        graphic: 'assets/weight.png'
    },
    FEATHERWEIGHT: {
        velocity: -250,
        gravity: 500,
        creation: 2,
        duration: 7,
        chance: -1,
        tint: 0xff9900
    },
    NORMAL: {
        velocity: -350,
        gravity: 1000

    },
    SHIELD: {
        duration: 7,
        currentTime: 0,
        chance: -1,
        blendMode: Phaser.blendModes.ADD
    },
    BOMBOS: {
        velocity: -350,
        gravity: 2500,
        creation: 5,
        duration: 7,
        chance: 0.100,
        tint: 0x999999,
        graphic: 'assets/bomb.png'
    }
};

var bossAbilties = {
    UP_ATTACK: {
        chance: 0.10,
        damage: 1,
        ease: Phaser.Easing.Bounce.InOut
    },

    CHARGE_ATTACK: {
        chance: 0.90,
        damage: 2,
        ease: Phaser.Easing.Elastic.Out,
        speed: 1000
    }
};

var character = {
    PLAYER: {
        name: "player"
    },
    BOSS: {
        name: "boss"
    }
};

var level = {
    name: "level 1",
    background: 'assets/bg_desert.png'

}

// Creates a new 'main' state that wil contain the game
game_state.main = function () {
};
game_state.main.prototype = {

    preload: function () {
        // Function called first to load all the assets
        this.game.stage.backgroundColor = '#71c5cf';

        //load sprite:
        this.game.load.spritesheet('bird', 'assets/jacob.png', 144, 111);

        //laying the pipe:
        this.game.load.image('pipe', 'assets/pip_wall.png');

        //star powerup
        this.game.load.image('star', 'assets/star.png');

        //candy
        this.game.load.image('candy', 'assets/cherry.png');

        //bg
        this.game.load.image('shrooms', level.background);

        //powerups:
        //ton
        this.game.load.image('ton', powerUpTypes.OVERWEIGHT.graphic);
        //feather
        this.game.load.image('feather', 'assets/feather.png');
        //shield
        this.game.load.image('shield', 'assets/shield.png');
        this.game.load.image('shield_effect', 'assets/shield_effect.png');

        //bombos
        this.game.load.image('bomb', powerUpTypes.BOMBOS.graphic);

        //boss
        this.game.load.image('clown', 'assets/clown_boss.png');

        //load lives sprite:
        this.game.load.spritesheet('lives', 'assets/lives.png', 52, 45);
    },

    create: function () {
        maxLife = 3;
        bossLife = 3;
        this.background = this.game.add.tileSprite(0, 0, 600, 800, 'shrooms');

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.player_hit_wall = false;
        this.player_powered = false;
        this.boss_hit_player = false;
        this.game.input.keyboard.disabled = false;
        // Fuction called after 'preload' to setup the game

        //display bird:
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;
        this.bird.body.mass = 1;
        //this.bird.body.bounce.setTo(1,1);
        //this.bird.body.bounce.y = 0.9;
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
        this.pipes.createMultiple(25, 'pipe', 0);
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
        this.game.add.tween(this.holes).to({ y: this.holes.y + 12 }, 500, Phaser.Easing.Back.InOut, true, 0, 1000, true);

        //lives ui groups for player and boss
        this.lives = this.game.add.group();
        this.bossLives = this.game.add.group();

        //player lives:
        //var livesSprite;
        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            currentLifeSprite = this.lives.create(10 + (60 * i), 20, 'lives');
            currentLifeSprite.frame = 2;
        }

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ff9900" };
        this.label_score = this.game.add.text(10, currentLifeSprite.y + currentLifeSprite.height + 12, "0", style);

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

        //bombos
        this.bombos = this.game.add.group();
        this.bombos.enableBody = true;
        this.bombos.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombos.createMultiple(1, 'bomb');
        this.bombos.setAll('checkWorldBounds', true);
        this.bombos.setAll('outOfBoundsKill', true);

        this.shield_effect = this.game.add.sprite(this.bird.x, this.bird.y, 'shield_effect');
        this.shield_effect.visible = false;

        //random roll for timer duration:
        this.powerup_timer = this.game.time.events.loop(Phaser.Timer.SECOND * 3, this.add_powerup, this);

        //boss timer:
        this.levelTimer = this.game.time.create(false);
        this.levelTimer.add(500, this.create_boss, this);
        //this.levelTimer.start();

        //bullets for boss:
        this.bullets = this.game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(3, 'candy');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);
    },

    update: function () {

        //background logic:
        if (!this.player_hit_wall)
            this.background.tilePosition.x -= 0.7;
        else
            this.background.tilePosition.x += 0.3;

        //if bird is out of the world, restart game:
        if (this.bird.inWorld == false) {
            this.on_hit();
        }
        if (this.shield_effect.visible == true) {
            if (this.shield_effect.inWorld != false) {
                this.shield_effect.x = this.bird.x;
                this.shield_effect.y = this.bird.y;
            }
        }
        if (this.bombos.length >= 1 && bombStart == false && bombEmitter != null) {

            var currentBombo = this.getBombos();

            if (currentBombo.inWorld) {
                bombEmitter.start(true, 300, 6, 10);
                bombStart = true;
            }
        }

        //player and pipe collision
        this.game.physics.arcade.collide(this.bird, this.pipes, this.on_hit, null, this);
        this.game.physics.arcade.collide(this.pipes, this.pipes, this.on_pipe_on_pipe, null, this);

        //bomb emitter
        this.game.physics.arcade.collide(bombEmitter, this.pipes, this.onBombHitPipe, null, this);

        //player is falling:
        if (!this.space_key.isDown && this.bird.body.velocity.y > 1 && !this.player_hit_wall) {
            this.bird.animations.play('down');
        }

        //powerup player:
        this.game.physics.arcade.overlap(this.bird, this.powerups, this.collect_powerup, null, this);
        this.game.physics.arcade.overlap(this.bird, this.feathers, this.collect_feather, null, this);
        this.game.physics.arcade.overlap(this.bird, this.shields, this.collect_shield, null, this);

        //add score when player hits pipe saftey zone:
        this.game.physics.arcade.overlap(this.bird, this.holes, this.collect_score, null, this);

        //boss bullets
        this.game.physics.arcade.overlap(this.bird, this.bullets, this.onBulletDamage, null, this);
        this.game.physics.arcade.overlap(this.clown, this.bird, this.onBossAttack, null, this);
        this.game.physics.arcade.overlap(this.clown, this.bullets, this.onBulletDamageBoss, null, this);

    },

    render: function () {
        //this.game.debug.bodyInfo(this.bird, 32, 32);
        //this.game.debug.body(this.bird);
        //this.game.debug.body(this.holes, '#ff9900');
    },

    hurtCharacter: function (actor, amount, lifeSprite) {
        var liveGroup;
        var actorLife = (actor == character.PLAYER) ? maxLife : bossLife
        if (amount >= 3) {
            lifeSprite.setAll("frame", 0);
        }
        else {
            liveGroup = lifeSprite.getAt(actorLife - 1);
            if (liveGroup.frame == 2) {
                liveGroup.frame = 1;
            }
            else {
                liveGroup.frame = 0;
                (actor == character.PLAYER) ? maxLife -= 1 : bossLife -= 1;

                if (actor == character.PLAYER) {
                    if (maxLife == 0) {
                        this.on_hit();
                    }
                }
                else {
                    if (bossLife == 0) {
                        //todo:kill boss
                    }
                }
            }
        }
    },

    //jump:
    jump: function () {
        //affect the way the player jumps with different powerups:
        if (this.player_powered) {
            switch (powerupState) {
                case powerUpTypes.OVERWEIGHT:
                    this.bird.body.velocity.y = powerUpTypes.OVERWEIGHT.velocity;
                    this.bird.body.gravity.y = powerUpTypes.OVERWEIGHT.gravity;
                    break;
                case powerUpTypes.FEATHERWEIGHT:
                    this.bird.body.velocity.y = powerUpTypes.FEATHERWEIGHT.velocity;
                    this.bird.body.gravity.y = powerUpTypes.FEATHERWEIGHT.gravity;
                    break;
                default:
                    //fall into this just in case
                    this.bird.body.velocity.y = powerUpTypes.NORMAL.velocity;
                    this.bird.body.gravity.y = powerUpTypes.NORMAL.gravity;
            }
        }
        else {
            this.bird.body.velocity.y = powerUpTypes.NORMAL.velocity;
            this.bird.body.gravity.y = powerUpTypes.NORMAL.gravity;
            //maybe use for neat game play for x velo:
            //this.bird.body.velocity.x = 20;
        }
        this.bird.animations.play('up');
    },

    on_hit: function (player, obj) {
        if(obj)
            obj.body.gravity.y = 300;
        if (!this.player_hit_wall && powerupState != powerUpTypes.SHIELD) {
            this.hurtCharacter(character.PLAYER, 3, this.lives);
            this.kill_player();
        }
        else if (!this.player_hit_Wall && maxLife <= 0) {
            this.hurtCharacter(character.PLAYER, 3, this.lives);
            this.kill_player();
        }
    },

    on_pipe_on_pipe: function(pipe1, pipe2){
         if (pipe1) {
            pipe1.body.velocity.setTo(100);
           // pipe1.body.gravity.setTo(200);

        }
    },

    kill_player: function () {
        this.player_hit_wall = true;
        this.game.input.keyboard.disabled = true;
        this.bird.animations.stop();
        this.bird.frame = 6;

        this.game.stage.backgroundColor = '#ff0000';
        this.background.alpha = 0.3;

        //particles
        emitter = game.add.emitter(0, 0, 100);
        emitter.makeParticles(['star']);
        emitter.start(false, 2000, 0, 10);
        emitter.x = this.bird.body.x + this.bird.width / 2;
        emitter.y = this.bird.body.y;

        this.death_timer = this.game.time.events.add(Phaser.Timer.SECOND * 1, this.restart_game, this);
    },
    //todo: needs to be refactored into one method but this will work for now
    /* Powerups cannot stack, the effect is removed when the player picks up another powerup */
    collect_powerup: function (player, star) {
        this.remove_powerup();
        powerupState = powerUpTypes.OVERWEIGHT;
        this.game.physics.enable(star, Phaser.Physics.ARCADE);
        star.kill();
        this.bird.tint = powerUpTypes.OVERWEIGHT.tint;
        this.player_powered = true;
        this.bird.body.velocity.y += 10;

        //how long does it last?
        this.overweightTimer = this.game.time.events.add(Phaser.Timer.SECOND * powerUpTypes.OVERWEIGHT.duration, this.remove_powerup, this);
    },

    collect_feather: function (player, star) {
        this.remove_powerup();
        powerupState = powerUpTypes.FEATHERWEIGHT;
        this.game.physics.enable(star, Phaser.Physics.ARCADE);
        star.kill();
        this.bird.tint = powerUpTypes.FEATHERWEIGHT.tint;
        this.bird.alpha = 0.4;
        this.player_powered = true;
        this.bird.body.velocity.y += 10;

        //how long does it last?
        this.featherTimer = this.game.time.events.add(Phaser.Timer.SECOND * powerUpTypes.FEATHERWEIGHT.duration, this.remove_powerup, this);
    },

    collect_shield: function (player, shield) {
        this.remove_powerup();
        powerupState = powerUpTypes.SHIELD;
        this.game.physics.enable(shield, Phaser.Physics.ARCADE);
        shield.kill();

        this.shield_effect.anchor.setTo(0.5, 0.5);
        this.shield_effect.alpha = 0.6;
        this.shield_effect.visible = true;
        this.shield_effect.blendMode = powerUpTypes.SHIELD.blendMode;
        shieldTween = this.game.add.tween(this.shield_effect).to({ alpha: 0.8 }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        this.player_powered = true;
        this.bird.body.mass = 45;
        this.bird.body.immovable = true;
        //how long does it last?
        this.shieldTimer = this.game.time.events.loop(Phaser.Timer.SECOND, this.shieldCheck, this);
    },

    shieldCheck: function () {
        if (powerUpTypes.SHIELD.duration > powerUpTypes.SHIELD.currentTime) {
            powerUpTypes.SHIELD.currentTime++;
        }
        else if (powerUpTypes.SHIELD.duration == powerUpTypes.SHIELD.currentTime) {
            this.remove_powerup()
            powerUpTypes.SHIELD.currentTime = 0;
        }

        //start fading shield:
        if (powerUpTypes.SHIELD.currentTime >= 6) {
            this.shield_effect.alpha = 0.1
            shieldTween = this.game.add.tween(this.shield_effect).to({ alpha: 0.3 }, 300, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        }
    },

    remove_powerup: function () {
        this.bird.blendMode = Phaser.blendModes.NORMAL;
        this.bird.tint = 0xFFFFFF;
        this.bird.alpha = 1;
        switch (powerupState) {
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

    restart_game: function () {

        powerupState = powerUpTypes.NORMAL;
        //clean up timers:
        this.game.time.events.remove(this.timer);
        this.game.time.events.remove(this.death_timer);
        this.game.time.events.remove(this.powerup_timer);
        this.game.time.events.remove(this.choosePowerupTimer);
        this.game.time.events.remove(this.shieldTimer);
        this.game.time.events.remove(this.overweightTimer);
        this.game.time.events.remove(this.featherTimer);
        this.game.time.events.remove(this.choosePowerupTimer);
        this.game.state.start('main');
    },

    add_one_pipe: function (x, y) {
        var pipe = this.pipes.getFirstDead();
        if (pipe) {
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;
            pipe.body.mass = 10;
            pipe.body.bounce.setTo(1, 1);
            pipe.angle = 0;
            pipe.body.gravity.setTo(0, 0);
        }
    },

    add_row_of_pipes: function () {
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
    },

    add_powerup: function () {
        //roll for time when powerup is created
        this.powerup_creation = Math.floor(Math.random() * 5) + 2;
        this.choosePowerupTimer = this.game.time.events.add(Phaser.Timer.SECOND * this.powerup_creation, this.choose_powerup, this);
    },

    choose_powerup: function () {
        this.game.time.events.remove(this.choosePowerupTimer);
        var powerUp;
        var _scope = this;
        //roll for power up
        var randomSeed = Math.random();
        console.log(randomSeed)

        if (randomSeed < powerUpTypes.SHIELD.chance) {
            // option 1: chance 0.0–0.499...
            powerUp = this.shields.getFirstDead();
            powerUp.reset(this.game.width, 100);
            powerUp.body.gravity.y = 1;
            powerUp.body.velocity.x = -100;
            powerUp.body.velocity.y = 20;
        }
        else if (randomSeed < powerUpTypes.FEATHERWEIGHT.chance) {
            // option 2: chance 0.50—0.7499...
            powerUp = this.feathers.getFirstDead();
            powerUp.reset(this.game.width, 100);
            powerUp.body.gravity.y = 1;
            powerUp.body.velocity.x = -100;
            powerUp.body.velocity.y = 20;
            var rotationStart = -0.5;
            var rotationEnd = 1;
            powerUp.rotation = rotationStart;
            this.game.add.tween(powerUp).to({ rotation: rotationEnd }, 1000, Phaser.Easing.Back.InOut, true, 0, 1000, true);
        }
        else if (randomSeed < powerUpTypes.OVERWEIGHT.chance) {
            //option 3: chance 0.75–0.99...
            powerUp = this.powerups.getFirstDead();
            //this.game.physics.enable( star, Phaser.Physics.ARCADE);
            powerUp.reset(this.game.width, 100);
            powerUp.body.gravity.y = 4;
            powerUp.body.velocity.x = -200;
            powerUp.body.velocity.y = 45;
            powerUp.body.rotation.y = 3;
            powerUp.body.bounce.y = 0.7 + Math.random() * 0.2;
            powerUp.body.bounce.x = 1.7 + Math.random() * 0.2;
        }
        else {
            // else if (randomSeed < powerUpTypes.BOMBOS.chance) {
            //option 3: chance 0.75–0.99...
            powerUp = this.bombos.getFirstDead();
            //this.game.physics.enable( star, Phaser.Physics.ARCADE);
            if (powerUp) {
                powerUp.reset(this.game.width, 100);

                powerUp.body.gravity.y = 7;
                powerUp.body.velocity.x = -60;
                powerUp.body.velocity.y = 20;
                powerUp.body.rotation.y = 3;
                powerUp.body.bounce.y = 0.7 + Math.random() * 0.2;
                powerUp.body.bounce.x = 1.7 + Math.random() * 0.2;

                this.bombosTween = this.game.add.tween(powerUp)
                    .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 1000)
                    .to({ tint: 0x0066f5}, 1000, Phaser.Easing.Elastic.InOut)
                    .to({ tint: 0xffffff}, 1000, Phaser.Easing.Elastic.In);

                this.bombosTween.start();
                this.bombosTween.onComplete.add(onBombosComplete, this);

                function onBombosComplete() {
                    _scope.createBombosExploder();
                }
            }
        }
    },

    collect_score: function (obj, obj2) {
        obj2.kill();
        //score player based on powerups
        switch (powerupState) {
            case powerUpTypes.OVERWEIGHT:
                this.score += 5;
                break;

            case powerUpTypes.FEATHERWEIGHT:
                this.score += 5;
                break;

            default:
                this.score += 1;
        }
        this.label_score.text = this.score;
    },

    /* Clown Boss *
     / * Two moves: Move Up/Down + Shoot.  Charges and resets position.
     */
    create_boss: function () {
        //stop level generation:
        this.game.time.events.remove(this.timer);
        //background change:
        this.game.stage.backgroundColor = '#999999';
        this.game.add.tween(this.background).to({ alpha: 0.1 }, 2000, Phaser.Easing.Linear.None, true);

        //create boss:
        this.clown = this.game.add.sprite(108, 180, 'clown');
        this.clown.alpha = 0;
        this.clown.x = this.game.width - this.clown.width;
        this.clown.y = this.game.height / 2 - this.clown.height;
        this.clown.enableBody = true;
        this.game.physics.enable(this.clown, Phaser.Physics.ARCADE);

        this.bossTween = this.game.add.tween(this.clown).to({ alpha: 1 }, 2000, Phaser.Easing.Linear.None, false, 2000)
        this.bossTween.onComplete.add(this.startBoss, this);
        this.bossTween.start();

        //boss lives: todo: move into a function since player uses same code

        for (var i = 0; i < 3; i++) {
            //  They are evenly spaced out on the X coordinate, with a random Y coordinate
            currentBossLife = this.bossLives.create(220 + (60 * i), 20, 'lives');
            currentBossLife.frame = 2;
            currentBossLife.tint = 0x999999;
        }
    },

    startBoss: function () {
        //scope
        this.shotsFired = 0;
        var _scope = this;

        //loads the timer that shoots the fireballs:
        function loadFireBalls() {
            this.fireballTimer = this.game.time.create(false);
            this.fireballTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 2, shootFireballs, this);
        }

        //shots fired!
        function shootFireballs() {

            var bullet = this.bullets.getFirstDead();
            //reset bullet gravity:
            bullet.body.gravity.y = 0;
            bullet.reset(this.clown.x - 8, this.clown.y - 8);
            //when player is powered with feather weight, the boss throws like a pee wee:
            if (powerupState == powerUpTypes.FEATHERWEIGHT) {
                this.game.physics.arcade.moveToObject(bullet, this.bird, 60, 9500);
                bullet.body.gravity.y = 100;
            }
            else {
                this.game.physics.arcade.moveToObject(bullet, this.bird, 60, 1500);
            }

            this.shotsFired++;
            if (this.shotsFired >= 3) {
                this.game.time.events.remove(this.fireballTimer);
                this.shotsFired = 0;
                _scope.startBoss();
            }
        }

        //roll the dice for boss attacks
        var randomSeed = Math.random();

        //less than change
        if (randomSeed < bossAbilties.UP_ATTACK.chance) {

            //boss figures out where he is and moves according to top/bottom.
            var bossPosition;
            (this.clown.y < this.game.height / 2) ? bossPosition = 300 : bossPosition = 5;
            this.fireweed = this.game.add.tween(this.clown).to({ y: bossPosition }, 2000, Phaser.Easing.Elastic.InOut, true, 500);
            this.fireweed.onComplete.add(loadFireBalls, this);
        }

        //greater than chance:
        else if (randomSeed < bossAbilties.CHARGE_ATTACK.chance) {
            this.boss_hit_player = false;
            var oldPositionX = this.clown.x;
            var oldPositionY = this.clown.y;
            var nextPositionX = this.bird.x;
            var nextPositionY = this.bird.y;

            //affect charge attack based on which powerup the player has:
            switch (powerupState) {
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
            }

            this.bossTween = this.game.add.tween(this.clown)
                .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut, false, 500)
                .to({ tint: 0x0066f5, x: nextPositionX, y: nextPositionY }, bossAbilties.CHARGE_ATTACK.speed, Phaser.Easing.Elastic.InOut)
                .to({ tint: 0xffffff, x: oldPositionX, y: oldPositionY}, 500, Phaser.Easing.Elastic.In);
            this.bossTween.onComplete.add(onChargeComplete, this);
            this.bossTween.start();
        }
        //misses the roll just in case:
        else {
            this.startBoss();
        }

        function onChargeComplete() {
            this.bossTween.stop();
            _scope.startBoss();
        }
    },

    onBulletDamage: function (player, bullet) {
        //Boss takes damage/loses advantage based on player's powerups
        if (powerupState == powerUpTypes.SHIELD) {
            //reflect the bullet
            bulletHitShield = true;
            //bullet.reset(this.bird.x - 8, this.bird.y - 8);
            this.game.physics.arcade.moveToObject(bullet, this.clown, 100, 500);
        }
        else if (powerupState == powerUpTypes.OVERWEIGHT) {
            bulletHitShield = true;
            bullet.body.velocity.setTo(400, 400);
        }
        else {
            bullet.kill();
            //particles that make it look like the player is being weighed down:
            this.createBossAttackEffects();
            this.hurtCharacter(character.PLAYER, 1, this.lives);
        }
    },

    onBossAttack: function (boss, player) {
        if (!this.boss_hit_player) {
            if (powerupState == powerUpTypes.SHIELD) {
                var shotAnim = this.game.add.tween(boss)
                    .to({ tint: 0xf50400 }, 100, Phaser.Easing.Elastic.InOut)
                    .to({ tint: 0x0066f5 }, 100, Phaser.Easing.Elastic.InOut)
                    .to({ tint: 0xffffff }, 100, Phaser.Easing.Elastic.In);
                shotAnim.start();
                this.hurtCharacter(character.BOSS, 1, this.bossLives);
                this.boss_hit_player = true;
            }
            else {
                this.hurtCharacter(character.PLAYER, 1, this.lives);
                this.createBossAttackEffects();
                this.boss_hit_player = true;
            }
        }
    },

    createBossAttackEffects: function () {
        var damageEmitter = game.add.emitter(game.world.centerX, 0, 0, 5);
        damageEmitter.makeParticles(['star']);
        damageEmitter.setScale(0.1, 1, 0.1, 1, 200, Phaser.Easing.Quintic.Out);
        damageEmitter.setXSpeed(30, -50);
        damageEmitter.setYSpeed(90, -200);
        damageEmitter.start(false, 3000, 0, 5);
        damageEmitter.x = this.bird.body.x  + this.bird.width / 2;
        damageEmitter.y = this.bird.body.y;
    },

    onBulletDamageBoss: function (clown, shot) {
        //condition where player reflected bullet:
        if (bulletHitShield) {
            bulletHitShield = false;
            shot.kill();
            var shotAnim = this.game.add.tween(clown)
                .to({ tint: 0xf50400 }, 1000, Phaser.Easing.Elastic.InOut)
                .to({ tint: 0x0066f5 }, 1000, Phaser.Easing.Elastic.InOut)
                .to({ tint: 0xffffff }, 1000, Phaser.Easing.Elastic.In);
            shotAnim.start();
            this.hurtCharacter(character.BOSS, 1, this.bossLives);
        }
    },

    createBombosExploder: function () {
        bombEmitter = game.add.emitter(0, 0, 1000);
        this.game.physics.enable(bombEmitter, Phaser.Physics.ARCADE);

        //bombEmitter.bounce.setTo(7.5, 7.5);
        bombEmitter.makeParticles(['star'], 0, 5, true);
        bombEmitter.setRotation(360, 180);
        bombEmitter.setScale(0.1, 5, 0.1, 5, 200, Phaser.Easing.Quintic.Out);
        bombEmitter.mass = 10;
        bombEmitter.setAlpha(1, 0, 300);

        var currentBombo = this.getBombos();
        currentBombo.addChild(bombEmitter);
        currentBombo.anchor.setTo(0.5, 0.5);
        bombStart = false;
        //clean up
        game.time.events.add(400, removeBomb, this);

        function removeBomb() {
            if (this.bombos.length >= 1) {
                bombEmitter.destroy(true, false);
                currentBombo.kill();
            }
        }
    },

    onBombHitPipe: function(emitter, currentPipe){
        if (currentPipe) {
            currentPipe.angle += 45;
            currentPipe.body.mass = 3;
            currentPipe.body.velocity.y = 400;
            currentPipe.body.gravity.setTo(300);
        }
    },

    getBombos: function () {
        var bombosInstance;
        for (var currentBombos = 0; currentBombos < this.bombos.length; currentBombos++) {
            bombosInstance = this.bombos.getAt(currentBombos);
        }
        return bombosInstance;
    }

};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);
game.state.start('main'); 