"use strict";

let tokens = 0;
let minCount = 0;
let netProfit = 0;
let leverDragState = false;
const defaultLeverPos = 133;
const imgSlots = document.querySelectorAll('.img-slots');
const slotImgs = [
	{img: 'img/pixel.png', val: 500, alt: 'pixel', minVal: 5000},
	{img: 'img/banana.png', val: 400, alt: 'banana', minVal: 4000},
	{img: 'img/orange.png', val: 300, alt: 'orange', minVal: 3000},
	{img: 'img/apple.png', val: 200, alt: 'apple', minVal: 2000},
	{img: 'img/watermelon.png', val: 100, alt: 'watermelon', minVal: 1000}
];
let loseCaseAmount = {val: 100, minVal: 1000};

function buyTokens() {
	const val = document.getElementById('modal-input-id').value;
	document.querySelector('.modal-err-msg').innerHTML = '';
	if (String(val).includes('.')) {//val is float
		document.querySelector('.modal-err-msg').innerHTML = 'Value cannot be float';
	} else if (val < 5) {//under minimum
		document.querySelector('.modal-err-msg').innerHTML = 'Under minimum value: 5';
	} else {//is valid
		window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'slots', purpose: 'bet-afford-check', val: val}), '*');
	}
}

document.addEventListener('keydown', (e) => {
	if (window.getComputedStyle(document.querySelector('.get-tokens')).visibility == 'visible' && e.key == 'Enter') {
		buyTokens();
	}
});

window.addEventListener('message', (msg) => {//receive messages from parent
	const data = JSON.parse(msg.data);
	if (data.purpose == 'bet-afford-check-response') {
		if (data.bool) {//can afford
			tokens = Number(data.val);
			document.querySelector('.get-tokens').style.visibility = 'hidden';
			document.querySelector('.tokens').innerHTML = `Tokens: ${suffixApplier(data.val)}&nbsp;&nbsp;`;
			document.querySelector('.wrapper').style.visibility = 'visible';
			startGame();
		} else {//can't afford
			document.querySelector('.modal-err-msg').innerHTML = 'invalid funds for tokens';
		}
	}
});

let animation = undefined;

function startGame() {
	window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'slots', purpose: 'game-start'}), '*');
	animation = setInterval(animationFN, 100);
	updateLegend();
}

function animationFN() {
	displayImg(0, Math.floor(Math.random() * 5));
	setTimeout(() => {
		displayImg(1, Math.floor(Math.random() * 5));
		setTimeout(() => {
			displayImg(2, Math.floor(Math.random() * 5));
		}, 50);
	}, 50);
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

document.querySelector('.lever').addEventListener('mousedown', () => {//enable drag
	leverDragState = true;
});

document.addEventListener('click', () => {//disable drag & reset lever
	leverDragState = false;
	const bool = (parseInt(window.getComputedStyle(document.querySelector('.lever-container')).top) >= 345);
	document.querySelector('.lever-container').style.top = `${defaultLeverPos}px`;
	document.querySelector('.lever-handle').style.height = `${defaultLeverPos}px`;
	document.querySelector('.lever-handle').style.transform = 'translate(-50%, -100%)';
	if (bool) trigger();
});

document.querySelector('.lever').addEventListener('mousemove', (e) => {//move lever
	if (!leverDragState) return;
	const Y = e.clientY;
	if (Y > defaultLeverPos && Y < 345 + 50) {
		document.querySelector('.lever-container').style.top = `${Y}px`;
		if (parseInt(window.getComputedStyle(document.querySelector('.lever-container')).top) <= 266) {//lowers handle if above center
			document.querySelector('.lever-handle').style.transform = 'translate(-50%, -100%)';
			document.querySelector('.lever-handle').style.height = `${266 - Y}px`;
		} else if (parseInt(window.getComputedStyle(document.querySelector('.lever-container')).top) > 266) {//lowers handle if under center
			document.querySelector('.lever-handle').style.transform = 'translate(-50%)';
			document.querySelector('.lever-handle').style.height = `${parseInt(window.getComputedStyle(document.querySelector('.lever-container')).top) - 266}px`;
		}
	}
});

let triggerState = true;

function trigger() {
	if (tokens <= 0 || !triggerState) return;
	clearInterval(animation);
	animation = undefined;
	triggerState = false;
	tokens--;
	minCount++;
	document.querySelector('.tokens').innerHTML = `Tokens: ${suffixApplier(tokens)}&nbsp;&nbsp;`;
	const result = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)];
	setTimeout(() => {//display first digit
		displayImg(0, result[0]);
		setTimeout(() => {//display second digit
			displayImg(1, result[1]);
			setTimeout(() => {//display third digit
				displayImg(2, result[2]);
				for (let i = 0; i < 3; i++) {//run check
					if (new Set(result).size == 1 && result[i] == 0 || new Set(result).size == 1 && result[i] == 1) {//win on 0|1
						switch (result[i]) {//find specific index
							case 0: pay(result, slotImgs[0].val, false); break;
							case 1: pay(result, slotImgs[1].val, false); break;
						}
						break;
					} else if (twoInARow(result, i, 2) || twoInARow(result, i, 3) || twoInARow(result, i, 4)) {//win on 2|3|4
						switch (result[i]) {//find specific index
							case 2: pay(result, slotImgs[2].val, true); break;
							case 3: pay(result, slotImgs[3].val, true); break;
							case 4: pay(result, slotImgs[4].val, true); break;
						}
						break;
					} else if (i >= 2) {//lose case
						pay(result, loseCaseAmount.val, false);
						break;
					}
				}
				restart();
			}, 100);
		}, 100);
	}, 100);
}

