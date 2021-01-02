import Phaser from "phaser"
import Perlin from 'phaser3-rex-plugins/plugins/perlin.js'

import * as utils from '../utils'

let gradients = ['#4A9BED', '#4693E0', '#3E82C7', '#3269A1', '#1E4061']

let cursors,
	player,
	sharks,
	kingC,
	chest,
	score = 0,
	scoreText,
	screenText,
	noise,
	noiseWalker = 0,
	floorBound,
	sharkSpeed = [40, -90],
	kingCSpeed = 300,
	gameOver = false

function hitEnemy(player, enemy) {
	this.physics.pause()
	player.setTint(utils.hex('#ff4949'))
	gameOver = true
}

function collectChest(player, chest) {
	chest.body.x = player.body.x
	chest.body.y = player.body.y

	if(chest.body.y <= 150) {
		score += 10
		scoreText.setText('Score: ' + score)

		chest.body.y = 569
		chest.body.x = Math.random()*760

		let tmpArr = sharkSpeed.map(spd => spd * 1.1 )
		sharkSpeed = tmpArr
		kingCSpeed *= 1.1
	}
}

function reset(context) {
	context.resume()
	player.clearTint()

	player.x = 100
	player.y = 170
	player.setVelocity(0)
	sharks.children.iterate((child, i) => {
		child.x = Math.random()*800
		child.setVelocity(0)
		let nHits = score/10
		if(nHits) sharkSpeed[i] /= nHits*1.1
		if(i == 0 && sharkSpeed[i] < 40) sharkSpeed[i] = 40
		if(i == 1 && sharkSpeed[i] > -90) sharkSpeed[i] = -90
	})
	kingC.x = Math.random()*800
	kingC.y = 600
	kingCSpeed = 300
	chest.y = 584
	chest.x = Math.random()*760

	score = 0
	scoreText.setText('Score: ' + score)
}

export default class Main extends Phaser.Scene {
	constructor() { super('Main') }

	create() {
		noise = new Perlin(Math.random())

		player = this.physics.add.image(100, 170, 'submarine')
		player.body.setCollideWorldBounds(true, .4, .2, true)
		player.setOrigin(.5, 1)

		sharks = this.physics.add.group({
			allowGravity: false,
		})
		sharks.create(Math.random()*800, 260, 'shark')
		sharks.create(Math.random()*800, 380, 'shark')

		kingC = this.physics.add.image(Math.random()*800, 600, 'kingcrab')
		kingC.setOrigin(.5, 1)
		kingC.setDepth(1)

		let graphicsGradient = this.add.graphics()
		let waterGradient = []
		for(let i = 5; i >= 1; i--) {
			let idx = (i-5)*-1
			let h = 450/5
			waterGradient[idx] = new Phaser.Geom.Rectangle(0, 150+(h*idx), 800, h)
		}
		waterGradient.map((rect,idx) => {
			graphicsGradient.setDepth(-idx)
			graphicsGradient.fillStyle(utils.hex(gradients[idx]), 1)
			graphicsGradient.fillRectShape(rect)
		})

		let floorGraphics = this.add.graphics()
		let floorLine = new Phaser.Geom.Line(0, 150, 800, 150)
		floorGraphics.strokeLineShape(floorLine)
		floorGraphics.generateTexture('floorBound', 800, 1)
		floorGraphics.setDepth(2)

		floorBound = this.physics.add.staticImage(400, 600, 'floorBound')
		// floorBound = this.add.staticImage(0, 600, 'floorBound')
		// this.physics.add.existing(floorBound, true)

		let waterGraphics = this.add.graphics()
		let water = new Phaser.Geom.Rectangle(0, 150, 800, 450)
		waterGraphics.fillStyle(utils.hex('#2a70f5'), 0.5)
		waterGraphics.fillRectShape(water)
		waterGraphics.setDepth(5)

		chest = this.physics.add.image(Math.random()*760, 584, 'chest')
		chest.body.setAllowGravity(false)

		cursors = this.input.keyboard.createCursorKeys()

		this.physics.add.collider(player, sharks, hitEnemy, null, this)
		this.physics.add.collider(player, kingC, hitEnemy, null, this)
		this.physics.add.overlap(player, chest, collectChest, null, this)

		scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' })
		screenText = this.add.text(200, 170, 'Click to play again', { fontSize: '32px', fill: '#000' })
		screenText.setVisible(false)
	}

