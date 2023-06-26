"use strict";

setInterval(() => {//interval prestige updater
	AutoClickerCheck();
	gameData.prestigeSys.countUp += gameData.MPS;
	if (gameData.prestigeSys.countUp >= 50000) {
		gameData.prestigeSys.points += 1;
		gameData.prestigeSys.countUp = 0;
	}
	document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	prestigeTimer();
}, 1000);

function prestigeTimer() {//prestige cool down timer
	if (!gameData.prestigeSys.coolDown || gameData.prestigeSys.constCooldown) return;
	gameData.prestigeSys.clock.secs -= 1;
	if (gameData.prestigeSys.clock.secs <= 0) {
		gameData.prestigeSys.clock.mins -= 1;
		gameData.prestigeSys.clock.secs = 60;
	}
	if (gameData.prestigeSys.clock.secs == 60) {//display if min is #:00
		document.querySelector('#prestigeTimer').innerHTML = `You can prestige in ${gameData.prestigeSys.clock.mins+1}:00`;
	} else {//displays any other time
		document.querySelector('#prestigeTimer').innerHTML = `You can prestige in ${gameData.prestigeSys.clock.mins}:${(String(gameData.prestigeSys.clock.secs).length == 1) ? `0${gameData.prestigeSys.clock.secs}` : gameData.prestigeSys.clock.secs}`;
	}
	if (gameData.prestigeSys.clock.mins < 0) {//cool-down is done
		document.querySelector('#prestigeTimer').innerHTML = '';
		gameData.prestigeSys.coolDown = false;
	}
}

function SellButtonModal() {//toggle modal sell state
	gameData.prestigeSys.sellState = !gameData.prestigeSys.sellState;
	document.getElementById('SellButtonModal').style.backgroundColor = gameData.prestigeSys.sellState ? 'lightgreen' : '#FF4A3F';
}

const prestigeModal = document.querySelector('#prestige-modal');
const openPrestigeModal = document.querySelector('#open-prestige');
const closePrestigeModal = document.querySelector('#close-prestige');
const closePrestigeModal2 = document.querySelector('#close-prestige-2');

openPrestigeModal.addEventListener('click', () => {//show prestige modal
	prestigeModal.showModal();
	document.getElementById('open-prestige').style.border = 'outset';
});

closePrestigeModal.addEventListener('click', () => {//hide prestige modal
	prestigeModal.close();
	document.getElementById('prestige-confirm').style.visibility = 'hidden';
	document.getElementById('background-stopper').style.display = 'none';
	document.getElementById('close-prestige').style.border = 'outset';
});

closePrestigeModal2.addEventListener('click', () => {//hide prestige modal 2
	prestigeModal.close();
	document.getElementById('close-prestige-2').style.border = 'outset';
	document.getElementById('prestige-modal-2').style.visibility = 'hidden';
	prestigeCall();
});

const prestigeConfirmTrue = document.querySelector('#confirmTrue');
const prestigeconfirmFalse = document.querySelector('#confirmFalse');
const prestigeCheckBox = document.querySelector('#prestige-checkbox');
const prestigeNextModal = document.querySelector('#prestige-next-modal');

prestigeCheckBox.addEventListener('click', () => {//toggle do not show again
	gameData.prestigeSys.confirmToggleState = !gameData.prestigeSys.confirmToggleState;
});

prestigeConfirmTrue.addEventListener('click', () => {//prestige confirm state (YES)
	prestigeConfirmTrue.style.border = 'outset';
	document.getElementById('prestige-modal-2').style.visibility = 'visible';
	document.getElementById('prestige-confirm').style.visibility = 'hidden';
	document.getElementById('background-stopper').style.display = 'none';
});

prestigeconfirmFalse.addEventListener('click', () => {//prestige confirm state (NO)
	document.getElementById('prestige-confirm').style.visibility = 'hidden';
	document.getElementById('background-stopper').style.display = 'none';
	prestigeconfirmFalse.style.border = 'outset';
	prestigeModal.close();
});

prestigeNextModal.addEventListener('click', () => {//open prestige confirm state
	prestigeNextModal.style.border = 'outset';
	if (!gameData.prestigeSys.coolDown && !gameData.frenzySys.activeState) {
		if (gameData.prestigeSys.confirmToggleState == false) {
			document.getElementById('prestige-confirm').style.visibility = 'visible';
			document.getElementById('background-stopper').style.display = 'flex';
		} else if (gameData.prestigeSys.confirmToggleState == true) {
			document.getElementById('prestige-modal-2').style.visibility = 'visible';
		}
	}
});

