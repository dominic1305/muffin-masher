"use strict";

class Card {
	constructor(val, type, colour, img, quantity) {
		this.val = val;
		this.type = type;
		this.colour = colour;
		this.img = img;
		this.quantity = quantity;
	}
}

const cards = Object.freeze({
	red: [
		new Card(0, 'number', 'red', './img/red/zero.png', 1),
		new Card(1, 'number', 'red', './img/red/one.png', 2),
		new Card(2, 'number', 'red', './img/red/two.png', 2),
		new Card(3, 'number', 'red', './img/red/three.png', 2),
		new Card(4, 'number', 'red', './img/red/four.png', 2),
		new Card(5, 'number', 'red', './img/red/five.png', 2),
		new Card(6, 'number', 'red', './img/red/six.png', 2),
		new Card(7, 'number', 'red', './img/red/seven.png', 2),
		new Card(8, 'number', 'red', './img/red/eight.png', 2),
		new Card(9, 'number', 'red', './img/red/nine.png', 2),
		new Card('draw', 'special', 'red', './img/red/draw.png', 2),
		new Card('reverse', 'special', 'red', './img/red/reverse.png', 2),
		new Card('skip', 'special', 'red', './img/red/skip.png', 2),
	],
	green: [
		new Card(0, 'number', 'green', './img/green/zero.png', 1),
		new Card(1, 'number', 'green', './img/green/one.png', 2),
		new Card(2, 'number', 'green', './img/green/two.png', 2),
		new Card(3, 'number', 'green', './img/green/three.png', 2),
		new Card(4, 'number', 'green', './img/green/four.png', 2),
		new Card(5, 'number', 'green', './img/green/five.png', 2),
		new Card(6, 'number', 'green', './img/green/six.png', 2),
		new Card(7, 'number', 'green', './img/green/seven.png', 2),
		new Card(8, 'number', 'green', './img/green/eight.png', 2),
		new Card(9, 'number', 'green', './img/green/nine.png', 2),
		new Card('draw', 'special', 'green', './img/green/draw.png', 2),
		new Card('reverse', 'special', 'green', './img/green/reverse.png', 2),
		new Card('skip', 'special', 'green', './img/green/skip.png', 2),
	],
	blue: [
		new Card(0, 'number', 'blue', './img/blue/zero.png', 1),
		new Card(1, 'number', 'blue', './img/blue/one.png', 2),
		new Card(2, 'number', 'blue', './img/blue/two.png', 2),
		new Card(3, 'number', 'blue', './img/blue/three.png', 2),
		new Card(4, 'number', 'blue', './img/blue/four.png', 2),
		new Card(5, 'number', 'blue', './img/blue/five.png', 2),
		new Card(6, 'number', 'blue', './img/blue/six.png', 2),
		new Card(7, 'number', 'blue', './img/blue/seven.png', 2),
		new Card(8, 'number', 'blue', './img/blue/eight.png', 2),
		new Card(9, 'number', 'blue', './img/blue/nine.png', 2),
		new Card('draw', 'special', 'blue', './img/blue/draw.png', 2),
		new Card('reverse', 'special', 'blue', './img/blue/reverse.png', 2),
		new Card('skip', 'special', 'blue', './img/blue/skip.png', 2),
	],
	yellow: [
		new Card(0, 'number', 'yellow', './img/yellow/zero.png', 1),
		new Card(1, 'number', 'yellow', './img/yellow/one.png', 2),
		new Card(2, 'number', 'yellow', './img/yellow/two.png', 2),
		new Card(3, 'number', 'yellow', './img/yellow/three.png', 2),
		new Card(4, 'number', 'yellow', './img/yellow/four.png', 2),
		new Card(5, 'number', 'yellow', './img/yellow/five.png', 2),
		new Card(6, 'number', 'yellow', './img/yellow/six.png', 2),
		new Card(7, 'number', 'yellow', './img/yellow/seven.png', 2),
		new Card(8, 'number', 'yellow', './img/yellow/eight.png', 2),
		new Card(9, 'number', 'yellow', './img/yellow/nine.png', 2),
		new Card('draw', 'special', 'yellow', './img/yellow/draw.png', 2),
		new Card('reverse', 'special', 'yellow', './img/yellow/reverse.png', 2),
		new Card('skip', 'special', 'yellow', './img/yellow/skip.png', 2),
	],
	special: [
		new Card('wild', 'special', 'black', './img/wild.png', 4),
		new Card('wild-draw', 'special', 'black', './img/wild-draw.png', 4),
	],
});

function createDrawPile() {//generate draw pile
	const arr = [];
	for (let i1 = 0; i1 < Object.keys(cards).length; i1++) {//enter first layer
		for (let i2 = 0;  i2 < Object.values(cards)[i1].length; i2++) {//enter second layer
			for (let i3 = 0; i3 < Object.values(cards)[i1][i2].quantity; i3++) {//loop quantity
				arr.push(Object.values(cards)[i1][i2]);
			}
		}
	}
	return arr.sort(() => (Math.floor(Math.random() * 2) == 0) ? 1 : -1); //shuffle array
}

function getCardPosXArr(number = 1, spacing = 3) {//returns card position array
	const startPos = -((number - 1) / 2) * spacing;
	const arr = [];
	for (let i = 0; i < number; i++) {//calc positions
		arr[i] = (startPos + (i * spacing)) + 50;
	}
	return arr;
}

/* hand sorter demo (jsfiddle)
	let a = [
		{val: 5, colour: 'red'},
		{val: 4, colour: 'red'},
		{val: 3, colour: 'red'},
		{val: 2, colour: 'red'},
		{val: 1, colour: 'red'},
		{val: 5, colour: 'green'},
		{val: 3, colour: 'green'},
		{val: 1, colour: 'green'},
		{val: 2, colour: 'green'},
		{val: 4, colour: 'green'},
		{val: 1, colour: 'blue'},
		{val: 2, colour: 'blue'},
		{val: 3, colour: 'blue'},
		{val: 4, colour: 'blue'},
		{val: 5, colour: 'blue'},
	];

	a = a.sort((a, b) => {//sort number
		return b.val - a.val;
	}).sort((a, b) => {//sort colour
		return (a.colour > b.colour) ? 1 : -1;
	});

	console.log(a);
*/