"use strict";

const cards = {
	hearts: [
		{img: 'img/heartA.png', value: 1, altImg: 'img/alt-heartA.png', suit: 'hearts'},
		{img: 'img/heart2.png', value: 2, suit: 'hearts'},
		{img: 'img/heart3.png', value: 3, suit: 'hearts'},
		{img: 'img/heart4.png', value: 4, suit: 'hearts'},
		{img: 'img/heart5.png', value: 5, suit: 'hearts'},
		{img: 'img/heart6.png', value: 6, suit: 'hearts'},
		{img: 'img/heart7.png', value: 7, suit: 'hearts'},
		{img: 'img/heart8.png', value: 8, suit: 'hearts'},
		{img: 'img/heart9.png', value: 9, suit: 'hearts'},
		{img: 'img/heart10.png', value: 10, suit: 'hearts'},
		{img: 'img/heartJ.png', value: 10, suit: 'hearts'},
		{img: 'img/heartQ.png', value: 10, suit: 'hearts'},
		{img: 'img/heartK.png', value: 10, suit: 'hearts'}
	],
	clubs: [
		{img: 'img/clubA.png', value: 1, altImg: 'img/alt-clubA.png', suit: 'clubs'},
		{img: 'img/club2.png', value: 2, suit: 'clubs'},
		{img: 'img/club3.png', value: 3, suit: 'clubs'},
		{img: 'img/club4.png', value: 4, suit: 'clubs'},
		{img: 'img/club5.png', value: 5, suit: 'clubs'},
		{img: 'img/club6.png', value: 6, suit: 'clubs'},
		{img: 'img/club7.png', value: 7, suit: 'clubs'},
		{img: 'img/club8.png', value: 8, suit: 'clubs'},
		{img: 'img/club9.png', value: 9, suit: 'clubs'},
		{img: 'img/club10.png', value: 10, suit: 'clubs'},
		{img: 'img/clubJ.png', value: 10, suit: 'clubs'},
		{img: 'img/clubQ.png', value: 10, suit: 'clubs'},
		{img: 'img/clubK.png', value: 10, suit: 'clubs'}
	],
	diamonds: [
		{img: 'img/diamondA.png', value: 1, altImg: 'img/alt-diamondA.png', suit: 'diamonds'},
		{img: 'img/diamond2.png', value: 2, suit: 'diamonds'},
		{img: 'img/diamond3.png', value: 3, suit: 'diamonds'},
		{img: 'img/diamond4.png', value: 4, suit: 'diamonds'},
		{img: 'img/diamond5.png', value: 5, suit: 'diamonds'},
		{img: 'img/diamond6.png', value: 6, suit: 'diamonds'},
		{img: 'img/diamond7.png', value: 7, suit: 'diamonds'},
		{img: 'img/diamond8.png', value: 8, suit: 'diamonds'},
		{img: 'img/diamond9.png', value: 9, suit: 'diamonds'},
		{img: 'img/diamond10.png', value: 10, suit: 'diamonds'},
		{img: 'img/diamondJ.png', value: 10, suit: 'diamonds'},
		{img: 'img/diamondQ.png', value: 10, suit: 'diamonds'},
		{img: 'img/diamondK.png', value: 10, suit: 'diamonds'}
	],
	spades: [
		{img: 'img/spadeA.png', value: 1, altImg: 'img/alt-spadeA.png', suit: 'spades'},
		{img: 'img/spade2.png', value: 2, suit: 'spades'},
		{img: 'img/spade3.png', value: 3, suit: 'spades'},
		{img: 'img/spade4.png', value: 4, suit: 'spades'},
		{img: 'img/spade5.png', value: 5, suit: 'spades'},
		{img: 'img/spade6.png', value: 6, suit: 'spades'},
		{img: 'img/spade7.png', value: 7, suit: 'spades'},
		{img: 'img/spade8.png', value: 8, suit: 'spades'},
		{img: 'img/spade9.png', value: 9, suit: 'spades'},
		{img: 'img/spade10.png', value: 10, suit: 'spades'},
		{img: 'img/spadeJ.png', value: 10, suit: 'spades'},
		{img: 'img/spadeQ.png', value: 10, suit: 'spades'},
		{img: 'img/spadeK.png', value: 10, suit: 'spades'}
	]
};

const cardBack = 'img/blueBack.png';
const userParent = document.querySelector('.cards');
const dealerParent = document.querySelector('.dealer-hand');
const netProfitDisplay = document.querySelector('.net-profit-txt');
const winner = document.querySelector('.winner');
let netProfit = 0;
let bet = undefined;
let gameOver = true;
let countUp = {
	user: 0,
	dealer: 0
};
let userPosition = {
	top: 55,
	left: 50,
};
let dealerPosition = {
	top: 15,
	left: 50,
};
let discardPile = [];
let profit = 0;

