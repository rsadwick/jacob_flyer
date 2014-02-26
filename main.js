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
        this.game.load.image('pipe', 'assets/pipe.png')
    },

    create: function() { 
    	// Fuction called after 'preload' to setup the game

        //display bird:
        this.bird = this.game.add.sprite(100, 245, 'bird');

        this.bird.body.gravity.y = 1000;

        this.bird.animations.add('flying', [0, 1, 2], 10, true);
        this.bird.animations.add('up', [3, 4], 10, true);


        this.space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.space_key.onDown.add(this.jump, this);
        this.bird.animations.play('flying');

        //pipes:
        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');
        this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

        //score:
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);
    },
    
    update: function() {
		// Function called 60 times per second
        //if bird is out of the world, restart game:
        if(this.bird.inWorld == false){
            this.restart_game();
        }

        this.game.physics.overlap(this.bird, this.pipes, this.restart_game, null, this);

        if(this.space_key.isUp && this.bird.body.velocity.y > -250 )
        {
            this.bird.animations.play('down');
        }


    },

    //jump:
    jump: function(){
        this.bird.body.velocity.y = -350;
        this.bird.animations.play('up');

    },

    restart_game: function(){
        this.game.time.events.remove(this.timer);

        this.bird.frame = 6;
        this.bird.animations.stop();
        this.game.time.events.add(Phaser.Timer.SECOND * 2, this.ender, this);

    },

    ender: function(){
        console.log("gibby")
        this.game.state.start('main');

    },

    add_one_pipe: function(x, y){
        var pipe = this.pipes.getFirstDead();
        //position
        pipe.reset(x, y);
        pipe.body.velocity.x = -200;

        //kill pipe off screen:
        pipe.outOfBoundsKill = true;
    },

    add_row_of_pipes: function(){
        var hole = Math.floor(Math.random() * 5) + 1;

        for(var i = 0; i < 8; i++){
            if(i != hole && i != hole + 1){
                this.add_one_pipe(400, i * 60 + 10);
            }
        }
        this.score += 1;
        this.label_score.content = this.score;
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 