	update(time, delta) {
		if(gameOver) {
			screenText.setVisible(true)
			this.input.on('pointerdown', () => {
				if(gameOver) { // For some reason the event is triggering even when the first if dont pass
					reset(this.physics)
					screenText.setVisible(false)
					gameOver = false
				}
			})
			return
		}

		player.setAcceleration(0)
		if(player.body.acceleration.x < 0) player.setAccelerationX(0.5*player.body.velocity.x)
		else player.setAccelerationX(-0.5*player.body.velocity.x)

		let playerUnderwaterPercent = (player.y-(150+(0.6*player.height)))/450
		let buoyancy = -400
		let playerBuoyancy = playerUnderwaterPercent * buoyancy

		if(player.y < (150+(0.6*player.height))-(0.4*player.height)) player.setGravityY(400)
		if(player.y >= (150+(0.6*player.height))-(0.4*player.height)) {
			player.setGravityY(buoyancy + playerBuoyancy)
			let deceleration = -1*(1.5+playerUnderwaterPercent)*player.body.velocity.y
			if(Math.abs(deceleration) < 3) {
				if(deceleration < 0) player.setAccelerationY(3)
				if(deceleration > 0) player.setAccelerationY(-3)
			}
			else player.setAccelerationY(deceleration)
		}

		if(cursors.up.isDown) {
			player.setAccelerationY(-300)
		}
		if (cursors.down.isDown) {
			player.setAccelerationY(300)
		}

		let resultingV = 300
		let componentV = Math.sqrt((resultingV**2)/2)

		if(cursors.left.isDown) {
			player.setAccelerationX(-300)
			player.setFlipX(true)
		}
		if(cursors.right.isDown) {
			player.setAccelerationX(300)
			player.setFlipX(false)
		}

		this.physics.world.on('worldbounds', (body, up, down, left, right) => {
			if(left) player.setFlipX(false)
			if(right) player.setFlipX(true)
		})

		this.input.keyboard.on('keyup_UP', (event) => {
			player.setAccelerationY(0)
		})
		this.input.keyboard.on('keyup-DOWN', (event) => {
			player.setAccelerationY(0)
		})
		this.input.keyboard.on('keyup-LEFT', (event) => {
			player.setAccelerationX(0)
		})
		this.input.keyboard.on('keyup-RIGHT', (event) => {
			player.setAccelerationX(0)
		})
		this.input.keyboard.on('keydown-LEFT', (event) => {
			if(player.body.velocity.x > 0) player.setVelocityX(-0.3*player.body.velocity.x)
		})
		this.input.keyboard.on('keydown-RIGHT', (event) => {
			if(player.body.velocity.x < 0) player.setVelocityX(-0.3*player.body.velocity.x)
		})

		sharks.children.iterate((child, i) => {
			child.setOrigin(0, .5)
			child.setVelocityX(sharkSpeed[i])

			child.body.velocity.x >= 0
				? (child.setFlipX(true) && child.x > 800
					? child.x = 0-child.width
					: null)
				: null

			child.body.velocity.x <= 0
				? (child.setFlipX(false) && (child.x+child.width) < 0
					? child.x = 800+child.width
					: null)
				: null
		})

		this.physics.add.collider(kingC, floorBound)

		noiseWalker += 0.01
		kingC.setVelocityX(utils.map(noise.simplex2(noiseWalker, noiseWalker), -1, 1, -kingCSpeed, kingCSpeed))
		if(kingC.x > 800+kingC.body.halfWidth) kingC.x = 0-kingC.body.halfWidth
		if(kingC.x < 0-kingC.body.halfWidth) kingC.x = 800+kingC.body.halfWidth
	}
}