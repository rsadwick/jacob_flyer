// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};

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
    },

    create: function() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    	this.player_hit_wall = false;
        this.player_powered = false;
        this.game.input.keyboard.disabled = false
    	// Fuction called after 'preload' to setup the game

        //display bird:
        this.bird = this.game.add.sprite(100, 245, 'bird');
        this.game.physics.enable( this.bird, Phaser.Physics.ARCADE);
        this.bird.body.gravity.y = 1000;
        this.bird.body.bounce.x = 0.9;
        this.bird.body.bounce.y = 0.9;

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

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ff9900" };
        this.label_score = this.game.add.text(20, 20, "0", style);

        //power up
        //stars:
        this.powerups = this.game.add.group();
        this.powerups.enableBody = true;
        this.powerups.physicsBodyType = Phaser.Physics.ARCADE;
        this.powerups.createMultiple(20, 'star');
        this.powerup_timer = this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.add_powerup, this);
    },
    
    update: function() {
		// Function called 60 times per second
        //if bird is out of the world, restart game:
        if(this.bird.inWorld == false){
            this.restart_game();
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
    },

    render: function(){
       // this.game.debug.renderSpriteBounds(this.bird);
    },


    //jump:
    jump: function(){

        this.bird.body.velocity.y = -350;
        if(this.player_powered)
        {
            this.bird.body.gravity.y = 2500;
        }

        this.bird.animations.play('up');
    },

    on_hit: function(){
        if(!this.player_hit_wall)
        {
            this.bird.body.velocity.x =  -300;
            this.game.input.keyboard.disabled = true;
            this.bird.animations.stop();
            this.bird.frame = 6;
            this.player_hit_wall = true;
            this.game.stage.backgroundColor = '#ff0000';
            this.death_timer = this.game.time.events.add(Phaser.Timer.SECOND * 2, this.restart_game, this);
        }
    },

    collect_powerup: function(player, star)
    {
        this.game.physics.enable( star, Phaser.Physics.ARCADE);
        star.kill();
        this.player_powered = true;
        this.bird.body.velocity.y += 10;
    },

    restart_game: function(){
        this.game.time.events.remove(this.timer);
        this.game.time.events.remove(this.death_timer);
        this.game.time.events.remove(this.powerup_timer);
        this.game.state.start('main');
    },

    add_one_pipe: function(x, y){
        var pipe = this.pipes.getFirstDead();
        console.log(pipe)
        if(pipe){
            pipe.reset(x, y);
            pipe.body.velocity.x = -200;
            pipe.body.bounce.x = 1;
            pipe.body.bounce.y = 1;
        }
    },

    add_row_of_pipes: function(){
        var hole = Math.floor(Math.random() * 5) - 1;

        for(var i = 0; i < 8; i++){
            if(i != hole && i != hole + 1 && i != hole + 2 && i != hole + 3){
                this.add_one_pipe(400, i * 60 + 10);
            }
        }
        if(!this.player_hit_wall){
            this.score += 1;
            this.label_score.text = this.score;
        }
    },

    add_powerup: function(){
        var star = this.powerups.getFirstDead();
        //this.game.physics.enable( star, Phaser.Physics.ARCADE);
        star.reset(this.game.width, 100);
        star.body.gravity.y = 4;
        star.body.velocity.x = -200;
        star.body.velocity.y = 25;
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
        star.body.bounce.x = 1.7 + Math.random() * 0.2;
        star.outOfBoundsKill = true;
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 