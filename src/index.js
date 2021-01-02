import Phaser from "phaser"
import PerlinPlugin from 'phaser3-rex-plugins/plugins/perlin-plugin.js';

import * as utils from './utils'

import submarine from "./assets/submarine.png"
import shark from "./assets/shark.png"
import kingcrab from "./assets/kingcrab.png"

import Main from './scenes/Main'
import Loading from './scenes/Loading'

const config = {
  	type: Phaser.AUTO,
  	parent: "sub",
  	width: 800,
	height: 600,
	backgroundColor: utils.hex('#87CEEB'),
	// fps: {
	// 	target: 60,
	// 	min: 30,
	// 	forceSetTimeOut: true
	// },
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 400 },
			debug: false
		}
	},
  	scene: [ Loading, Main ]
}

const game = new Phaser.Game(config)