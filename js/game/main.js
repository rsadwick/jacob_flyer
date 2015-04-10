/*
 main.js
 */
require(['/js/libs/phaser.js', 'js/game/Player.js', 'js/game/Level.js', 'js/game/powerup/Powerup.js',
    'js/game/powerup/Shield.js', 'js/game/powerup/Weight.js', 'js/game/powerup/Feather.js',
    'js/game/powerup/Bomb.js', '/js/game/HUD.js', '/js/game/Boss.js', '/js/game/Clown.js'],
    function (PhaserLib, Player, Level, Powerup, Shield, Weight, Feather, Bomb, HUD, Boss, Clown) {
        var game_state = {};
        var _game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div', { preload: game_state.preload, create: game_state.create, update: game_state.update });

        var level = new Level();
        var hud = new HUD();
        var player = new Player();
        var shield = new Shield();
        var weight = new Weight();
        var feather = new Feather();
        var bomb = new Bomb();
        var clown = new Clown();
        var powerups = [];

        powerups.push(shield, weight, feather, bomb);
        console.log(powerups);


        var settings = {
            level : {
                name: "level 1",
                background: 'assets/bg_shroom.png',

                character : {
                    PLAYER: {
                        name: "player"
                    },
                    BOSS: {
                        type: clown,
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

        game_state.main = function () {};

        game_state.main.prototype = {


            preload: function() {
                level.init(_game, settings, powerups);
                level.preload();

                hud.init(_game);
                hud.preload();

                player.init(_game, level.get_settings());
                player.preload();

                clown.init(_game);
                clown.preload();

                for(var powerup in powerups){
                    powerups[powerup].init(_game, level);
                    powerups[powerup].preload();
                }
            },

            create: function() {
                level.create(player, hud);
                hud.create();
                player.create();
                clown.create();
                clown.set_player(player);

                for(var powerup in powerups){
                    powerups[powerup].create();
                }
            },

            update: function() {

                level.update();
                player.update();
                clown.update();

                for(var powerup in powerups){
                    powerups[powerup].update();
                }
            }
        }

        _game.state.add('main', game_state.main);
        _game.state.start('main');
    });