function addCard() {//add card to user hand
	const imgVal = Object.values(cards)[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 13)];
	if (countUp.user <= 21 && !discardPile.includes(imgVal) && !gameOver) {
		discardPile.push(imgVal);
		const element = document.createElement('img');
		userParent.appendChild(element);
		element.src = imgVal.img;
		element.className = 'card-img';
		element.style.top = `${userPosition.top}%`;
		element.style.left = `${userPosition.left}%`;
		element.draggable = false;
		element.dataset.value = imgVal.value;
		element.dataset.suit = imgVal.suit;
		if (imgVal.value == 1) element.id = 'ACE';
		element.onclick = function onclick() {aceToggle(this)};
		userPosition.left += 5;
		countUp.user += imgVal.value;
		updateCount();
	} else if (discardPile.includes(imgVal)) {//card already exists
		addCard();
	}
}

function aceToggle(element) {//toggles ace value from either 1 or 11
	if (element.id != 'ACE' || gameOver) return;
	element.dataset.value = (element.dataset.value == 1) ? 11 : 1;
	switch (element.dataset.suit) {//change ace img
		case 'hearts': element.src = (element.dataset.value == 1) ? cards.hearts[0].img : cards.hearts[0].altImg; break;
		case 'clubs': element.src = (element.dataset.value == 1) ? cards.clubs[0].img : cards.clubs[0].altImg; break;
		case 'diamonds': element.src = (element.dataset.value == 1) ? cards.diamonds[0].img : cards.diamonds[0].altImg; break;
		case 'spades': element.src = (element.dataset.value == 1) ? cards.spades[0].img : cards.spades[0].altImg; break;
	}
	(element.dataset.value == 1) ? countUp.user -= 10 : countUp.user += 10;
	updateCount();
}

let dealerCards = [];

function addToDealer() {//add cards to dealer
	const imgVal = Object.values(cards)[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 13)];
	if (!discardPile.includes(imgVal) && !dealerParent.childNodes[1]) {
		const element = document.createElement('img');
		discardPile.push(imgVal);
		dealerCards.push(imgVal);
		element.src = (!dealerParent.hasChildNodes) ? imgVal.img : cardBack;
		if (imgVal.value == 1) element.id = 'ACE';
		element.dataset.value = imgVal.value;
		element.dataset.suit = imgVal.suit;
		element.draggable = false;
		element.className = 'card-img';
		element.style.top = `${dealerPosition.top}%`;
		element.style.left = `${dealerPosition.left}%`;
		dealerPosition.left -= 5;
		dealerParent.appendChild(element);
		countUp.dealer += imgVal.value;
		addToDealer();
	} else if (discardPile.includes(imgVal)) {//card already exists
		addToDealer();
	}
}

function updateCount() {
	document.querySelector('.counter').innerHTML = (countUp.user <= 21) ? countUp.user : 'BUST';
}

function submitBet() {
	const inputBet = Number(document.querySelector('#modal-bet-input').value) || 15000;
	const isValid = isValidBet(inputBet);
	if (!isValid.bool) {//bet is invalid
		document.querySelector('.err-msg').innerHTML = isValid.errMsg;
	} else {
		window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'black-jack', purpose: 'bet-afford-check', val: inputBet, src: 'game-start'}), '*');
	}
	document.querySelector('#modal-bet-input').value = '';
}

function isValidBet(number) {//determines if submited bet is valid or not
	if (String(number).includes('.')) {//val is float
		return {bool: false, errMsg: 'Value cannot be float'};
	} else if (number < 15000) {//does not meet min val
		return {bool: false, errMsg: 'bet must exceed 15,000 Muffins'};
	} else {
		return {bool: true, errMsg: 'null'};
	}
}

window.addEventListener('message', (msg) => {//recieves messages from parent
	const data = JSON.parse(msg.data);
	if (data.purpose == 'bet-afford-check-response') {
		if (data.src == 'game-start') {
			if (data.bool) {//bet is less than current muffin count
				bet = data.val;
				document.querySelector('.get-bet').style.visibility = 'hidden';
				window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'black-jack', purpose: 'game-start', val: bet}), '*');
				startGame();
			} else {//bet exceeds current muffin count
				document.querySelector('.err-msg').innerHTML = 'Invalid funds for bet';
			}
		} else if (data.src == 'change-bet') {
			if (data.bool) {//bet is less than current muffin count
				bet = data.val;
				document.querySelector('.change-bet-modal').style.visibility = 'hidden';
				document.querySelector('.bet').innerHTML = `bet: ${suffixApplier(bet)}&nbsp;&nbsp;`;
			} else {//bet excedds current muffin count
				document.querySelector('.change-bet-modal-err-msg').innerHTML = 'Invalid funds for bet';
			}
		}
	}
});

