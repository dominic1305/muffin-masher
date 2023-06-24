"use strict";

const spinnerData = {bet: 0, winningColour: {colour: '', id: ''}, segments: 0, degreeArr: [{open: 0, close: 0}], returnPercent: 0};
let activeSpin = false;
const colourArray = [
	{colour: '#ff0000', id: 'Red'},
	{colour: '#00ff00', id: 'Green'},
	{colour: '#0000ff', id: 'Blue'},
	{colour: '#9a00ff', id: 'Purple'},
	{colour: '#0086ef', id: 'Light Blue'},
	{colour: '#ceff06', id: 'Yellow'},
	{colour: '#186218', id: 'Forest Green'},
	{colour: '#80807f', id: 'Grey'},
	null
];
const colourSelectors = [...document.querySelectorAll('.choose-colour-btn'), null];
let netProfit = 0;
const spinnerRevs = {min: 6, max: 9};

function getColours(length = 1) {//return a random hex code
	return new Array(length).fill(null).map(() => {
		return '#' + [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)].map((bin) => {
			return enforceByteSize(bin.toString(16), 16);
		}).join('');
	});
}

function enforceByteSize(str, register) {//adds zeros to stay within byte size
	const registerLength = (255).toString(register).length;
	while (str.length < registerLength) {
		str = '0' + str;
	}
	return String(str);
}

function drawToCanvas(shadeArr, canvasID) {//draw spinner to canvas
	const canvas = document.getElementById(canvasID);
	const ctx = canvas.getContext('2d');
	let currentAngle = 0;
	for (let i = 0; i < shadeArr.length; i++) {
		const portionAngle = (1 / shadeArr.length) * 2 * Math.PI;
		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - (canvas.width / 2 * 0.1), currentAngle, currentAngle + portionAngle);
		currentAngle += portionAngle;
		ctx.lineTo(canvas.width / 2, canvas.height / 2);
		ctx.fillStyle = shadeArr[i];
		ctx.fill();
	}
}

let modalCanvasInterval = undefined;

function toggleModalAnimation() {
	if (modalCanvasInterval == undefined) {
		const arr = document.querySelectorAll('.choose-spinner-canvas');
		for (let i = 0; i < arr.length; i++) {
			drawToCanvas(getColours(parseInt(arr[i].dataset.segments)), arr[i].querySelector('canvas').id);
			arr[i].querySelector('#select-arrow-img').style.transform = `translate(-50%, -50%) rotate(${Math.floor(Math.random() * 360)}deg)`;
		}
		modalCanvasInterval = setInterval(() => {//animation
			const arr = document.querySelectorAll('.choose-spinner-canvas');
			for (let i = 0; i < arr.length; i++) {
				drawToCanvas(getColours(parseInt(arr[i].dataset.segments)), arr[i].querySelector('canvas').id);
				arr[i].querySelector('#select-arrow-img').style.transform = `translate(-50%, -50%) rotate(${Math.floor(Math.random() * 360)}deg)`;
			}
		}, 1000);
	} else if (modalCanvasInterval != undefined) {
		clearInterval(modalCanvasInterval);
		modalCanvasInterval = undefined;
	}
}

document.querySelectorAll('.choose-spinner-canvas').forEach((bin) => {//select spinner
	bin.addEventListener('click', (e) => {
		for (let i = 0; i < document.querySelectorAll('.choose-spinner-canvas').length; i++) {
			document.querySelectorAll('.choose-spinner-canvas')[i].dataset.selected = 'false';
			document.querySelectorAll('.choose-spinner-canvas')[i].style.border = '1px solid rgba(0, 0, 0, 0)';
		}
		e.target.dataset.selected = 'true';
		e.target.style.border = '1px solid black';
		for (let i = 0; i < document.querySelectorAll('.choose-colour-btn').length; i++) {
			document.querySelectorAll('.choose-colour-btn')[i].style.display = 'none';
		}
		colourSelectors.slice(0, -(colourSelectors.length - Number(e.target.dataset.segments))).forEach((bin) => {//display available colours
			if (bin != null) bin.style.display = 'inline-block';
		});
	});
});

