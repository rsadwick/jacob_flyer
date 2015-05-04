game_state.title = function (_game) {
};

game_state.title.prototype = {


    preload: function () {
        this._game.load.image("titlescreen", "assets/titlescreen.png");
    },

    create: function () {
        var gameTitle = _game.add.sprite(160, 160, "titlescreen");
        gameTitle.anchor.setTo(0.5, 0.5);
    },

    update: function () {

    }
}