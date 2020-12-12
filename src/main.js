import Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import HomeScene from './scenes/HomeScene'
import Preloader from './scenes/Preloader';

const game = new Phaser.Game({
    width: 400,
    height: 250,
    type: Phaser.AUTO,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [Preloader, HomeScene],
    scale: {
        zoom: 2,
    },
    plugins: {
        global: [
            {
                key: 'virtualJoystick',
                plugin: VirtualJoystickPlugin,
                start: true
            },
        ]
    }
});