document.querySelectorAll('.choose-colour-btn').forEach((bin, i) => {//select colour
	bin.querySelector('.choose-colour-label').style.backgroundColor = colourArray[i].colour;
	bin.querySelector('.choose-colour-txt').innerHTML = colourArray[i].id;
	bin.addEventListener('click', (e) => {
		document.querySelectorAll('.choose-colour-btn').forEach((bin) => {
			bin.dataset.selected = 'false';
			bin.style.backgroundColor = 'rgba(0, 0, 0, 0)';
		});
		e.target.dataset.selected = 'true';
		e.target.style.backgroundColor = 'lightgreen';
	});
});

function submitBet() {
	const data = {inputBet: Number(document.querySelector('#bet-input-inp').value) || 15000, spinner: null, winningColour: null};
	document.querySelectorAll('.choose-spinner-canvas').forEach((bin, i) => {//define spinner
		if (bin.dataset.selected == 'true') data.spinner = i;
	});
	document.querySelectorAll('.choose-colour-btn').forEach((bin, i) => {//define winningColour
		if (bin.dataset.selected == 'true') data.winningColour = i;
	});
	const response = (() => {//check validity of modal input
		if (data.inputBet < 15000) return {bool: false, msg: 'bet must exceed 15,000 muffins'};
		else if (String(data.inputBet).includes('.')) return {bool: false, msg: 'bet cannot be a float'};
		else if (![0, 1, 2].includes(data.spinner)) return {bool: false, msg: 'you must select a spinner'};
		else if (![0, 1, 2, 3, 4, 5, 6, 7].includes(data.winningColour)) return {bool: false, msg: 'you must select a colour'};
		else return {bool: true, msg: ''};
	})();
	if (!response.bool) {
		document.querySelector('.modal-err-msg').innerHTML = response.msg;
	} else {
		parent.window.postMessage(JSON.stringify({origin: 'casino', faction: 'spinner', purpose: 'bet-afford-check', val: data}), '*');
	}
}

window.addEventListener('message', (msg) => {//parent message interpreter
	const data = JSON.parse(msg.data);
	if (data.purpose == 'bet-afford-check-response') {
		if (data.bool) {//can afford
			document.querySelector('#bet-input-inp').value = '';
			document.querySelectorAll('.choose-spinner-canvas').forEach((bin) => {
				bin.dataset.selected = 'false';
				bin.style.border = '1px solid rgba(0, 0, 0, 0)';
			});
			document.querySelectorAll('.choose-colour-btn').forEach((bin) => {
				bin.dataset.selected = 'false';
				bin.style.backgroundColor = 'rgba(0, 0, 0, 0)';
			});
			spinnerData.bet = Number(data.val.inputBet);
			spinnerData.winningColour = colourArray[data.val.winningColour];
			spinnerData.segments = Number(document.querySelectorAll('.choose-spinner-canvas')[data.val.spinner].dataset.segments);
			spinnerData.degreeArr = getDegreeArr(spinnerData.segments);
			spinnerData.returnPercent = parseFloat(document.querySelectorAll('.choose-spinner-canvas')[data.val.spinner].dataset.returns);
			if (spinnerData.segments == 6) {//rotate -90deg if 6 segments
				document.querySelector('#main-canvas').style.transform = 'rotate(180deg)';
			}
			document.querySelector('.modal').style.visibility = 'hidden';
			document.querySelector('.wrapper').style.visibility = 'visible';
			document.querySelector('.bet').innerHTML = `Bet: ${suffixApplier(spinnerData.bet)}`;
			drawToCanvas(colourArray.slice(0, -(colourArray.length - spinnerData.segments)).map(bin => bin.colour), 'main-canvas');
			toggleModalAnimation();
			parent.window.postMessage(JSON.stringify({origin: 'casino', faction: 'spinner', purpose: 'game-start'}), '*');
		} else {//can't afford
			document.querySelector('.modal-err-msg').innerHTML = 'cannot afford bet';
		}
	}
});

document.addEventListener('keydown', (e) => {
	if (e.key == 'Enter' && window.getComputedStyle(document.querySelector('.modal')).visibility == 'visible') submitBet();
});

