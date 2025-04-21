"use strict";

/**@template T*/
class SwapBackArray {
	/**@type {T[]}*/ #data;

	get Length() {
		return this.#data.length;
	}

	/**@param {T[]?} vals*/
	constructor(vals) {
		this.#data = vals ?? [];
	}

	/**@returns {T} @param {number} idx*/
	At(idx) {
		return this.#data[idx];
	}

	/**@returns {void} @param {T} val*/
	Add(val) {
		this.#data.push(val);
	}

	/**@returns {void} @param {number} idx*/
	RemoveAt(idx) {
		if (idx < 0 || idx >= this.#data.length) throw new Error('[Index Bounds Exception] Attempted to remove element outside of array bounds');

		this.#data[idx] = this.#data.pop();
	}

	/**@returns {number?} @param {T} arg*/
	IndexOf(arg) {
		for (const [i, val] of this.#data.entries()) {
			if (val == arg) return i;
		}

		return null;
	}

	/**@returns {void} @param {T} arg*/
	Remove(arg) {
		const idx = this.IndexOf(arg);

		if (idx == null) throw new Error('[Element Not Found Exception] Attempted to remove element not in array');

		this.RemoveAt(idx);
	}

	/**@returns {bool} @param {T} arg*/
	Contains(arg) {
		for (const val of this.#data) {
			if (val == arg) return true;
		}

		return false;
	}

	/**@returns {T[]}*/
	ToArray() {
		return Object.assign([], this.#data);
	}

	/**@returns {void} @param {(bin: T, i: number) => void} func*/
	ForEach(func) {
		for (const [i, bin] of this.#data.entries()) {
			func(bin, i);
		}
	}

	/**@returns {T?} @param {(bin: T) => bool} pred*/
	Find(pred) {
		for (const bin of this.#data) {
			if (pred(bin)) return bin;
		}

		return null;
	}

	/**@returns {Generator<T>}*/
	*Enumerate() {
		for (const [_, bin] of this.#data.entries()) {
			yield bin;
		}
	}

	/**@returns {void}*/
	Clear() {
		this.#data = [];
	}
}

/**@static*/
class GlobalData {
	/**@type {SpaceShip}*/					static player;
	/**@type {ScoreBoardManager}*/			static scoreBoard;
	/**@type {bool}*/						static gameState = false;
	/**@type {number}*/						static TIME;

	/**@type {Element}*/					static playArea = document.querySelector('.play-area');
	/**@type {Element}*/					static fpsCounter = document.querySelector('.fps-counter');

	/**@type {SwapBackArray<Asteroid>}*/	static asteroids = new SwapBackArray();
	/**@type {SwapBackArray<Bullet>}*/		static bullets = new SwapBackArray();
	/**@type {SwapBackArray<Effect>}*/		static effects = new SwapBackArray();
	/**@type {SwapBackArray<Asteroid>}*/	static ammos = new SwapBackArray();
}

requestAnimationFrame(function loop(time) {
	const delta = time - GlobalData.TIME;
	GlobalData.fpsCounter.innerHTML = `${Math.round(1000 / delta)}fps`;
	GlobalData.TIME = time;

	if (GlobalData.gameState) {//actionable code
		GlobalData.player.move();
		Asteroid.spawn();
		GlobalData.scoreBoard.updateScoreBoard();
		Effect.spawn();
		Ammo.spawn();
		for (const asteroid of GlobalData.asteroids.Enumerate()) {
			asteroid.move();
		}
		for (const bullet of GlobalData.bullets.Enumerate()) {
			bullet.move();
		}
		for (const effect of GlobalData.effects.Enumerate()) {
			effect.move();
		}
		for (const ammo of GlobalData.ammos.Enumerate()) {
			ammo.move();
		}
	}

	requestAnimationFrame(loop);
});

document.querySelector('.game-start-btn').addEventListener('click', async () => {//start game | pre-game handler
	window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'game-start'}), '*');
	GlobalData.scoreBoard = await ScoreBoardManager.getConnection();
	GlobalData.gameState = true;
	GlobalData.player = SpaceShip.spawn(3, 4, 2, 3);
	document.querySelector('.game-start-modal').style.visibility = 'hidden';
});

function endGameHandler() {//perform actions to end game and set up next game
	GlobalData.gameState = false;
	GlobalData.player.dispose();

	Entity.disposeAll(GlobalData.asteroids);
	Entity.disposeAll(GlobalData.bullets);
	Entity.disposeAll(GlobalData.effects);
	Entity.disposeAll(GlobalData.ammos);

	document.body.appendChild(document.querySelector('#game-over-modal-template').content.cloneNode(true));
	document.querySelector('.game-over-txt').innerHTML = 'you died';
	document.querySelector('.game-over-tickets-earned').innerHTML = `${GlobalData.scoreBoard.getRoundTickets()}x`;
	document.querySelector('.game-over-inputs-container').addEventListener('click', (e) => {
		if (e.target == document.querySelector('#game-over-play-again')) {//reset for next game
			document.querySelector('.game-start-btn').click();
			document.body.removeChild(document.querySelector('.game-over-modal'));
		} else if (e.target == document.querySelector('#game-over-quit')) {//perform game exit actions
			window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'cash-out', val: ScoreBoardManager.TicketsEarned}), '*');
		}
	});
}