document.addEventListener('keydown', (e) => {
	if (window.getComputedStyle(document.querySelector('.get-bet')).visibility == 'visible' && e.key == 'Enter') submitBet();
});

function startGame() {//execute certain functions to get the game started
	document.querySelector('.wrapper').style.visibility = 'visible';
	setTimeout(() => {
		gameOver = false;
		addCard();
		addToDealer();
		document.querySelector('.bet').innerHTML = `bet: ${suffixApplier(bet)}&nbsp;&nbsp;`;
	}, 250);
}

function stay() {
	if (gameOver) return;
	gameOver = true;
	dealerParent.childNodes.forEach((e, i) => {//display all cards
		e.src = dealerCards[i].img;
	});
	if ((countUp.dealer + 10) <= 21) checkForAces();
	if (countUp.dealer < 17) {//draw new card for dealer
		while (true) {//cycle untill valid card
			const imgVal = Object.values(cards)[Math.floor(Math.random() * 4)][Math.floor(Math.random() * 13)];
			if (!discardPile.includes(imgVal)) {
				const element = document.createElement('img');
				discardPile.push(imgVal);
				dealerCards.push(imgVal);
				element.src = imgVal.img;
				element.className = 'card-img';
				element.draggable = false;
				element.style.top = `${dealerPosition.top}%`;
				element.style.left = `${dealerPosition.left}%`;
				dealerPosition.left -= 5;
				dealerParent.appendChild(element);
				countUp.dealer += imgVal.value;
				break;
			}
		}
	}
	if (countUp.dealer > 21) checkForAces();
	document.querySelector('.dealer-counter').innerHTML = (countUp.dealer <= 21) ? countUp.dealer : 'BUST';
	document.querySelector('.counter').innerHTML = (countUp.user <= 21) ? countUp.user : 'BUST';
	checkWhoWins();
	document.querySelector('.end-btn-container').style.visibility = 'visible';
	document.querySelector('.change-bet-btn').style.visibility = 'visible';
}

function checkWhoWins(val) {
	if (countUp.user == countUp.dealer && val == undefined) {//draw
		let i = 0;
		const interval = setInterval(() => {
			i++;
			const int = Math.random() * 2;
			winner.innerHTML = int;
			if (i >= 25) {
				const newInt = Math.floor(int);
				winner.innerHTML = (newInt == 0) ? 'User Wins' : 'Dealer Wins';
				clearInterval(interval);
				return checkWhoWins(newInt);
			}
		}, 50);
	} else if (countUp.user > 21 && val == undefined) {//user busts
		checkWhoWins(1);
	} else if (countUp.user == 21 && val == undefined) {//user got black-jack
		netProfit += Number(bet) * 1.5;
		netProfitDisplay.innerHTML = suffixApplier(netProfit);
		addtoNet(Number(bet) * 1.5, true);
		winner.innerHTML = 'You got black-jack';
	} else if (val == 0 || countUp.user > countUp.dealer && val == undefined) {//user wins
		netProfit += Number(bet);
		netProfitDisplay.innerHTML = suffixApplier(netProfit);
		addtoNet(Number(bet), true);
		winner.innerHTML = 'You Win';
	} else if (val == 1 || countUp.user < countUp.dealer && val == undefined) {//dealer wins
		netProfit -= Number(bet);
		netProfitDisplay.innerHTML = suffixApplier(netProfit);
		addtoNet(Number(bet), false);
		winner.innerHTML = 'Dealer Wins';
	}
}

function addtoNet(val, isPositive) {//add value to net profit
	const element = document.createElement('p');
	const parent = document.querySelector('.net-profit-container');
	const X = document.querySelector('.net-profit-txt').offsetLeft;
	let Y = document.querySelector('.net-profit-txt').offsetTop - (document.querySelector('.net-profit-txt').offsetTop * 2);
	element.style.position = 'absolute';
	element.style.left = `${X}px`;
	element.style.top = `${Y}px`;
	element.innerHTML = (isPositive) ? `+${suffixApplier(val)}` : `-${suffixApplier(val)}`;
	parent.appendChild(element);
	let opacity = 100;
	const interval = setInterval(() => {
		opacity -= 2.5;
		Y -= 0.5;
		element.style.opacity = `${opacity}%`;
		element.style.top = `${Y}px`;
		if (opacity <= 1) {
			parent.removeChild(element);
			clearInterval(interval);
		}
	}, 10);
}

