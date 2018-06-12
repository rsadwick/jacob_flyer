/*
 main.js
 */
require(['/js/libs/phaser.js', 'js/game/Player.js', 'js/game/Level.js', 'js/game/powerup/Powerup.js',
    'js/game/powerup/Shield.js', 'js/game/powerup/Weight.js', 'js/game/powerup/Feather.js',
    'js/game/powerup/Bomb.js', '/js/game/HUD.js', '/js/game/Boss.js', '/js/game/Clown.js', '/js/game/Tweeter.js'],
    function (PhaserLib, Player, Level, Powerup, Shield, Weight, Feather, Bomb, HUD, Boss, Clown, Tweeter) {
        var game_state = {};
        var _game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div', { preload: game_state.preload, create: game_state.create, update: game_state.update });

        var level = new Level();
        var player = new Player();
        var hud = new HUD();
        var shield = new Shield();
        var weight = new Weight();
        var feather = new Feather();
        var boss = null;

        var bomb = new Bomb();
        var powerups = [];
        var currentLevel = 0;
        var settings = null;

        generateBoss();

        powerups.push(shield, weight, feather, bomb);

        //title screen state
        game_state.title = function (_game) {
        };
        game_state.title.prototype = {

            preload: function () {
                _game.load.image("titlescreen", "assets/clown_boss.png");
            },

            create: function () {
                var gameTitle = _game.add.button(0, 0, "titlescreen", this.startup, this);
                gameTitle.anchor.setTo(0.5, 0.5);
            },

            update: function () {
            },

            startup: function () {
                _game.state.start('main');
            }
        }

        //main gameplay state:
        game_state.main = function () {
        };

        game_state.main.prototype = {

            preload: function () {
                level.init(_game, settings, powerups);
                level.preload();

                player.init(_game, level.get_settings());
                player.preload();

                boss.init(_game);
                boss.preload();

                hud.init(_game);
                hud.preload();

                for (var powerup in powerups) {
                    powerups[powerup].init(_game, level, settings);
                    powerups[powerup].preload();
                }
            },

            create: function () {

                level.create(player, hud);

                player.create();

                boss.create();
                boss.set_player(player);

                hud.create();

                for (var powerup in powerups) {
                    powerups[powerup].create();
                }
            },

            update: function () {
                level.update();
                player.update();
                boss.update();

                for (var powerup in powerups) {
                    powerups[powerup].update();
                }
            }
        }

        //add and boot states:
        _game.state.add('main', game_state.main);
        _game.state.add('title', game_state.title);
        _game.state.start('title');

        if (!_game.events) _game.events = {};

        _game.events.onLevelComplete = new Phaser.Signal();
        _game.events.onLevelComplete.add(change_level, this);

        function change_level() {
            level.dispose();
            currentLevel++;
            generateBoss();
            level.set_level(currentLevel);
            _game.state.start('main');

        }

        function generateBoss() {
            switch (currentLevel) {
                case 1:
                    boss = new Clown();
                    break;
                case 0:
                    boss = new Tweeter();
                    break;
            }

            settings = {
                level: [
                    {
                        name: "level 1",
                        background: 'assets/bg_grasslands.png',

                        character: {
                            BOSS: {
                                type: boss,
                                name: "clowner",
                                bossAbilties: {
                                    UP_ATTACK: {
                                        start: 0.10,
                                        end: 0.50,
                                        damage: 1
                                    },

                                    CHARGE_ATTACK: {
                                        start: 0.51,
                                        end: 0.100,
                                        damage: 1,
                                        speed: 1000
                                    }
                                }
                            }
                        },

                        powerUpTypes: {
                            OVERWEIGHT: {
                                start: 0.51,
                                end: 0.90
                            },
                            FEATHERWEIGHT: {
                                start: -0.21,
                                end: -0.40
                            },
                            NORMAL: {
                                velocity: -350,
                                gravity: 1000

                            },
                            SHIELD: {
                                start: 0.0,
                                end: 0.50
                            },
                            BOMBOS: {
                                start: -0.61,
                                end: -0.90
                            }
                        }
                    },
                    {
                        name: "level 2",
                        background: 'assets/bg_shroom.png',

                        character: {
                            BOSS: {
                                type: boss,
                                name: "tweeter",
                                bossAbilties: {
                                    UP_ATTACK: {
                                        start: 0.10,
                                        end: 0.50,
                                        damage: 1
                                    },

                                    CHARGE_ATTACK: {
                                        start: 0.51,
                                        end: 0.100,
                                        damage: 1,
                                        speed: 1000
                                    }
                                }
                            }
                        },

                        powerUpTypes: {
                            OVERWEIGHT: {
                                start: 0.0,
                                end: 0.40
                            },
                            FEATHERWEIGHT: {
                                start: 0.41,
                                end: 0.70
                            },
                            NORMAL: {
                                velocity: -350,
                                gravity: 1000

                            },
                            SHIELD: {
                                start: 0.71,
                                end: 0.99
                            },
                            BOMBOS: {
                                start: -0.41,
                                end: -0.80
                            }
                        }
                    }
                ]
            }
        }
    });