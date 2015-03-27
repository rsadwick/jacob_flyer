/*
 main.js
 */
require(['/js/libs/phaser.min.js', 'js/game/Player.js', 'js/game/Level.js', 'js/game/powerup/Powerup.js', 'js/game/powerup/Shield.js'],
    function (PhaserLib, Player, Level, Powerup, Shield) {
        var _game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div', { preload: preload, create: create, update: update });

        var level = new Level();
        var player = new Player();
        var shield = new Shield();
        shield.add();
        shield.on_collect();
        console.log(shield instanceof Powerup);

        function preload() {
            level.init(_game);
            level.preload();

            player.init(_game);
            player.preload();
        }

        function create() {
            level.create(player);
            player.create();
        }

        function update() {
            player.update();
            level.update();
        }

    });