import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }

    preload() {
        this.load.image('tiles', 'tiles/dungeon-extruded.png');
        this.load.image('joystick', 'tiles/joystick-lg.png');
        this.load.tilemapTiledJSON('dungeon', 'tiles/dungeon-01.json');
        this.load.atlas('hero', 'character/fauna.png', 'character/fauna.json');
    }

    create() {
        this.scene.start('home');
    }
}
