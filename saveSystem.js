"use strict";

setInterval(() => {//saves every 5 minutes
	if (!casinoGameActive) SaveFile.write(JSON.stringify(gameData))
}, 3000000);

let saveMessageState = false;

class SaveFile {
	static write(data) {//write save file to local storage
		document.querySelector('#save-manual').style.border = 'outset';
		if (gameData.frenzySys.activeState || casinoGameActive) return;
		localStorage.setItem('saveData', stringEncrypter(data, 'encode', 36));
		if (!saveMessageState) {//display save notice
			saveMessageState = true;
			document.getElementById('saveMessageBackground').style.display = 'flex';
			document.getElementById('saveMessageBackground').style.opacity = '100%';
			setTimeout(() => {
				var opacity = 100;
				const interval = setInterval(() => {//fade animation
					opacity -= 1;
					document.getElementById('saveMessageBackground').style.opacity = `${opacity}%`;
					if (opacity <= 0) {//fade is done
						document.getElementById('saveMessageBackground').style.display = 'none';
						saveMessageState = false;
						clearInterval(interval);
					}
				}, 10);
			}, 500);
		}
	}
	static read() {//read save file
		return localStorage.getItem('saveData');
	}
	static clear(override = false) {//deletes save file
		document.getElementById('save-clear').style.border = 'outset';
		if (override) {
			localStorage.removeItem('saveData');
			location.reload();
		}
		getConfirmModalResponse('Are you sure? This cannot be reversed', {name: 'Yes', val: true}, {name: 'No', val: false}).then((bool) => {
			if (bool) {
				localStorage.removeItem('saveData');
				location.reload();
			} else return;
		}).catch((msg) => {
			if (msg != 0) console.error(msg);
			return;
		});
	}
	static reload() {
		document.getElementById('save-reload').style.border = 'outset';
		location.reload();
	}
}

void function saveRetrieve() {//loads save file if one is found
	let temp = SaveFile.read();
	if (temp != null) {//save data found
		temp = JSON.parse(stringEncrypter(temp, 'decode', 36));
		gameData = temp;
		gameData.upgradeClicker = new BaseProducer(temp.upgradeClicker.amount, temp.upgradeClicker.cost, 50, temp.upgradeClicker.id);
		gameData.upgradeClicker.element.querySelector('#price').innerHTML = suffixApplier(gameData.upgradeClicker.cost);
		gameData.upgradeClicker.element.querySelector('#counter').innerHTML = gameData.upgradeClicker.amount
		gameData.producers = temp.producers.map((bin) => {
			return new Producer(bin.amount, bin.cost, bin.constCost, bin.each, bin.constEach, bin.id).display();
		});
		document.querySelector('#sellButton').style.backgroundColor = gameData.sellState ? 'lightgreen' : '#FF4A3F';
		document.querySelector('#prestigePoints1').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.querySelector('#prestigePoints2').innerHTML = `You have ${suffixApplier(gameData.prestigeSys.points)} prestige points`;
		document.querySelector('#SellButtonModal').style.backgroundColor = gameData.prestigeSys.sellState ? 'lightgreen' : '#FF4A3F';
		document.querySelector('#pwrMultiplier').innerHTML = `${gameData.prestigeSys.valueUpgrader.amount}x`;
		document.querySelector('#pwrCost').innerHTML = `${suffixApplier(gameData.prestigeSys.valueUpgrader.cost)} pts`;
		document.querySelector('#head-start-level').innerHTML = 'Lvl ' +gameData.prestigeSys.headStart.amount;
		document.querySelector('#head-start-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.headStart.cost)} pts`;
		document.querySelector('#cost-redux-level').innerHTML = `${Math.round(gameData.prestigeSys.costRedux.amount * 100)}%`;
		document.querySelector('#cost-redux-cost').innerHTML = `${suffixApplier(gameData.prestigeSys.costRedux.cost)} pts`;
		gameData.skins = temp.skins.map((bin) => {
			return new SkinItem(bin.IMG, bin.lockState, bin.id, bin.currentSkin, bin.cost).display();
		});
		gameData.prestigeSys.clock.mins = temp.prestigeSys.clock.mins;
		gameData.prestigeSys.clock.secs = temp.prestigeSys.clock.secs;
		document.querySelector('.casino-modal-btn').style.visibility = (gameData.prestigeSys.prestigeCount >= 1) ? 'visible' : 'hidden';
		document.querySelector('#mufCount').innerHTML = suffixApplier(gameData.muffinCount);
		document.querySelector('#MPS').innerHTML = suffixApplier(gameData.MPS);
		document.querySelector('#nameTXT').innerHTML = gameData.name;
		multiBuyStateCheck();
		if (gameData.versionID != document.querySelector('#version-number-txt').innerHTML) {//check if version is out of date
			document.querySelector('#version-number-alert-id').style.visibility = 'visible';
		}
	} else {//no save data found
		console.warn('no save file found');
		gameData.name = createName();
		document.querySelector('#nameTXT').innerHTML = gameData.name;
		gameData.producers.forEach(bin => bin.display());
		gameData.skins.forEach(bin => bin.display());
	}
}();

document.querySelector('#version-number-alert-id').addEventListener('click', () => {//handle out of date version
	const titleStr = 'Your save file is out of date. This may cause undesirable results.<br>Do you wish to delete your save file?';
	getConfirmModalResponse(titleStr, {name: 'Yes', val: true}, {name: 'No', val: false}).then((bool) => {
		if (bool) SaveFile.clear(true);
	}).catch((msg) => {
		if (msg != 0) console.error(msg);
		return;
	});
});