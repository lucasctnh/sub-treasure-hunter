import Phaser from "phaser"

const color = Phaser.Display.Color

function hex(hexString) {
	if (hexString.length === 9) {
		let tmpAlpha = parseInt(hexString.substr(-2))
		let a = (255 * tmpAlpha) / 100
		hexString = hexString.substr(0, 7)
		const { r, g, b } = color.HexStringToColor(hexString)
		return color.GetColor32(r, g, b, a)
	} else if (hexString.length === 5) {
		let tmpAlpha = parseInt(hexString.substr(-1))
		let a = (255 * tmpAlpha) / 10
		hexString = hexString.substr(0, 4)
		const { r, g, b } = color.HexStringToColor(hexString)
		return color.GetColor32(r, g, b, a)
	}

	const { r, g, b } = color.HexStringToColor(hexString)
	return color.GetColor(r, g, b)
}

function map(value, start1, stop1, start2, stop2) {
	const newval = (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
	return newval
}

export { hex, map }