function pay(arr, amount, bonusPay) {//payout on trigger result
	if (new Set(arr).size == 1 && bonusPay) amount = amount * 1.5; //50% extra
	netProfit += amount;
	document.querySelector('.net-profit-txt').innerHTML = suffixApplier(netProfit);
	addToNet(amount);
}

function twoInARow(arr, i, target) {//checks if two numbers in a row are the same
	return (arr[i] == target && arr[i+1] == target);
}

function restart() {//restart machine for next trigger call
	setTimeout(() => {
		triggerState = true;
		animation = setInterval(animationFN, 100);
		if (minCount >= 5) document.querySelector('.cash-out-btn').style.visibility = 'visible';
	}, 1000);
}

function displayImg(node, index) {//dispaly images to machine slots
	imgSlots[node].src = slotImgs[index].img;
	imgSlots[node].alt = slotImgs[index].alt;
	imgSlots[node].dataset.value = slotImgs[index].val;
}

function cashOut(override = false) {
	if (tokens <= 0 || override) {
		window.parent.postMessage(JSON.stringify({origin: 'casino', faction: 'slots', purpose: 'cash-out', val: netProfit}), '*');
	} else {//tokens remain
		document.querySelector('.cash-out-modal').style.visibility = 'visible';
	}
}

function closeModal() {
	document.querySelector('.cash-out-modal').style.visibility = 'hidden';
}

function displayLegend() {//display legend modal
	document.querySelector('.legend-modal').style.visibility = 'visible';
	document.querySelector('.legend-modal-backdrop').style.visibility = 'visible';
}

function closeLegend() {//close legend modal
	document.querySelector('.legend-modal').style.visibility = 'hidden';
	document.querySelector('.legend-modal-backdrop').style.visibility = 'hidden';
}

function updateLegend() {
	const elements = document.querySelectorAll('.legend-modal-tile');
	for (let i = 0; i < elements.length; i++) {
		slotImgs[i].val = ((slotImgs[i].val * tokens) > slotImgs[i].minVal) ? slotImgs[i].val * tokens : slotImgs[i].minVal;
		elements[i].querySelector('.legend-modal-tile-txt').innerHTML = suffixApplier(slotImgs[i].val);
	}
	loseCaseAmount.val = ((loseCaseAmount.val * tokens) > loseCaseAmount.minVal) ? -(loseCaseAmount.val * tokens) / 2 : -loseCaseAmount.minVal / 2;
}

function addToNet(number) {//visual animation adding to net
	const element = document.createElement('p');
	const parent = document.querySelector('.net-profit-container');
	const X = document.querySelector('.net-profit-txt').offsetLeft;
	let Y = document.querySelector('.net-profit-txt').offsetTop;
	element.style.position = 'absolute';
	element.style.top = `${Y}px`;
	element.style.left = `${X}px`;
	element.innerHTML = (isPositive(number)) ? `+${suffixApplier(number)}` : suffixApplier(number);
	parent.appendChild(element);
	let opacity = 100;
	const interval = setInterval(() => {
		opacity -= 2.5;
		Y -= 0.5;
		element.style.opacity = `${opacity}%`;
		element.style.top = `${Y}px`;
		if (opacity <= 1) {//animation is done
			parent.removeChild(element);
			clearInterval(interval);
		}
	}, 10);
}