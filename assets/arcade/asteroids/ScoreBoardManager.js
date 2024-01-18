"use strict";

class ScoreBoardManager {
	static #ticketsEarned = 0;
	#score = 0;
	#highscore = 0;
	#ticketsReturned = false;
	/**@private @param {number} score @param {number} highscore*/
	constructor(score, highscore) {
		this.#score = score;
		this.#highscore = highscore;
	}
	static async getConnection() {
		const highscore = await ScoreBoardManager.#getHighscoreFromParent();
		document.querySelector('.score-board-container').style.visibility = 'visible';
		return new ScoreBoardManager(0, highscore);
	}
	/**@returns {Promise<number>}*/
	static async #getHighscoreFromParent() {
		let buffer;
		await new Promise((resolve, reject) => {
			window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'get-game-data', faction: 'asteroids'}), '*');
			window.addEventListener('message', (msg) => {
				const data = JSON.parse(msg.data);
				if (data.purpose == 'get-game-data-response') return resolve(data.gameData.highScore);
			}, {once: true});
			setTimeout(() => {return reject('TIMEOUT ERROR: unable to get highscore');}, 5000); //expire
		}).then(data => buffer = data).catch(err => {alert(err); buffer = 0});
		return buffer;
	}
	static get TicketsEarned() {
		return ScoreBoardManager.#ticketsEarned;
	}
	get #element() {
		return document.querySelector('.score-board-container');
	}
	getRoundTickets() {//NOTE: !mutates {ScoreBoardManager.#ticketsEarned}!
		if (this.#ticketsReturned) throw new Error('function already called | avoiding mutation');
		this.#ticketsReturned = true;
		const tickets = Math.round((this.#score / 100) * (Math.random() * (1.75 - 1.25) + 1.25) * ((this.#score > this.#highscore) ? 1.25 : 1));
		ScoreBoardManager.#ticketsEarned += tickets;
		return tickets;
	}
	/**@param {number} val*/
	#saveHighscore(val) {
		window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'save-highscore', faction: 'asteroids', val: val}), '*');
		window.addEventListener('message', (msg) => {
			const data = JSON.parse(msg.data);
			if (data.purpose == 'save-highscore-response' && data.val != val) this.#saveHighscore(val); //if value didn't save properly, try again
		}, {once: true});
	}
	/**@param {number} val*/
	addToScore(val) {
		this.#score += val;
		if (this.#score > this.#highscore) this.#saveHighscore(this.#score);
	}
	updateScoreBoard() {
		this.#element.querySelector('.score').innerHTML = `Score: ${this.#score}`;
		this.#element.querySelector('.high-score').innerHTML = `High Score: ${this.#highscore}`;
	}
}