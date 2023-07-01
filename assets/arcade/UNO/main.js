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

let drawPile = createDrawPile();
let userHand = [];
let AiHand = [];

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

function cardSearch(handArr, val, type, colour) {//find card in array
	return handArr.filter((bin) => {//filter colour
		return bin.colour == colour;
	}).filter((bin) => {//filter value
		return bin.val == val;
	}).filter((bin) => {//filter type
		return bin.type == type;
	})[0];
}

function drawCard() {//pull random card from draw pile
	if (drawPile.length <= 0) drawPile = createDrawPile();
	const cardSelected = drawPile[Math.floor(Math.random() * drawPile.length)];
	drawPile[drawPile.indexOf(cardSelected)] = null;
	drawPile = drawPile.filter(bin => bin != null);
	return cardSelected;
}

function addCardToUser(drawTimes = 1) {//draw card to users hand
	for (let i = 0; i < drawTimes; i++) {
		if (Number(document.querySelector('.user-hand-counter').innerHTML) >= 124) throw new Error('too many cards');
		const card = drawCard();
		userHand.push(card);
		const cardImg = document.createElement('img');
		cardImg.className = 'user-card';
		cardImg.draggable = false;
		cardImg.addEventListener('click', (e) => {//add interactivity
			userHand[userHand.indexOf(card)] = null;
			userHand = userHand.filter(bin => bin != null);
			document.querySelector('#user-hand').removeChild(e.target);
			document.querySelector('.user-hand-counter').innerHTML = userHand.length;
			updateHand(document.querySelector('#user-hand'), userHand, false, false);
		}, {once: true});
		document.querySelector('#user-hand').appendChild(cardImg);
		document.querySelector('.user-hand-counter').innerHTML = userHand.length;
	}
	updateHand(document.querySelector('#user-hand'), userHand, false);
}

function addCardToAi(drawTimes = 1) {//draw card to Ai hand
	for (let i = 0; i < drawTimes; i++) {
		if (Number(document.querySelector('.Ai-hand-counter').innerHTML) >= 124) throw new Error('too many cards');
		const card = drawCard();
		AiHand.push(card);
		const cardImg = document.createElement('img');
		cardImg.className = 'Ai-card';
		cardImg.draggable = false;
		cardImg.addEventListener('click', (e) => {//add interactivity
			AiHand[AiHand.indexOf(card)] = null;
			AiHand = AiHand.filter(bin => bin != null);
			document.querySelector('#Ai-hand').removeChild(e.target);
			document.querySelector('.Ai-hand-counter').innerHTML = AiHand.length;
			updateHand(document.querySelector('#Ai-hand'), AiHand, true, true);
		}, {once: true});
		document.querySelector('#Ai-hand').appendChild(cardImg);
		document.querySelector('.Ai-hand-counter').innerHTML = AiHand.length;
	}
	updateHand(document.querySelector('#Ai-hand'), AiHand, true, true);
}

function updateHand(handElement, handArr, up = false, imgOverwrite = false) {//display cards to hand (user | Ai)
	for (let i1 = 0; i1 < handArr.length; i1 += 31) {
		const chunk = handArr.slice(i1, i1 + 31);
		const posArr = getCardPosXArr(chunk.length, [9, 6, 3][Math.ceil(chunk.length / 8) - 1]);
		[...handElement.querySelectorAll('img')].slice(i1, i1 + 31).forEach((bin, i2) => {
			bin.dataset.colour = chunk[i2].colour;
			bin.dataset.value = chunk[i2].val;
			bin.dataset.type = chunk[i2].type;
			bin.src = (!imgOverwrite) ? chunk[i2].img : './img/card-back.png';
			bin.style.left = `${posArr[i2]}%`;
			bin.style.top = `${(!up) ? '' : '-'}${Math.ceil(i1 / 31) * 30}%`;
		});
	}
}