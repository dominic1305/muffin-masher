"use strict";

class Card {
	constructor(val, type, colour, img, quantity) {
		this.val = val;
		this.type = type;
		this.colour = colour;
		this.img = img;
		this.quantity = quantity;
		return Object.freeze(this);
	}
	get isValid() {//checks if this card is legal to play
		if (document.querySelector('.QTE') != null && gameRules.stackOn) {//stack on QTE is active
			return String(this.val).includes('draw');
		} else {
			if (this.colour == 'black') return true; //is wild
			if (currentCard.colour == this.colour) return true; //has same colour
			if (currentCard.val == this.val) return true; //has same value
			return false;
		}
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
const gameRules = {
	drawToPlay: false,
	switchHands: false,
	stackOn: false,
};
let currentCard = new Card();
let playerTurn = true;

document.querySelector('.game-start-btn').addEventListener('click', () => {//game start
	document.querySelectorAll('.modal-inputs > p > input').forEach((bin) => {//set rules
		gameRules[bin.id] = bin.checked;
	});
	Object.freeze(gameRules);
	addCardToAi(7);
	addCardToUser(7);
	currentCard = drawCard();
	document.querySelector('.current-card').src = currentCard.img;
	document.querySelector('.wrapper').style.visibility = 'visible';
	document.querySelector('.modal').style.display = 'none';
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

function drawCard() {//pull random card from draw pile
	if (drawPile.length <= 0) drawPile = createDrawPile();
	const cardSelected = drawPile[Math.floor(Math.random() * drawPile.length)];
	drawPile[drawPile.indexOf(cardSelected)] = null;
	drawPile = drawPile.filter(bin => bin != null);
	return cardSelected;
}

function addCardToUser(drawTimes = 1, callBack = false) {//draw card to users hand
	if (!playerTurn) return;
	for (let i = 0; i < drawTimes; i++) {
		if (Number(document.querySelector('.user-hand-counter').innerHTML) >= 124) throw new Error('too many cards');
		const card = drawCard();
		userHand.push(card);
		const cardImg = document.createElement('img');
		cardImg.className = 'user-card';
		cardImg.draggable = false;
		cardImg.addEventListener('click', (e) => {//add interactivity
			if (!card.isValid || !playerTurn) return;
			currentCard = card;
			document.querySelector('.current-card').src = currentCard.img;
			userHand[userHand.indexOf(card)] = null;
			userHand = userHand.filter(bin => bin != null);
			document.querySelector('#user-hand').removeChild(e.target);
			document.querySelector('.user-hand-counter').innerHTML = userHand.length;
			updateHand(document.querySelector('#user-hand'), userHand, false, false);
			moveAssess(false, 'played card');
		});
		document.querySelector('#user-hand').appendChild(cardImg);
		document.querySelector('.user-hand-counter').innerHTML = userHand.length;
	}
	updateHand(document.querySelector('#user-hand'), userHand, false, false);
	if (callBack) moveAssess(false, 'drew card');
}

function addCardToAi(drawTimes = 1) {//draw card to Ai hand
	for (let i = 0; i < drawTimes; i++) {
		if (Number(document.querySelector('.Ai-hand-counter').innerHTML) >= 124) throw new Error('too many cards');
		const card = drawCard();
		AiHand.push(card);
		const cardImg = document.createElement('img');
		cardImg.className = 'Ai-card';
		cardImg.draggable = false;
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

async function moveAssess(Ai, move) {//completes global actions after a move has been done
	if (move == 'played card') document.querySelector('.current-card').style.border = ''; //wild changed
	if (!Ai) {//player makes a move
		if ((currentCard.val == 'reverse' || currentCard.val == 'skip') && move == 'played card') return; //return to previous players turn
		if (currentCard.colour == 'black' && currentCard.type == 'special' && move == 'played card') {//player used a wild
			await runWildPicker().then((response) => {
				currentCard = new Card(currentCard.val, currentCard.type, response, currentCard.img, currentCard.quantity);
				switch (response) {//change border
					case 'red':	document.querySelector('.current-card').style.border = '5px solid rgb(254, 0, 0)'; break;
					case 'green': document.querySelector('.current-card').style.border = '5px solid rgb(1, 186, 3)'; break;
					case 'blue': document.querySelector('.current-card').style.border = '5px solid rgb(3, 90, 226)'; break;
					case 'yellow': document.querySelector('.current-card').style.border = '5px solid rgb(255, 202, 2)'; break;
				}
			}).catch(err => console.error(err));
		}
		if (String(currentCard.val).includes('draw') && move == 'played card') {//player used a draw card
			if (!gameRules.stackOn) return addCardToAi((currentCard.val == 'wild-draw') ? 4 : 2);
		}
		if (move == 'drew card' && gameRules.drawToPlay) {//player picked up a card with draw to play enabled
			while (userHand.filter(bin => bin.isValid).length == 0) addCardToUser(1, false); //keep drawing cards
		}
		setTimeout(() => {playAiMove();}, Math.floor(Math.random() * (500 - 250) + 250)); //play Ai turn
	} else {//Ai makes a move
		if (currentCard.colour == 'black' && currentCard.type == 'special' && move == 'played card') {//Ai used a wild
			const colourToPlay = AiHand.map(bin => bin.colour).filter(bin => bin != 'black').mode();
			currentCard = new Card(currentCard.val, currentCard.type, colourToPlay, currentCard.img, currentCard.quantity);
			switch (colourToPlay) {//change border
				case 'red':	document.querySelector('.current-card').style.border = '5px solid rgb(254, 0, 0)'; break;
				case 'green': document.querySelector('.current-card').style.border = '5px solid rgb(1, 186, 3)'; break;
				case 'blue': document.querySelector('.current-card').style.border = '5px solid rgb(3, 90, 226)'; break;
				case 'yellow': document.querySelector('.current-card').style.border = '5px solid rgb(255, 202, 2)'; break;
			}
		}
		if (String(currentCard.val).includes('draw') && move == 'played card') {//Ai used a draw card
			if (!gameRules.stackOn) {
				addCardToUser((currentCard.val == 'wild-draw') ? 4 : 2, false);
				return setTimeout(() => {playAiMove();}, Math.floor(Math.random() * (500 - 250) + 250)); //play Ai turn
			}
		}
		if ((currentCard.val == 'reverse' || currentCard.val == 'skip') && move == 'played card') {//return to previous players turn
			return setTimeout(() => {playAiMove();}, Math.floor(Math.random() * (500 - 250) + 250)); //play Ai turn
		}
	}
	playerTurn = !playerTurn;
	document.querySelector('.turn-displayer').style.top = (playerTurn) ? '65%' : '34.5%';
}

function playAiMove() {//makes the Ai take their turn
	if (playerTurn) throw new Error('not Ai\'s turn');
	if (AiHand.filter(bin => bin.isValid).length != 0) {//card available to play
		const validCards = AiHand.filter(bin => bin.isValid);
		let cardToPLay = validCards.filter(bin => bin.colour == validCards.map(bin => bin.colour).filter(bin => bin != 'black').mode())[0];
		if (cardToPLay == null) cardToPLay = validCards.filter(bin => bin.colour == 'black')[0]; //use wild
		currentCard = cardToPLay;
		document.querySelector('.current-card').src = currentCard.img;
		AiHand[AiHand.indexOf(cardToPLay)] = null;
		AiHand = AiHand.filter(bin => bin != null);
		document.querySelector('#Ai-hand').removeChild(document.querySelector('#Ai-hand > img'));
		document.querySelector('.Ai-hand-counter').innerHTML = AiHand.length;
		updateHand(document.querySelector('#Ai-hand'), AiHand, true, true);
		moveAssess(true, 'played card');
	} else {//no card to play | pick up
		if (!gameRules.drawToPlay) addCardToAi(1);
		else while (AiHand.filter(bin => bin.isValid).length == 0) addCardToAi(1);
		moveAssess(true, 'drew card');
	}
}

Array.prototype.mode = function () {
    return this.sort((a, b) => this.filter(v => v == a).length - this.filter(v => v == b).length).pop();
}

function runQTE(title = 'demo', expireTime = 1000) {//execute QTE event
	return new Promise((resolve, reject) => {
		if (document.body.querySelector('.QTE') != null) return reject('too many instances');
		document.body.appendChild(document.querySelector('#QTE-template').content.cloneNode(true));
		document.querySelector('.QTE-txt').innerHTML = title;
		let counter = 0;
		const initLength = userHand.length;
		const interval = setInterval(() => {//progress animation
			document.querySelector('.QTE-progress-bar').style.width = `${counter}%`;
			counter++;
			if (counter >= 100 || initLength != userHand.length) {//animation is done | user countered
				document.body.removeChild(document.querySelector('.QTE'));
				clearInterval(interval);
				return resolve('expire complete');
			}
		}, expireTime / 100); //ms per 1%
		document.querySelector('.QTE').addEventListener('click', () => {//decline QTE
			document.body.removeChild(document.querySelector('.QTE'));
			clearInterval(interval);
			return reject(0);
		});
	});
}

function runWildPicker() {//execute wild picker event
	return new Promise((resolve, reject) => {
		if (document.body.querySelector('.wild-picker-backdrop') != null) return reject('too many instances');
		document.body.appendChild(document.querySelector('#wild-picker-template').content.cloneNode(true));
		document.querySelectorAll('.wild-picker-colour').forEach((bin) => {//colour selector interactivity
			bin.addEventListener('click', () => {
				document.body.removeChild(document.querySelector('.wild-picker-backdrop'));
				return resolve(bin.dataset.colour);
			});
		});
	});
}