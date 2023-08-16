"use strict";

function createName() {//return randomly generated string
	const firstPosition = ['Magic', 'Fantastic', 'Fancy', 'Sassy', 'Snazzy', 'Pretty', 'Cute', 'Pirate', 'Ninja', 'Zombie', 'Robot', 'Radical', 'Urban', 'Cool', 'Hella', 'Sweet', 'Awful', 'Double', 'Triple', 'Turbo', 'Techno', 'Disco', 'Electro', 'Dancing', 'Wonder', 'Mutant', 'Space', 'Science', 'Medieval', 'Future', 'Captain', 'Bearded', 'Lovely', 'Tiny', 'Big', 'Fire', 'Water', 'Frozen', 'Metal', 'Plastic', 'Solid', 'Liquid', 'Moldy', 'Shiny', 'Happy', 'Happy Little', 'Slimy', 'Tasty', 'Delicious', 'Hungry', 'Greedy', 'Lethal', 'Professor', 'Doctor', 'Power', 'Chocolate', 'Crumbly', 'Choklit', 'Righteous', 'Glorious', 'Mnemonic', 'Psychic', 'Frenetic', 'Hectic', 'Crazy', 'Royal', 'El', 'Von'];
	const secondPosition = ['Cookie', 'Biscuit', 'Muffin', 'Scone', 'Cupcake', 'Pancake', 'Chip', 'Sprocket', 'Gizmo', 'Puppet', 'Mitten', 'Sock', 'Teapot', 'Mystery', 'Baker', 'Cook', 'Click', 'Clicker', 'Spaceship', 'Factory', 'Portal', 'Machine', 'Experiment', 'Monster', 'Panic', 'Burglar', 'Bandit', 'Booty', 'Potato', 'Pizza', 'Burger', 'Sausage', 'Meatball', 'Spaghetti', 'Macaroni', 'Kitten', 'Puppy', 'Giraffe', 'Zebra', 'Parrot', 'Dolphin', 'Duckling', 'Sloth', 'Turtle', 'Goblin', 'Pixie', 'Gnome', 'Computer', 'Pirate', 'Ninja', 'Zombie', 'Robot'];
	return `${firstPosition[Math.floor(Math.random() * firstPosition.length)]} ${secondPosition[Math.floor(Math.random() * secondPosition.length)]}'s Bakery`;
}

class BaseProducer {
	constructor (amount, cost, constCost, id) {
		this.amount = Number(amount);
		this.cost = Number(cost);
		this.constCost = Number(constCost);
		this.id = String(id);
	}
	get element() {//return producer element
		return document.getElementById(this.id);
	}
	purchase() {//buy specific producer
		this.element.style.border = 'outset';
		const buyCost = costCalc(this.cost);
		let visBool = false;
		if (!gameData.sellState && gameData.muffinCount >= buyCost) {//buy
			for (let i = 0; i < gameData.multiBuyAmount; i++) {
				if (typeof this.each != 'undefined') gameData.MPS += (!frenzyStates.productionBoost) ? this.each : this.each * 5;
				gameData.muffinCount -= this.cost;
				this.amount++;
				this.cost = Math.round(this.cost * 1.1);
			}
			visBool = true;
		} else if (gameData.sellState && this.amount >= gameData.multiBuyAmount) {//sell
			for (let i = 0; i < gameData.multiBuyAmount; i++) {
				if (typeof this.each != 'undefined') gameData.MPS -= (!frenzyStates.productionBoost) ? this.each : this.each * 5;
				this.amount--;
				this.cost = Math.round(this.cost / 1.1);
				gameData.muffinCount += Math.round(this.cost * 0.5);
			}
			visBool = true;
		} else if (!gameData.sellState && gameData.muffinCount < buyCost) {//insufficient funds notice
			this.element.querySelector('.insufficient-funds-container').appendChild(document.querySelector('#insufficient-funds-template').content.cloneNode(true));
			const element = [...this.element.querySelectorAll('.insufficient-funds')].reverse()[0];
			setTimeout(() => {
				let opacity = 100;
				const interval = setInterval(() => {//fade animation
					opacity--;
					element.style.opacity = `${opacity}%`;
					if (opacity <= 0) {//animation is done
						this.element.querySelector('.insufficient-funds-container').removeChild(element);
						clearInterval(interval);
					}
				}, 10);
			}, 100);
		}
		this.element.querySelector('#price').innerHTML =  suffixApplier(costCalc(this.cost));
		this.element.querySelector('#counter').innerHTML = suffixApplier(this.amount);
		if (visBool) this.displayTxt(((gameData.sellState) ? '-' : '+') + gameData.multiBuyAmount);
		if (visBool) muffinCounterMsgDisplayer((gameData.sellState) ? buyCost : -buyCost);
		document.querySelector('#mufCount').innerHTML = suffixApplier(gameData.muffinCount);
		document.querySelector('#MPS').innerHTML = suffixApplier(gameData.MPS);
	}
	displayTxt(txt = '') {//display text in centre of producer
		const element = document.createElement('p');
		this.element.appendChild(element);
		element.style.zIndex = 2;
		element.innerHTML = String(txt);
		element.style.transform = 'translate(-50%, -50%)';
		element.style.position = 'absolute';
		element.style.left = '50%';
		element.style.top = '50%';
		let Y = parseInt(window.getComputedStyle(element).top);
		let opacity = 100;
		const interval = setInterval(() => {//fade animation
			opacity--;
			Y -= 0.5;
			element.style.top = `${Y}px`;
			element.style.opacity = `${opacity}%`;
			if (opacity <= 0) {//animation is done
				this.element.removeChild(element);
				clearInterval(interval);
			}
		}, 10);
	}
}