function ModalOneBuy() {//value upgrader
	document.querySelector('.prestige-modal-producer:nth-child(1)').style.border = 'outset';
	if (!gameData.prestigeSys.sellState && gameData.prestigeSys.points >= gameData.prestigeSys.valueUpgrader.cost) {//buy
		gameData.prestigeSys.points -= gameData.prestigeSys.valueUpgrader.cost;
		gameData.prestigeSys.valueUpgrader.amount = gameData.prestigeSys.valueUpgrader.amount * 2;
		gameData.prestigeSys.valueUpgrader.cost = gameData.prestigeSys.valueUpgrader.cost * 2;
		document.getElementById('pwrMultiplier').innerHTML = gameData.prestigeSys.valueUpgrader.amount+ 'x';
		document.getElementById('pwrCost').innerHTML = `${suffixApplier(gameData.prestigeSys.valueUpgrader.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	} else if (gameData.prestigeSys.sellState && gameData.prestigeSys.valueUpgrader.amount > 1) {//sell
		gameData.prestigeSys.points += gameData.prestigeSys.valueUpgrader.cost / 4;
		gameData.prestigeSys.valueUpgrader.amount -= gameData.prestigeSys.valueUpgrader.amount / 2;
		gameData.prestigeSys.valueUpgrader.cost -= gameData.prestigeSys.valueUpgrader.cost / 2;
		document.getElementById('pwrMultiplier').innerHTML = gameData.prestigeSys.valueUpgrader.amount+ 'x';
		document.getElementById('pwrCost').innerHTML = `${suffixApplier(gameData.prestigeSys.valueUpgrader.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	}
	if (gameData.prestigeSys.valueUpgrader.cost < gameData.prestigeSys.valueUpgrader.minCost) {//ensures minimum cost
		gameData.prestigeSys.valueUpgrader.cost = gameData.prestigeSys.valueUpgrader.minCost;
		document.getElementById('pwrCost').innerHTML = `${suffixApplier(gameData.prestigeSys.valueUpgrader.cost)} pts`;
	}
}

function ModalTwoBuy() {//head start
	const maxLevel = (gameData.producers.length - 1) * 3;
	document.querySelector('.prestige-modal-producer:nth-child(2)').style.border = 'outset';
	if (!gameData.prestigeSys.sellState && gameData.prestigeSys.points >= gameData.prestigeSys.headStart.cost && gameData.prestigeSys.headStart.amount < maxLevel) {//buy
		gameData.prestigeSys.points -= gameData.prestigeSys.headStart.cost;
		gameData.prestigeSys.headStart.amount += 1;
		gameData.prestigeSys.headStart.cost = gameData.prestigeSys.headStart.cost * 2;
		document.getElementById('head-start-level').innerHTML = 'Lvl ' +gameData.prestigeSys.headStart.amount;
		document.getElementById('head-start-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.headStart.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		if (gameData.prestigeSys.headStart.amount >= maxLevel) {//max Lvl state
			document.getElementById('head-start-level').innerHTML = 'max Lvl';
		}
	} else if (gameData.prestigeSys.sellState && gameData.prestigeSys.headStart.amount > 0) {//sell
		gameData.prestigeSys.points += gameData.prestigeSys.headStart.cost / 4;
		gameData.prestigeSys.headStart.amount -= 1;
		gameData.prestigeSys.headStart.cost -= gameData.prestigeSys.headStart.cost / 2;
		document.getElementById('head-start-level').innerHTML = 'Lvl ' +gameData.prestigeSys.headStart.amount;
		document.getElementById('head-start-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.headStart.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	}
	if (gameData.prestigeSys.headStart.cost < gameData.prestigeSys.headStart.minCost) {//ensures minimum cost
		gameData.prestigeSys.headStart.cost = gameData.prestigeSys.headStart.minCost;
		document.getElementById('head-start-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.headStart.cost)} pts`;
	}
}

function ModalThreeBuy() {//cost reduction
	const maxLevel = 0.60;
	document.querySelector('.prestige-modal-producer:nth-child(3)').style.border = 'outset';
	if (!gameData.prestigeSys.sellState && gameData.prestigeSys.points >= gameData.prestigeSys.costRedux.cost && gameData.prestigeSys.costRedux.amount < maxLevel) {//buy
		gameData.prestigeSys.points -= gameData.prestigeSys.costRedux.cost;
		gameData.prestigeSys.costRedux.amount = parseFloat((gameData.prestigeSys.costRedux.amount + 0.01).toFixed(2));
		gameData.prestigeSys.costRedux.cost = gameData.prestigeSys.costRedux.cost * 2;
		document.getElementById('cost-redux-level').innerHTML = `${Math.round(gameData.prestigeSys.costRedux.amount * 100)}%`;
		document.getElementById('cost-redux-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.costRedux.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		if (gameData.prestigeSys.costRedux.amount >= maxLevel) {//max Lvl state
			document.getElementById('cost-redux-level').innerHTML = 'Max Lvl';
		}
	} else if (gameData.prestigeSys.sellState && gameData.prestigeSys.costRedux.amount > 0) {//sell
		gameData.prestigeSys.points += gameData.prestigeSys.costRedux.cost / 4;
		gameData.prestigeSys.costRedux.amount = parseFloat((gameData.prestigeSys.costRedux.amount - 0.01).toFixed(2));
		gameData.prestigeSys.costRedux.cost -= gameData.prestigeSys.costRedux.cost / 2;
		document.getElementById('cost-redux-level').innerHTML = `${Math.round(gameData.prestigeSys.costRedux.amount * 100)}%`;
		document.getElementById('cost-redux-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.costRedux.cost)} pts`;
		document.getElementById('prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.getElementById('prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
	}
	if (gameData.prestigeSys.costRedux.cost < gameData.prestigeSys.costRedux.minCost) {//ensures minimum cost
		gameData.prestigeSys.costRedux.cost = gameData.prestigeSys.costRedux.minCost;
		document.getElementById('cost-redux-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.costRedux.cost)} pts`;
	}
}

function prestigeCall() {//game reset
	gameData.prestigeSys.prestigeCount++;
	gameData.skins[1].unlockSkin();
	gameData.prestigeSys.sellState = false;
	document.getElementById('SellButtonModal').style.backgroundColor = '#FF4A3F';
	if (gameData.prestigeSys.prestigeCount >= 1) document.querySelector('#open-casino').style.visibility = 'visible';
	if (gameData.prestigeSys.prestigeCount >= 2) document.querySelector('#open-arcade').style.visibility = 'visible';
	gameData.prestigeSys.coolDown = true;
	gameData.prestigeSys.clock.mins = 5;
	gameData.prestigeSys.clock.secs = 0;
	gameData.upgradeClicker.cost = 50;
	gameData.upgradeClicker.amount = 0;
	gameData.upgradeClicker.element.querySelector('#price').innerHTML = suffixApplier(gameData.upgradeClicker.cost);
	gameData.upgradeClicker.element.querySelector('#counter').innerHTML = gameData.upgradeClicker.amount;
	gameData.muffinCount = 0;
	gameData.MPS = 0;
	const LvlArray = getHeadStartArray();
	for (let i = 0; i < gameData.producers.length; i++) {//prestige upgrades evaluator
		gameData.producers[i].costRedux();
		gameData.producers[i].valueUpgrade();
		if (gameData.prestigeSys.headStart.amount == LvlArray[i].Lvl1) {//head start level group 1
			gameData.producers[i].amount = 5;
			gameData.MPS += gameData.producers[i].each * 5;
		} else if (gameData.prestigeSys.headStart.amount == LvlArray[i].Lvl2) {//head start level group 2
			gameData.producers[i].amount = 10;
			gameData.MPS += gameData.producers[i].each * 10;
		} else if (gameData.prestigeSys.headStart.amount >= LvlArray[i].Lvl3) {//head start level group 3
			gameData.producers[i].amount = 15;
			gameData.MPS += gameData.producers[i].each * 15;
		} else {//head start default value
			gameData.producers[i].amount = 0;
		}
		gameData.producers[i].element.querySelector('#counter').innerHTML = gameData.producers[i].amount;
		gameData.producers[i].element.querySelector('#price').innerHTML = suffixApplier(gameData.producers[i].cost);
	}
	multiBuyStateCheck();
	document.getElementById('MPS').innerHTML = suffixApplier(gameData.MPS);
	document.getElementById('mufCount').innerHTML = suffixApplier(gameData.muffinCount);
}

function getHeadStartArray() {//get level array for headstart
	const arr = [];
	for (let i = 1; i < gameData.producers.length * 3; i += 3) {
		arr.push({Lvl1: i, Lvl2: i + 1, Lvl3: i + 2});
	}
	return arr;
}