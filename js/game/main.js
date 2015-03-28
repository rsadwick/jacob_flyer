/*
 main.js
 */
require(['/js/libs/phaser.min.js', 'js/game/Player.js', 'js/game/Level.js', 'js/game/powerup/Powerup.js', 'js/game/powerup/Shield.js'],
    function (PhaserLib, Player, Level, Powerup, Shield) {
        var _game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div', { preload: preload, create: create, update: update });

        var settings = {
            level : {
                name: "level 1",
                background: 'assets/bg_desert.png',

                character : {
                    PLAYER: {
                        name: "player"
                    },
                    BOSS: {
                        name: "boss",
                        bossAbilties: {
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
                        }
                    }
                },

                powerUpTypes : {
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
                        chance: 0.9,
                        blendMode: Phaser.blendModes.ADD
                    },
                    BOMBOS: {
                        velocity: -350,
                        gravity: 2500,
                        creation: 5,
                        duration: 7,
                        chance: 0.9,
                        tint: 0x999999,
                        graphic: 'assets/bomb.png'
                    }

                }
            }
        }

        var level = new Level();
        var player = new Player();
        var shield = new Shield();
        var powerups = [];
        powerups.push(shield);
        console.log(powerups)


        function preload() {
            level.init(_game, settings, powerups);
            level.preload();

            player.init(_game, level.get_settings());
            player.preload();

            for(var powerup in powerups){
                powerups[powerup].init(_game);
                powerups[powerup].preload();
            }
        }

        function create() {
            level.create(player);
            player.create();

            for(var powerup in powerups){
                powerups[powerup].create();
            }
        }

        function update() {
            player.update();
            level.update();

            for(var powerup in powerups){
                powerups[powerup].update();
            }
        }

    });