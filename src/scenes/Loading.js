import Phaser from "phaser"

import * as utils from '../utils'

import submarine from "../assets/submarine.png"
import shark from "../assets/shark.png"
import kingcrab from "../assets/kingcrab.png"
import chest from "../assets/chest.png"

let gradients = ['#4A9BED', '#4693E0', '#3E82C7', '#3269A1', '#1E4061']

let title,
	instruction,
	sub,
	randomDir,
	cursors

export default class Loading extends Phaser.Scene {
	constructor() { super('Loading') }

	preload() {
		this.load.image("submarine", submarine)
		this.load.image("shark", shark)
		this.load.image("kingcrab", kingcrab)
		this.load.image("chest", chest)
	}

	create() {
		cursors = this.input.keyboard.createCursorKeys()

		title = this.add.text(300, 100, 'S.U.B', { fontSize: '52px', fill: '#111' })
		instruction = this.add.text(190, 225,
			'Recover the treasure! \n\n\tUse the arrow keys',
			{ fontSize: '32px', fill: '#111' })

		let water = new Phaser.Geom.Rectangle(0, 450, 800, 150)
		let graphicsGradient = this.add.graphics()
		let waterGradient = []
		for(let i = 5; i >= 1; i--) {
			let idx = (i-5)*-1
			let h = 450/5
			waterGradient[idx] = new Phaser.Geom.Rectangle(0, 450+(h*idx), 800, h)
		}
		waterGradient.map((rect,idx) => {
			graphicsGradient.setDepth(-idx)
			graphicsGradient.fillStyle(utils.hex(gradients[idx]), 1)
			graphicsGradient.fillRectShape(rect)
		})

		sub = this.physics.add.image(Math.random()*800, 450, 'submarine')
		let velocityDirection = [-1, 1]
		randomDir = Math.floor(Math.random() * velocityDirection.length)
		if(velocityDirection[randomDir] == -1) sub.setFlipX(true)
		else sub.setFlipX(false)
		sub.setVelocityX(velocityDirection[randomDir]*Math.random()*200)
		sub.body.allowGravity = false
		sub.setOrigin(0, .5)

		let waterGraphics = this.add.graphics()
		waterGraphics.fillStyle(utils.hex('#2a70f5'), 0.5)
		waterGraphics.fillRectShape(water)
		waterGraphics.setDepth(2)
	}

	update() {
		if(sub.x > 800+sub.width) sub.x = 0-sub.width
		if(sub.x < 0-sub.width) sub.x = 800+sub.width

		if(cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) this.scene.start('Main')
	}
}