class Producer extends BaseProducer {
	constructor(amount, cost, constCost, each, constEach, element) {
		super(amount, cost, constCost, element);
		this.each = each;
		this.constEach = Number(constEach);
	}
	costRedux() {//decreases cost through prestige
		this.cost = Math.round(this.constCost - (this.constCost * gameData.prestigeSys.costRedux.amount));
		this.element.querySelector('#price').innerHTML = suffixApplier(this.cost);
	}
	valueUpgrade() {//increase value (each) through prestige
		this.each = this.constEach * gameData.prestigeSys.valueUpgrader.amount
		this.element.querySelector('#each').innerHTML = `${suffixApplier(this.each)}/s Each`;
	}
	productionBoost() {//displays higher value for frenzy
		this.element.querySelector('#each').innerHTML = frenzyStates.productionBoost ? `${suffixApplier(this.each * 5)}/s Each` : `${suffixApplier(this.each)}/s Each`;
		this.element.querySelector('#each').style.color = frenzyStates.productionBoost ? 'red' : 'black';
	}
	frenzyCostRedux() {//decreases cost momentarily for frenzy
		this.cost = (frenzyStates.costRedux) ? this.cost / 2 : this.cost * 2;
		this.element.querySelector('#price').innerHTML = suffixApplier(this.cost);
	}
	display() {//create procedural html element and display values
		document.querySelector('#producer-panel').appendChild(document.querySelector('#producer-element-template').content.cloneNode(true));
		[...document.querySelectorAll('.producer-btn')].reverse()[0].id = this.id;
		this.element.querySelector('#name').innerHTML = this.id;
		this.element.querySelector('#price').innerHTML = suffixApplier(this.cost);
		this.element.querySelector('#each').innerHTML = `${suffixApplier(this.each)}/s Each`;
		this.element.querySelector('#counter').innerHTML = suffixApplier(this.amount);
		this.element.addEventListener('click', () => {
			this.purchase();
		});
		return this;
	}
}

class SkinItem {
	constructor(img, lockState, id, currentSkin, cost) {
		this.IMG = img;
		this.lockState = lockState;
		this.id = id;
		this.currentSkin = currentSkin;
		this.cost = cost;
		this.ticketCost = Math.floor(cost * (1 / 1e+6)); //1 ticket is 1 million muffins
	}
	get element() {//return skin element
		return document.getElementById(this.id);
	}
	get img() {//return skin image file address
		return `./img/${this.IMG}.png`;
	}
	selectSkin() {//change muffin skin if unlocked
		this.element.style.border = 'outset';
		if (this.lockState) return;
		document.querySelector('#Muffin-IMG-ID').src = this.img;
		for (let i = 0; i < gameData.skins.length; i++) {
			gameData.skins[i].currentSkin = false;
		}
		this.currentSkin = true;
	}
	unlockSkin() {//unlock selected skin
		if (!this.lockState) return; //already unlocked
		getSkinPaymentMethod().then((msg) => {//choose payment method
			if (msg == 'muffins' && gameData.muffinCount >= this.cost) {//buy with muffins
				gameData.muffinCount -= this.cost;
				this.lockState = false;
				this.element.querySelector('.skin-lock').style.visibility = 'hidden';
				this.selectSkin();
			} else if (msg == 'tickets' && gameData.arcade.tickets >= this.ticketCost) {//buy with arcade tickets
				gameData.arcade.tickets -= this.ticketCost;
				this.lockState = false;
				this.element.querySelector('.skin-lock').style.visibility = 'hidden';
				this.selectSkin();
			} else {//can't afford
				this.element.querySelector('.insufficient-funds-container').appendChild(document.querySelector('#insufficient-funds-template').content.cloneNode(true));
				const element = [...this.element.querySelectorAll('.insufficient-funds')].reverse()[0];
				setTimeout(() => {
					let opacity = 100;
					const interval = setInterval(() => {//fade animation
						opacity--;
						element.style.opacity = `${opacity}%`;
						if (opacity <= 0) {//fade is done
							this.element.querySelector('.insufficient-funds-container').removeChild(element);
							clearInterval(interval);
						}
					}, 10);
				}, 100);
			}
		}).catch((msg) => {//canceled
			if (msg != 0) console.error(msg); //exit without error
			else return;
		});
	}
	display() {//create procedural html element and display values
		document.querySelector('.skins-modal-body').appendChild(document.querySelector('#skin-element-template').content.cloneNode(true));
		[...document.querySelectorAll('.skin-tile')].reverse()[0].id = this.id;
		this.element.querySelector('.skin-img').src = this.img;
		this.element.querySelector('.skin-txt').innerHTML = this.id;
		this.element.querySelector('.skin-lock').style.visibility = this.lockState ? 'visible' : 'hidden';
		this.element.querySelector('#muffin-cost').innerHTML = `${suffixApplier(this.cost)} Muffins`;
		this.element.querySelector('#ticket-cost').innerHTML = `${suffixApplier(this.ticketCost)} Tickets`;
		this.element.addEventListener('click', () => {
			(this.lockState) ? this.unlockSkin() : this.selectSkin();
		});
		return this;
	}
}