document.querySelector('.change-bet-btn').addEventListener('click', () => {//change bet
	if (activeSpin) return;
	toggleModalAnimation();
	document.querySelectorAll('.choose-colour-btn').forEach((bin) => {
		bin.style.display = 'none';
	});
	document.querySelector('.wrapper').style.visibility = 'hidden';
	document.querySelector('.modal').style.visibility = 'visible';
});

function getDegreeArr(segments = 1) {
	const width = 360 / segments;
	let counter = 0;
	return new Array(segments).fill(null).map(() => {
		const obj = (spinnerData.segments == 6) ? {open: counter - 90, close: (counter + width) - 90} : {open: counter, close: counter + width};
		counter += width;
		return obj;
	}).map((bin) => {
		return {open: (isPositive(bin.open) ? bin.open : bin.open + 360), close: (isPositive(bin.close)) ? bin.close : bin.close + 360};
	});
}

function findSector() {//get transform matrix and translates it to degrees
	let angle = findDegrees(arrowContainer) % 360;
	if (!isPositive(angle)) angle += 360;
	for (let i = 0; i < spinnerData.degreeArr.length; i++) {
		if (angle >= spinnerData.degreeArr[i].open && angle < spinnerData.degreeArr[i].close) return i;
	}
	throw new Error(`cannot find sector | angle: ${angle}`);
}

function findDegrees(element) {
	const matrix = window.getComputedStyle(element).transform;
	const values = matrix.split('(')[1].split(')')[0].split(',');
	return Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
}

const arrowContainer = document.querySelector('#main-arrow-spinner-container');
const arrow = document.querySelector('#main-arrow-spinner');

function spin() {//run spin animation
	if (activeSpin) return;
	netProfit -= spinnerData.bet;
	document.querySelector('.net-profit').innerHTML = `Net Profit: ${suffixApplier(netProfit)}`;
	addToNetAnimation(-spinnerData.bet);
	activeSpin = true;
	const transitionTime = Math.floor(Math.random() * (3500 - 2500) + 2500);
	const degreesToTravel = Math.floor(Math.random() * ((360 * 9) - (360 * 6)) + (360 * 6));
	arrow.style.transition = `${transitionTime}ms ease-out`;
	arrow.style.transform = `rotate(${degreesToTravel}deg)`;
	setTimeout(() => {//reset
		arrow.style.transition = '0ms ease-out';
		arrow.style.transform = 'rotate(0deg)';
		arrowContainer.style.transform = `translateY(-100%) rotate(${(degreesToTravel + findDegrees(arrowContainer)) % 360}deg)`;
		if (colourArray[findSector()].id == spinnerData.winningColour.id) {//add to net profit only if the player has won
			netProfit += spinnerData.bet * spinnerData.returnPercent;
			document.querySelector('.net-profit').innerHTML = `Net Profit: ${suffixApplier(netProfit)}`;
			addToNetAnimation(spinnerData.bet);
		}
		activeSpin = false;
	}, transitionTime + 1000);
}

function addToNetAnimation(number = 0, positive = isPositive(number)) {//add to net profit
	const element = document.createElement('span');
	const parent = document.querySelector('.net-profit');
	let Y = parseInt(window.getComputedStyle(parent).height) / 2;
	element.className = 'net-profit-animation';
	element.style.top = `${Y}px`;
	element.innerHTML = ((positive) ? '+' : '') + suffixApplier(Math.round(number));
	parent.appendChild(element);
	let opacity = 100;
	const interval = setInterval(() => {//fade animation
		Y += (positive) ? -0.5 : 0.5;
		opacity--;
		element.style.opacity = `${opacity}%`;
		element.style.top = `${Y}px`;
		if (opacity <= 0) {//fade is done
			parent.removeChild(element);
			clearInterval(interval);
		}
	}, 10);
}

document.querySelector('.cash-out-btn').addEventListener('click', () => {//cash out
	if (!activeSpin) parent.window.postMessage(JSON.stringify({origin: 'casino', faction: 'spinner', purpose: 'cash-out', val: netProfit}), '*');
});

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