function checkForAces() {//change the value of dealer's aces
	const arr = dealerParent.childNodes;
	for (let i = 0; i < arr.length; i++) {//iterate through dealers cards
		if (arr[i].id != 'ACE') continue;
		arr[i].dataset.value = (arr[i].dataset.value == 1) ? 11 : 1;
		(arr[i].dataset.value == 1) ? countUp.dealer -= 10 : countUp.dealer += 10;
		switch (arr[i].dataset.suit) {//change ace img
			case 'hearts': arr[i].src = (arr[i].dataset.value == 1) ? cards.hearts[0].img : cards.hearts[0].altImg; break;
			case 'clubs': arr[i].src = (arr[i].dataset.value == 1) ? cards.clubs[0].img : cards.clubs[0].altImg; break;
			case 'diamonds': arr[i].src = (arr[i].dataset.value == 1) ? cards.diamonds[0].img : cards.diamonds[0].altImg; break;
			case 'spades': arr[i].src = (arr[i].dataset.value == 1) ? cards.spades[0].img : cards.spades[0].altImg; break;
		}
	}
	document.querySelector('.dealer-counter').innerHTML = (countUp.dealer <= 21) ? countUp.dealer : 'BUST';
}

function cashOut() {
	window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'black-jack', purpose: 'cash-out', val: netProfit}), '*');
}

function restart() {//resets the game
	while (userParent.hasChildNodes) {//remove cards from user hand
		if (userParent.firstChild != null) {
			userParent.removeChild(userParent.firstChild);
		} else break;
	}
	while (dealerParent.hasChildNodes) {//remove cards from dealer hand
		if (dealerParent.firstChild != null) {
			dealerParent.removeChild(dealerParent.firstChild);
		} else break;
	}
	document.querySelector('.dealer-counter').innerHTML = '';
	document.querySelector('.counter').innerHTML = '';
	document.querySelector('.bet').innerHTML = '';
	winner.innerHTML = '';
	countUp.user = 0;
	countUp.dealer = 0;
	userPosition.left = 50;
	dealerPosition.left = 50;
	document.querySelector('.end-btn-container').style.visibility = 'hidden';
	document.querySelector('.change-bet-btn').style.visibility = 'hidden';
	startGame();
}

function Formatter(number = 0, positve = isPositive(number)) {//formats given value
	const abbrev = Object.freeze(['', '', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quattuordecillion', 'Quindecillion', 'Sexdecillion', 'Septemdecillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion', 'Unvigintillion', 'Duovigintillion', 'Trevigintillion', 'Quattuorvigintillion']);
	if (Number(number).toLocaleString('fullwide', {useGrouping: false}).length < Math.abs((abbrev.length * 3 + 1))) {
		const unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3);
		const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
		const str = `${parseFloat((number / Math.pow(10, order * 3)).toFixed(2))} ${abbrev[order]}`;
		return (positve) ? str : `-${str}`;
	} else {
		return (positve) ? 'Infinity' : '-Infinity';
	}
}

function suffixApplier(input = 0) {//shortens value and adds suffixes
	if (Number(input) != String(input)) throw new Error(`invalid input type: ${typeof input}`);
	const number = String(Math.round(Math.abs(input)));
	if (number >= 1e+6 || number <= -1e+6) {//only formats if more than a million
		return Formatter((number).toLocaleString('fullwide', {useGrouping: false}), isPositive(input));
	} else {//less than a million
		return (isPositive(input) ? '' : '-') + parseInt(number).toLocaleString('fullwide', {useGrouping: true});
	}
}

function isPositive(val) {//returns if passed value is positve
	return (Math.abs(val) == val);
}

function changeBet() {
	document.querySelector('.change-bet-modal').style.visibility = 'visible';
}

function submitChangeBet() {
	const inputBet = document.querySelector('#change-bet-modal-input').value;
	const isValid = isValidBet(inputBet);
	if (!isValid.bool) {//bet is invalid
		document.querySelector('.change-bet-modal-err-msg').innerHTML = isValid.errMsg;
	} else {
		window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'black-jack', purpose: 'bet-afford-check', val: inputBet, src: 'change-bet'}), '*');
	}
	document.querySelector('#change-bet-modal-input').value = '';
}

function cancelBetChange() {
	document.querySelector('.change-bet-modal').style.visibility = 'hidden';
}