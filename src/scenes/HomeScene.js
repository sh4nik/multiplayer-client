import Phaser from 'phaser';
import io from 'socket.io-client';

export default class HomeScene extends Phaser.Scene {

    constructor() {
        super('home');
        this.hero;
        this.playerId;
        this.players = {};
        this.serverCommand;
    }

    debug(scene, layer) {
        const debugGraphics = scene.add.graphics().setAlpha(0.7);
        layer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        })
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    drawPlayer(player, scene, wallsLayer) {
        const hero = scene.physics.add.sprite(player.posX, player.posY, 'hero', 'walk-down-3.png');
        hero.playerId = player.playerId;
        hero.setSize(hero.width * 0.5, hero.height * 0.8);
        scene.physics.add.collider(hero, wallsLayer);
        return hero;
    }

    create() {
        const socket = io('http://localhost:8081');

        this.players = this.physics.add.group();

        const map = this.make.tilemap({ key: 'dungeon' });
        const tileset = map.addTilesetImage('dungeon', 'tiles', 16, 16, 1, 2);

        map.createStaticLayer('Ground', tileset);
        const wallsLayer = map.createStaticLayer('Walls', tileset);
        wallsLayer.setCollisionByProperty({ collides: true });
        // this.debug(this, wallsLayer);

        // const joyStick = this.plugins.get('virtualJoystick').add(this, {
        //     x: 100,
        //     y: 200,
        //     radius: 20,
        //     base: this.add.image(10, 10),
        //     thumb: this.add.image(20, 20, 'joystick'),
        //     dir: '4dir',
        //     // forceMin: 16,
        //     // fixed: true,
        //     enable: true
        // });

        // this.cursors = joyStick.createCursorKeys();

        this.anims.create({
            key: 'hero-idle-down',
            frames: [{ key: 'hero', frame: 'walk-down-3.png' }],
        });

        this.anims.create({
            key: 'hero-idle-up',
            frames: [{ key: 'hero', frame: 'walk-up-3.png' }],
        });

        this.anims.create({
            key: 'hero-idle-side',
            frames: [{ key: 'hero', frame: 'walk-side-3.png' }],
        });

        this.anims.create({
            key: 'hero-run-down',
            frames: this.anims.generateFrameNames('hero', {
                start: 1,
                end: 8,
                prefix: 'run-down-',
                suffix: '.png',
            }),
            repeat: -1,
            frameRate: 15,
        });

        this.anims.create({
            key: 'hero-run-up',
            frames: this.anims.generateFrameNames('hero', {
                start: 1,
                end: 8,
                prefix: 'run-up-',
                suffix: '.png',
            }),
            repeat: -1,
            frameRate: 15,
        });

        this.anims.create({
            key: 'hero-run-side',
            frames: this.anims.generateFrameNames('hero', {
                start: 1,
                end: 8,
                prefix: 'run-side-',
                suffix: '.png',
            }),
            repeat: -1,
            frameRate: 15,
        });

        socket.on('currentPlayers', (players) => {
            this.players.clear(true);
            Object.keys(players).forEach((id) => {
                const playerSprite = this.drawPlayer(players[id], this, wallsLayer);
                this.players.add(playerSprite);
                if (players[id].playerId === socket.id) {
                    this.cameras.main.startFollow(playerSprite, true);
                }
            });
        });

        socket.on('newPlayer', (player) => {
            const playerSprite = this.drawPlayer(player, this, wallsLayer);
            this.players.add(playerSprite);
        });

        socket.on('removePlayer', (playerId) => {
            this.players.getChildren().forEach((player) => {
                if (playerId === player.playerId) {
                    player.destroy();
                }
            });
        });

        socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((serverPlayerId) => {
                this.players.getChildren().forEach((clientPlayer) => {
                    if (serverPlayerId === clientPlayer.playerId) {
                        const { speed, posX, posY, anim, scaleX, offsetX } = players[serverPlayerId];
                        clientPlayer.setPosition(posX, posY);
                        clientPlayer.anims.play(anim, true);
                        clientPlayer.scaleX = scaleX;
                        clientPlayer.body.offset.x = offsetX;
                    }
                });
            });
        });

        const upKey = this.cursors.up;
        upKey.on('down', () => { socket.emit('input', { key: 'up', isDown: true }) });
        upKey.on('up', () => { socket.emit('input', { key: 'up', isDown: false }) });

        const rightKey = this.cursors.right;
        rightKey.on('down', () => { socket.emit('input', { key: 'right', isDown: true }) });
        rightKey.on('up', () => { socket.emit('input', { key: 'right', isDown: false }) });

        const downKey = this.cursors.down;
        downKey.on('down', () => { socket.emit('input', { key: 'down', isDown: true }) });
        downKey.on('up', () => { socket.emit('input', { key: 'down', isDown: false }) });

        const leftKey = this.cursors.left;
        leftKey.on('down', () => { socket.emit('input', { key: 'left', isDown: true }) });
        leftKey.on('up', () => { socket.emit('input', { key: 'left', isDown: false }) });
    }
}