class Cache {
	static write(key, value, expiry) {
		const date = new Date();
		date.setTime(date.getTime() + expiry);
		document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/`;
	}
	static read(key, remove = true) {
		try {
			const value = document.cookie.split(' ').filter(bin => bin.split('=')[0] == key)[0].split('=')[1];
			if (remove) this.remove(key);
			return value;
		} catch {
			return null;
		}
	}
	static remove(key) {
		document.cookie = `${key}=;expires=${new Date().toUTCString()}`;
	}
	static clear() {
		document.cookie.split(' ').forEach((bin) => {
			document.cookie = `${bin.split('=')[0]}=;expires=${new Date().toUTCString()}`;
		});
	}
}

let gameData = {
	versionID: 'V0.7.6', //NOTE: to be updated on new version release
	muffinCount: 0,
	MPS: 0,
	name: '',
	sellState: false,
	multiBuyAmount: 1,
	autoClicker: {state: true, firstWarning: false, secondWarning: false},
	upgradeClicker: new BaseProducer(0, 50, 50, 'upgradeClicker'),
	producers: [
		new Producer(0, 15, 15, 1, 1, 'Muffin Bakery'),
		new Producer(0, 100, 100, 5, 5, 'Corgis'),
		new Producer(0, 1150, 1150, 12, 12, 'Muffin Tree'),
		new Producer(0, 13500, 13500, 56, 56, 'George'),
		new Producer(0, 160e+3, 160e+3, 256, 256, 'Muffin Fountain'),
		new Producer(0, 980e+3, 980e+3, 1470, 1470, 'Muffin Shrine'),
		new Producer(0, 6.5e+6, 6.5e+6, 8650, 8650, 'Muffin Mountain'),
		new Producer(0, 460e+6, 460e+6, 78630, 78630, 'Dimensional Rift'),
		new Producer(0, 7.8e+9, 7.8e+9, 378e+3, 378e+3, 'Muffin Mansion'),
		new Producer(0, 128e+9, 128e+9, 14e+6, 14e+6, 'The Muffin Man'),
		new Producer(0, 512e+9, 512e+9, 178e+6, 178e+6, 'Muffin Factory'),
		new Producer(0, 2.4e+12, 2.4e+12, 830e+6, 830e+6, 'Muffin Quarry'),
		new Producer(0, 246e+12, 246e+12, 28e+9, 28e+9, 'Celestial Muffin'),
	],
	skins: [
		new SkinItem('muffin', false, 'Choc-Chip', true, 0),
		new SkinItem('blueberrymuffin', true, 'Blueberry', false, 50e+6),
		new SkinItem('muffinPixel', true, 'Pixel Muffin', false, 50e+9),
		new SkinItem('dbChocChipMuffin', true, 'Double Choc-Chip', false, 50e+12),
		new SkinItem('bananaMuffin', true, 'Banana', false, 50e+15),
		new SkinItem('strawBerryMuffin', true, 'Strawberry Cheesecake', false, 50e+18),
	],
	prestigeSys: {
		countUp: 0,
		points: 0,
		sellState: false,
		valueUpgrader: {amount: 1, cost: 2, minCost: 2},
		headStart: {amount: 0, cost: 6, minCost: 6},
		costRedux: {amount: 0, cost: 4, minCost: 4},
		clock: {mins: 5, secs: 0},
		confirmToggleState: false,
		coolDown: true,
		prestigeCount: 0,
	},
	frenzySys: {RNGlimit: 10, timer: 60, countUp: 0, activeState: false, gameState: false},
	arcade: {
		tickets: 0,
	},
};

document.querySelector('.upgradeClickerButton').addEventListener('click', (e) => {//purchase upgrade clicker
	if (gameData.upgradeClicker != null && gameData.upgradeClicker instanceof BaseProducer) gameData.upgradeClicker.purchase();
});

function muffinClick() {
	const pointsToAdd = (gameData.MPS <= 10) ? 1 + gameData.upgradeClicker.amount : gameData.MPS * (0.1 + (gameData.upgradeClicker.amount / 100));
	gameData.muffinCount += Math.round(pointsToAdd);
	gameData.prestigeSys.prestigeCountUp += Math.round(pointsToAdd);
	muffinCounterMsgDisplayer(pointsToAdd);
	clickCountUp++;
	document.getElementById('mufCount').innerHTML = suffixApplier(gameData.muffinCount);
	document.getElementById('Muffin-IMG-ID').style.height = '330px';
	document.getElementById('Muffin-IMG-ID').style.width = '330px';
}

function borderChangeMuffinIMG() {
	document.getElementById('Muffin-IMG-ID').style.height = '320px';
	document.getElementById('Muffin-IMG-ID').style.width = '320px';
}

document.querySelector('.muffinIMG').addEventListener('click', (e) => {
	muffinClickMsgDisplayer(e.clientX, e.clientY);
});

function muffinClickMsgDisplayer(X, Y) {//add [+1] msg on muffin click
	const parent = document.querySelector('.plusOne');
	const element = document.createElement('p');
	element.style.visibility = 'visible';
	element.style.position = 'absolute';
	element.style.pointerEvents = 'none';
	element.style.top = `${Y}px`;
	element.style.left = `${X}px`;
	element.style.transform = 'translate(-50%, -50%)';
	element.innerHTML = (gameData.MPS <= 10) ? `+${suffixApplier(Math.round(1 + gameData.upgradeClicker.amount))}` : `+${suffixApplier(Math.round(gameData.MPS * (0.1 + (gameData.upgradeClicker.amount / 100))))}`;
	parent.appendChild(element);
	let opacity = 110;
	const interval = setInterval(() => {//fade animation
		opacity--;
		Y--;
		element.style.opacity = `${opacity}%`;
		element.style.top = `${Y}px`;
		if (opacity <= 0) {//animation is done
			parent.removeChild(element);
			clearInterval(interval);
		}
	}, 10);
}

function muffinCounterMsgDisplayer(number = 0, positve = isPositive(number)) {//add [+1] msg to counters
	if (Number(number) != String(number)) throw new Error(`invalid input type: ${typeof number}`);
	const element = document.createElement('p');
	const parent = document.querySelector('.muffin-counters-txt:nth-child(2)');
	parent.appendChild(element);
	element.innerHTML = ((positve) ? '+' : '-') + suffixApplier(Math.abs(number));
	element.style.zIndex = 2;
	element.style.transform = 'translate(-50%, -50%)';
	element.style.textAlign = 'center';
	element.style.position = 'absolute';
	element.style.top = `${parent.clientHeight / 2}px`;
	element.style.left = `${parent.offsetLeft + (parent.clientWidth / 2)}px`;
	let Y = parseInt(window.getComputedStyle(element).top);
	let opacity = 100;
	const interval = setInterval(() => {//fade animation
		opacity--;
		Y += (positve) ? -0.5 : 0.5;
		element.style.top = `${Y}px`;
		element.style.opacity = `${opacity}%`;
		if (opacity <= 0) {//animation is done
			parent.removeChild(element);
			clearInterval(interval);
		}
	}, 10);
}

let repeatToggle = true;

document.addEventListener('keydown', (e) => {//keydown without repeats
	if (repeatToggle) {//code goes here
		repeatToggle = false;
		if (e.key == ' ' && !nameEditState) {//click muffin on space
			e.preventDefault();
			muffinClick();
			const element = document.querySelector('.IMG-container');
			muffinClickMsgDisplayer(parseInt(window.getComputedStyle(element).left), parseInt(window.getComputedStyle(element).top));
		}
	}
});

document.addEventListener('keyup', () => {//disable repeat button clicks
	if (!repeatToggle) repeatToggle = true;
});

let isCtrl = false;
document.onkeydown = (e) => {//save on ctrl+s
	if (e.key == 'Control') isCtrl = true;
	if (e.key == 's' && isCtrl) {
		SaveFile.write(JSON.stringify(gameData))
		return false;
	}
}

let nameEditState = false;
let nameEditToggleState = false;
const nameTXT = document.querySelector('#nameTXT');

function nameEditToggle() {//enable name edit
	if (nameEditState) return;
	nameEditState = true;
	nameEditToggleState = true;
	nameTXT.style.color = nameEditState ? 'rgb(255, 255, 255, 1)' : 'rgb(255, 255, 255, 0.8)';
	nameTXT.style.setProperty('--cursor-backgroundColor', 'rgb(255, 255, 255, 1)');
	nameBackground.style.setProperty('--nameBackground-width', '45px');
	nameBackground.style.setProperty('--nameBackground-content', 'url(img/dice.png)');
	nameBackground.style.setProperty('--nameBackground-cursor', 'pointer');
	toggleCursorAnimation();
	setTimeout(() => {
		nameEditToggleState = false;
	}, 50);
}

const nameBackground = document.querySelector('.nameBackground');

nameBackground.addEventListener('click', (e) => {//create new random name
	if (nameEditState && e.offsetX > nameBackground.offsetWidth && e.offsetX < nameBackground.offsetWidth + 35) {
		nameEditToggleState = true;
		gameData.name = createName();
		document.getElementById('nameTXT').innerHTML = gameData.name;
		setTimeout(() => {
			nameEditToggleState = false;
		}, 50);
	}
});

document.addEventListener('click', () => {//global click actions
	if (nameEditState && !nameEditToggleState) {//disable name edit
		nameEditState = false;
		nameTXT.style.color = nameEditState ? 'rgb(255, 255, 255, 1)' : 'rgb(255, 255, 255, 0.8)';
		nameTXT.style.setProperty('--cursor-backgroundColor', 'rgb(0, 0, 0, 0)');
		nameBackground.style.setProperty('--nameBackground-width', '10px');
		nameBackground.style.setProperty('--nameBackground-content', '\'\'');
		nameBackground.style.setProperty('--nameBackground-cursor', 'default');
		toggleCursorAnimation();
	}
});

const validLetters = {
	lowerCase: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
	upperCase: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
	numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
	symbols: [' ', ',', '.', '?', '_', '[', ']', '(', ')', '{', '}', '-', '=', '+', '/', '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '|', '<', '>', ';', ':', '\'', '"']
}

document.addEventListener('keydown', (e) => {//keydown with repeats
	if (nameEditState) {//edit name
		let inclusion = false;
		for (const value of Object.values(validLetters)) {//check if input is valid
			if (value.includes(e.key)) {
				inclusion = true;
				break;
			}
		}
		if (inclusion && parseInt(window.getComputedStyle(document.querySelector('#nameTXT')).width) <= 500) {//add valid key
			if (e.key == ':') {//evaluate possible expression
				const expression = findSubString(gameData.name + e.key, ':');
				gameData.name += e.key;
				try {
					var result = (!expression.includes('gameData')) ? eval(expression) : null;
				} catch {
					var result = null;
				}
				if (result != null) gameData.name = gameData.name.slice(0, -(expression.length + 2)) + result;
			} else {//add normal character
				gameData.name += e.key;
			}
			nameTXT.style.setProperty('--cursor-backgroundColor', 'rgb(255, 255, 255, 1)');
			nameTXT.innerHTML = gameData.name.replaceAll(' ', '&nbsp;');
		} else if (e.key == 'Backspace') {//remove last character
			gameData.name = gameData.name.slice(0, -1);
			nameTXT.style.setProperty('--cursor-backgroundColor', 'rgb(255, 255, 255, 1)');
			nameTXT.innerHTML = gameData.name.replaceAll(' ', '&nbsp;');
		} else if (e.key == 'Enter') {//disable name edit
			toggleCursorAnimation();
			nameEditState = false;
			nameTXT.style.color = nameEditState ? 'rgb(255, 255, 255, 1)' : 'rgb(255, 255, 255, 0.8)';
			nameTXT.style.setProperty('--cursor-backgroundColor', 'rgb(0, 0, 0, 0)');
			document.querySelector('.nameBackground').style.setProperty('--nameBackground-width', '10px');
			document.querySelector('.nameBackground').style.setProperty('--nameBackground-content', '\'\'');
			document.querySelector('.nameBackground').style.setProperty('--nameBackground-cursor', 'default');
		}
	}
});

function findSubString(str, start, end = start) {//find math expresions within a string
	const arr = String(str).split(''); let bool = false;
	if (arr.filter((bin) => {if (bin == start || bin == end) return bin}).length == 2) {//brackets exist
		return arr.map((bin) => {//return sub string
			if (bin == start || bin == end) bool = !bool;
			else if (bool) return bin;
		}).filter((bin) => {//remove nulls
			if (bin != null) return bin;
		}).join('');
	} else return '';
}

let cursorAnimation = undefined;

function toggleCursorAnimation() {//flashing cursor animation
	if (cursorAnimation == undefined) {//enable animation
		let state = true;
		cursorAnimation = setInterval(() => {//blinker
			state = !state;
			nameTXT.style.setProperty('--cursor-backgroundColor', (state) ? 'rgb(255, 255, 255, 1)' : 'rgb(255, 255, 255, 0)');
		}, 500);
	} else if (cursorAnimation != undefined) {//disable animation
		clearInterval(cursorAnimation);
		cursorAnimation = undefined;
	}
}

function sell() {//toggle sell state
	gameData.sellState = !gameData.sellState;
	document.getElementById('sellButton').style.backgroundColor = gameData.sellState ? 'lightgreen' : '#FF4A3F';
}

function borderChange(id) {//changes borders
	document.getElementById(id).style.border = 'inset';
}

setInterval(() => {//interval updater
	document.querySelector('#mufCount').innerHTML = suffixApplier(gameData.muffinCount);
	document.querySelector('#MPS').innerHTML = suffixApplier(gameData.MPS);
	document.querySelector('#tickets-counter').innerHTML = suffixApplier(gameData.arcade.tickets);
	gameData.muffinCount += gameData.MPS / 10;
}, 100);

const title = document.getElementById('muffinMasherTitle');

setInterval(() => {//title updater
	const txt = suffixApplier(gameData.muffinCount);
	if (txt != 'Infinity' && txt != '-Infinity') {
		title.innerHTML = `${txt} Muffins - Muffin Masher`;
	} else {
		title.innerHTML = (isPositive(gameData.muffinCount)) ? 'Infinite Muffins - Muffin Masher' : '-Infinite Muffins - Muffin Masher';
	}
}, 5000);

/**@param inputs object with "name" string and any return "val"*/ function getConfirmModalResponse(title, ...inputs) {
	return new Promise((resolve, reject) => {
		if (document.querySelector('.confirm-modal') != null) return reject('two or more instances cannot coexist');
		document.body.appendChild(document.querySelector('#confrim-modal-template').content.cloneNode(true));
		const confirm = document.querySelector('.confirm-backdrop');
		confirm.querySelector('#confirm-txt').innerHTML = title;
		confirm.querySelector('#confirm-cancel-modal').addEventListener('click', () => {//exit without error | cancel
			document.body.removeChild(confirm);
			return reject(0);
		});
		for (const obj of inputs) {//add resolve inputs
			const element = document.createElement('p');
			element.innerHTML = obj.name;
			element.addEventListener('click', () => {//return val
				document.body.removeChild(confirm);
				return resolve(obj.val);
			}, {once: true});
			confirm.querySelector('.confirm-inputs-container').appendChild(element);
		}
	});
}
	//muffin count formatting system
function Formatter(input = '', positve = isPositive(input)) {//formats given value
	const abbrev = ['', '', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quattuordecillion', 'Quindecillion', 'Sexdecillion', 'Septemdecillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion', 'Unvigintillion', 'Duovigintillion', 'Trevigintillion', 'Quattuorvigintillion'];
	if (input.length < abbrev.length * 3 + 1 && input != '∞') {
		const unrangifiedOrder = Math.floor(Math.log10(Math.abs(input)) / 3);
		const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length - 1));
		const str = `${parseFloat((input / Math.pow(10, order * 3)).toFixed(2))} ${abbrev[order]}`;
		return (positve) ? str : `-${str}`;
	} else {
		return (positve) ? 'Infinity' : '-Infinity';
	}
}

function suffixApplier(input = 0) {//shortens value and adds suffixes
	if (Number(input) != String(input)) throw new Error(`invalid input type: ${typeof input}`);
	const number = Math.round(Math.abs(input));
	if (number >= 1e+6 || number <= -1e+6) {//only formats if more than a million
		return Formatter((number).toLocaleString('fullwide', {useGrouping: false}), isPositive(input));
	} else {//less than a million
		return (isPositive(input) ? '' : '-') + parseInt(number).toLocaleString('fullwide', {useGrouping: true});
	}
}

function isPositive(val) {//returns if passed value is positve
	return (Math.abs(val) == val);
}

let clickCountUp = 0;

function AutoClickerCheck() {//auto clicker detection system
	if (gameData.autoClicker.state && clickCountUp >= 30 && !gameData.autoClicker.firstWarning && !gameData.autoClicker.secondWarning) {
		clickCountUp = 0;
		gameData.autoClicker.firstWarning = true;
		alert('Auto-clicker has been detected. This is your first warning.');
	} else if (gameData.autoClicker.state && clickCountUp >= 30 && gameData.autoClicker.firstWarning && !gameData.autoClicker.secondWarning) {
		clickCountUp = 0;
		gameData.autoClicker.firstWarning = true;
		gameData.autoClicker.secondWarning = true;
		alert('Auto-clicker has been detected. This is your second and final warning');
	} else if (gameData.autoClicker.state && clickCountUp >= 30 && gameData.autoClicker.firstWarning && gameData.autoClicker.secondWarning) {
		clickCountUp = 0;
		localStorage.removeItem('saveData');
		setInterval(() => {//disciplinary actions
			document.write('I warned you.');
		}, 25);
	} else {
		clickCountUp = 0;
	}
}
	//multiple buy system
function multiBuyStateCheck(number = gameData.multiBuyAmount) {//display different costs based on multiBuyAmount
	if (number != 1 && number != 10 && number != 100) throw new Error(`invalid number: ${number}`);
	gameData.multiBuyAmount = number;
	document.querySelector('#multi-buy-1').style.fontWeight = (number == 1) ? 'bold' : 'normal';
	document.querySelector('#multi-buy-10').style.fontWeight = (number == 10) ? 'bold' : 'normal';
	document.querySelector('#multi-buy-100').style.fontWeight = (number == 100) ? 'bold' : 'normal';
	gameData.upgradeClicker.element.querySelector('#price').innerHTML = suffixApplier(costCalc(gameData.upgradeClicker.cost));
	for (let i = 0; i < gameData.producers.length; i++) {
		gameData.producers[i].element.querySelector('#price').innerHTML = suffixApplier(costCalc(gameData.producers[i].cost));
	}
}

function costCalc(number, iterations = gameData.multiBuyAmount) {//calculates the cost of a given value
	let total = Math.round(number);
	for (let i = 0; i < iterations - 1; i++) {
		number = Math.round(number * 1.1);
		total += number;
	}
	return total;
}
	//frenzy system
setTimeout(() => {//5 minute game delay
	gameData.frenzySys.gameState = true;
}, 300000);

setInterval(() => {//interval frenzy updater
	if (gameData.frenzySys.gameState) {
		if (gameData.frenzySys.countUp >= gameData.frenzySys.timer && !gameData.frenzySys.activeState) {
			gameData.frenzySys.countUp = 0;
			if (Math.floor(Math.random() * gameData.frenzySys.RNGlimit) != 0) {//make sure element is hidden
				document.querySelector('#muffin-IMG-2-ID').style.display = 'none';
			} else ExeFrenzy();
		} else if (gameData.frenzySys.countUp < gameData.frenzySys.timer && !gameData.frenzySys.activeState) {
			gameData.frenzySys.countUp++;
		}
	}
}, 1000);

function ExeFrenzy() {
	gameData.frenzySys.activeState = true;
	document.querySelector('#muffin-IMG-2-ID').style.left = `${Math.floor(Math.random() * (1750 - 50)) + 50}px`;
	document.querySelector('#muffin-IMG-2-ID').style.top = `${Math.floor(Math.random() * (770 - 50)) + 50}px`;
	document.querySelector('#muffin-IMG-2-ID').style.opacity = '100%';
	document.querySelector('#muffin-IMG-2-ID').style.visibility = 'visible';
	setTimeout(() => {
		let opacity = 85;
		const interval = setInterval(() => {//fade animation
			opacity--;
			document.querySelector('#muffin-IMG-2-ID').style.opacity = `${opacity}%`;
			if (opacity <= 0) {//fade is done
				document.querySelector('#muffin-IMG-2-ID').style.visibility = 'hidden';
				gameData.frenzySys.activeState = false;
				clearInterval(interval);
			}
		}, 66); //5sec / 75
	}, 10000); //10sec
}

const frenzyStates = {
	productionBoost: false,
	costRedux: false
};

function Muffin2Click(number) {//apply frenzy effect
	SaveFile.write(JSON.stringify(gameData))
	gameData.frenzySys.activeState = true;
	document.querySelector('#muffin-IMG-2-ID').style.visibility = 'hidden';
	const buffChoice = (number != undefined) ? number : Math.floor(Math.random() * 3) + 1;
	if (buffChoice == 1) {//production boost
		addChild('Production Boost');
		frenzyStates.productionBoost = true;
		gameData.MPS = gameData.MPS * 5;
		document.getElementById('MPS').style.color = 'red';
		document.getElementById('MPS-txt').style.color = 'red';
		document.getElementById('MPS').style.fontWeight = '700';
		document.getElementById('MPS-txt').style.fontWeight = '700';
		update();
		setTimeout(() => {
			frenzyStates.productionBoost = false;
			gameData.frenzySys.activeState = false;
			gameData.MPS = gameData.MPS / 5;
			document.getElementById('MPS').style.color = 'white';
			document.getElementById('MPS-txt').style.color = 'white';
			document.getElementById('MPS').style.fontWeight = '500';
			document.getElementById('MPS-txt').style.fontWeight = '500';
			update();
		}, 60000);
		function update() {
			for (let i = 0; i < gameData.producers.length; i++) {
				gameData.producers[i].productionBoost();
			}
		}
	} else if (buffChoice == 2) {//cost reduction
		frenzyStates.costRedux = true;
		addChild('Cost Reduction');
		update();
		multiBuyStateCheck(gameData.multiBuyAmount);
		setTimeout(() => {
			frenzyStates.costRedux = false;
			gameData.frenzySys.activeState = false;
			update();
			multiBuyStateCheck(gameData.multiBuyAmount);
		}, 60000);
		function update() {
			for (let i = 0; i < gameData.producers.length; i++) {
				gameData.producers[i].frenzyCostRedux();
			}
		}
	} else if (buffChoice == 3) {//gift
		gameData.frenzySys.activeState = false;
		switch (Math.floor(Math.random() * 3) + 1) {
			case 1: var gift = 300; break; //5 minutes worth
			case 2: var gift = 600; break; //10 minutes worth
			case 3: var gift = 900; break; //15 minutes worth
		}
		addChild(`+ ${suffixApplier(gameData.MPS * gift)}`);
		gameData.muffinCount += gameData.MPS * gift;
	}
	function addChild(msg) {
		const X = document.getElementById('muffin-IMG-2-ID').offsetLeft + 75;
		let Y = document.getElementById('muffin-IMG-2-ID').offsetTop;
		const element = document.createElement('p');
		document.querySelector('.wrapper').appendChild(element);
		element.className = 'frenzy-txt';
		element.style.left = `${X}px`;
		element.style.top = `${Y}px`;
		element.innerHTML = msg;
		let opacity = 110;
		const interval = setInterval(() => {
			opacity--;
			Y -= 0.5;
			element.style.opacity = `${opacity}%`;
			element.style.top = `${Y}px`;
			if (opacity == 0) {
				document.querySelector('.wrapper').removeChild(element);
				clearInterval(interval);
			}
		}, 10);
	}
}
	//skin system
const skinsModal = document.querySelector('#skin-modal');
const openSkinModal = document.querySelector('#open-skins');
const closeSkinModal = document.querySelector('#close-skins');

function getSkinPaymentMethod() {
	return new Promise((resolve, reject) => {
		document.querySelector('.purchase-options').style.visibility = 'visible';
		document.querySelector('.purchase-options-backdrop').style.visibility = 'visible';
		document.querySelector('.purchase-options').addEventListener('click', (e) => {
			document.querySelector('.purchase-options > .inputs > #purchase-muffins-btn').style.border = 'outset';
			document.querySelector('.purchase-options > .inputs > #purchase-tickets-btn').style.border = 'outset';
			switch (e.target) {
				case document.querySelector('.purchase-options > .inputs > #purchase-muffins-btn'): resolve('muffins'); break;
				case document.querySelector('.purchase-options > .inputs > #purchase-tickets-btn'): resolve('tickets'); break;
				case document.querySelector('.purchase-options > #purchase-cancel-btn'): reject(0); break;
			}
			document.querySelector('.purchase-options').style.visibility = 'hidden';
			document.querySelector('.purchase-options-backdrop').style.visibility = 'hidden';
		}, {once: true});
	});
}

openSkinModal.addEventListener('click', () => {//show skins modal
	openSkinModal.style.border = 'outset';
	skinsModal.showModal();
});

closeSkinModal.addEventListener('click', () => {//hide skins modal
	skinsModal.close()
	document.getElementById('close-skins').style.border = 'outset';
});
	//casino system
const openCasinoBtn = document.querySelector('#open-casino');
const casinoModal = document.querySelector('.casino-modal');
const closeCasinoModal = document.querySelector('#casino-modal-close');
const casinoIframe = document.querySelector('#casino-iframe');
let casinoGameActive = false;

openCasinoBtn.addEventListener('click', () => {//open modal
	casinoIframe.src = 'assets/casino/casino-selector/casinoSelector.html';
	openCasinoBtn.style.border = 'outset';
	casinoModal.showModal();
});

closeCasinoModal.addEventListener('click', () => {//close modal
	if (casinoGameActive) return;
	SaveFile.write(JSON.stringify(gameData))
	casinoIframe.src = '';
	document.getElementById('casino-game-title-txt').innerHTML = '';
	casinoModal.close();
});

window.addEventListener('message', (msg) => {//evaluate messages from casino iframe
	const data = JSON.parse(msg.data);
	if (data.origin == 'casino') {//recieve data from casino
		switch (data.purpose) {
			case 'change-SRC': //change casino iframe source file address
				casinoIframe.src = data.newSRC;
				document.querySelector('#casino-game-title-txt').innerHTML = data.txt;
				break;
			case 'bet-afford-check': //check if bet exceeds current muffinCount
				let bool = false;
				switch (data.faction) {//faction check
					case 'black-jack': bool = (Number(data.val) <= gameData.muffinCount); break;
					case 'slots': bool = (Number(data.val) * 5000) <= gameData.muffinCount; break;
					case 'spinner': bool = (Number(data.val.inputBet) <= gameData.muffinCount); break;
					default: throw new Error(`invalid faction: ${data.faction}`);
				}
				if (bool) gameData.muffinCount -= (data.faction != 'spinner') ? Number(data.val) : Number(data.val.inputBet);
				casinoIframe.contentWindow.postMessage(JSON.stringify({purpose: 'bet-afford-check-response', bool: bool, val: data.val, src: data.src}), '*');
				break;
			case 'game-start': casinoGameActive = true; break; //lock modal if game is active
			case 'cash-out': //add proceedings to muffinCount
				gameData.muffinCount += data.val;
				casinoGameActive = false;
				SaveFile.write(JSON.stringify(gameData))
				document.querySelector('#casino-game-title-txt').innerHTML = '';
				casinoIframe.src = '';
				casinoModal.close();
				muffinCounterMsgDisplayer(data.val);
				break;
			default: throw new Error(`invalid purpose: ${data.purpose}`);
		}
	}
});
	//save transfer system
function stringEncrypter(str = '', method = 'encode', register = 16) {//converts ascii to hex and vice versa
	if (register < 2 || register > 36) throw new Error(`invalid register: ${register}`);
	if (method == 'encode') {//encode a string
		const cypher = Math.floor(Math.random() * (100 - 10) + 10);
		return [`[${enforceByteSize(cypher.toString(register), register)}]`, `{${hashGen(str, cypher)}}`, ...String(str).split('').map((bin) => {
			return enforceByteSize((bin.charCodeAt() + cypher).toString(register), register);
		}).reverse()].join(' ');
	} else if (method == 'decode') {//decode to string
		const cypher = parseInt(findSubString(str, '[', ']'), register) || (() => {throw new Error('cannot find cypher')})();
		const hash = findSubString(str, '{', '}') || (() => {throw new Error('cannot find hash code')})();
		const finalStr = String(str).split(' ').reverse().slice(0, -2).map((bin) => {//translate characters
			return String.fromCharCode(parseInt(bin, register) - cypher);
		}).join('');
		if (hashGen(finalStr, cypher) != hash) throw new Error(`invalid hash: ${hash}`);
		else return finalStr;
	} else throw new Error(`invalid method: ${method}`);
}

function enforceByteSize(str, register) {//adds zeros to stay within byte size
	const registerLength = (255).toString(register).length;
	while (String(str).length < registerLength) {
		str = '0' + str;
	}
	return String(str);
}

function hashGen (str, seed) {
	let h1 = 0xdeadbeef ^ seed;
	let h2 = 0x41c6ce57 ^ seed;
	for(let i = 0; i < str.length; i++) {
		h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
		h2 = Math.imul(h2 ^ str.charCodeAt(i), 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >> 16), 2246822507);
	h2 = Math.imul(h2 ^ (h2 >> 16), 2246822507);
	return (4294967296 * (2097151 & h2) + (h1 >> 0)).toString(32);
}

function getValidSaveCode(str) {//checks if imported save is valid
	try {
		const saveCode = stringEncrypter(str, 'decode', 16);
		if (!isJSON(saveCode)) throw new Error('invalid JSON string');
		Object.keys(JSON.parse(saveCode)).forEach((bin, i) => {
			if (bin != Object.keys(gameData)[i]) throw new Error('invalid save code 1');
		});
		if (Object.keys(JSON.parse(saveCode)).length < Object.keys(gameData).length) throw new Error('invalid save code 2');
		else return {bool: true, msg: 'resolved', val: saveCode};
	} catch (error) {
		return {bool: false, msg: String(error), val: ''};
	}
}

function isJSON(str) {//checks if string is a valid JSON string
	try {
		JSON.parse(str);
	} catch {
		return false;
	}
	return true;
}

document.querySelector('#transfer-save').addEventListener('click', () => {//open modal
	document.querySelector('#transfer-save').style.border = 'outset';
	document.querySelector('.save-transfer-modal').showModal();
});

document.querySelector('.save-transfer-modal-close-btn').addEventListener('click', () => {//close modal
	document.querySelector('.save-transfer-modal').close();
	document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-one', 'rgba(43, 110, 153, 1)');
	document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-two', 'rgba(43, 110, 153, 0)');
	document.querySelector('.save-transfer-modal-submit-btn').style.setProperty('--width', '55px');
	document.querySelector('.save-transfer-modal-sect1').style.visibility = 'visible';
	document.querySelector('.save-transfer-modal-sect2').style.visibility = 'hidden';
	document.querySelector('.save-transfer-modal-mode-toggle').dataset.state = 'import';
	document.querySelector('.save-transfer-modal-submit-btn').innerHTML = 'submit';
	document.querySelector('#save-transfer-modal-import-field').value = '';
	document.querySelector('#save-transfer-modal-export-field').value = '';
});

document.querySelector('.save-transfer-modal-mode-toggle').addEventListener('click', (e) => {//save transfer modal mode switch
	if (e.target == document.querySelector('.save-transfer-modal-mode-toggle > p:nth-child(1)')) {//import
		document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-one', 'rgba(43, 110, 153, 1)');
		document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-two', 'rgba(43, 110, 153, 0)');
		document.querySelector('.save-transfer-modal-submit-btn').style.setProperty('--width', '55px');
		document.querySelector('.save-transfer-modal-sect1').style.visibility = 'visible';
		document.querySelector('.save-transfer-modal-sect2').style.visibility = 'hidden';
		document.querySelector('.save-transfer-modal-mode-toggle').dataset.state = 'import';
		document.querySelector('.save-transfer-modal-submit-btn').innerHTML = 'Submit';
		document.querySelector('#save-transfer-modal-import-field').value = '';
		document.querySelector('#save-transfer-modal-export-field').value = '';
		document.querySelector('#save-transfer-modal-import-field').select();
	} else if (e.target == document.querySelector('.save-transfer-modal-mode-toggle > p:nth-child(2)')) {//export
		document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-one', 'rgba(43, 110, 153, 0)');
		document.querySelector('.save-transfer-modal-mode-toggle').style.setProperty('--pseudo-highlight-two', 'rgba(43, 110, 153, 1)');
		document.querySelector('.save-transfer-modal-submit-btn').style.setProperty('--width', '105px');
		document.querySelector('.save-transfer-modal-sect1').style.visibility = 'hidden';
		document.querySelector('.save-transfer-modal-sect2').style.visibility = 'visible';
		document.querySelector('.save-transfer-modal-mode-toggle').dataset.state = 'export';
		document.querySelector('.save-transfer-modal-submit-btn').innerHTML = 'Generate code';
		document.querySelector('#save-transfer-modal-import-field').value = '';
		document.querySelector('#save-transfer-modal-export-field').value = '';
	}
});

function submitSaveTransfer() {
	if (document.querySelector('.save-transfer-modal-mode-toggle').dataset.state == 'import') {//import
		const response = getValidSaveCode(document.querySelector('#save-transfer-modal-import-field').value);
		if (response.bool) {//input is valid save code
			if (confirm('Are you sure you want to import this save. This will delete the current game session')) {
				localStorage.setItem('saveData', stringEncrypter(response.val, 'encode', 36));
				location.reload();
			}
		} else {//display error message;
			const element = document.createElement('p');
			document.querySelector('#save-transfer-modal-import-field').value = '';
			element.innerHTML = response.msg;
			element.className = 'save-transfer-modal-err-msg';
			document.querySelector('.save-transfer-modal-body').appendChild(element);
			setTimeout(() => {
				let opacity = 100;
				const interval = setInterval(() => {//fade animation
					opacity--;
					element.style.opacity = `${opacity}%`;
					if (opacity <= 0) {//fade is done
						document.querySelector('.save-transfer-modal-body').removeChild(element);
						clearInterval(interval);
					}
				}, 10);
			}, 500);
		}
	} else if (document.querySelector('.save-transfer-modal-mode-toggle').dataset.state == 'export') {//export
		document.querySelector('#save-transfer-modal-export-field').value = stringEncrypter(JSON.stringify(gameData), 'encode', 16);
		document.querySelector('#save-transfer-modal-export-field').select();
	} else throw new Error(`invalid state: ${document.querySelector('.save-transfer-modal-mode-toggle').dataset.state}`);
}