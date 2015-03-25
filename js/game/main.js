/*
 main.js
 */
require(['/js/libs/phaser.min.js', 'js/game/Player.js', 'js/game/Level.js'],
    function (PhaserLib, Player, Level) {
        var _game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div', { preload: preload, create: create, update: update });

        var level = new Level();
        var player = new Player();

        function preload() {
            player.init(_game);
            player.preload();
            level.init(_game);
            level.preload();
        }

        function create() {
            player.create();
            level.create();
        }

        function update() {
            player.update();
            level.update();
        }

    });
