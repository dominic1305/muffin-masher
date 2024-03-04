"use strict";

class Asteroid extends Entity {
	/**@type {Asteroid[]}*/ static #instanceArr = [];
	#inPlay = false;
	static #width = 39;
	static #maxAsteroids = 20;
	static #spawnTimer = 0;
	static #timerMax = 40;
	#collisions = 0;
	static #canSpawn = true;
	/**@type {number}*/ static #spawnBoolChecker;
	/**@private @param {string} elementID @param {number} velocity @param {number} direction*/
	constructor(elementID, velocity, direction) {
		super(elementID, velocity);
		this.direction = direction;
	}
	static get InstanceArr() {
		return Object.freeze(Asteroid.#instanceArr.map(bin => Object.freeze(bin)));
	}
	static spawn() {//initiate new asteroid object
		if (Asteroid.#instanceArr.length >= Asteroid.#maxAsteroids || ++Asteroid.#spawnTimer <= Asteroid.#timerMax || !this.#canSpawn) return; //too many asteroids | asteroid spawn recently | bomb going off
		Asteroid.#spawnTimer = 0;

		const element = document.createElement('img');
		element.src = './img/asteroid.png';
		element.draggable = false;
		element.className = 'asteroid';
		element.id = `asteroid_${Math.random().toString(16).slice(2)}`;

		const startX = (Math.floor(Math.random() * 1000) % 2 == 0) ? 0 - Asteroid.#width : document.body.clientWidth + Asteroid.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const endX = (startX < 0) ? document.body.clientWidth + Asteroid.#width : 0 - Asteroid.#width;
		const endY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = Asteroid.#getDirection(startX, startY, endX, endY);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		document.querySelector('.play-area').appendChild(element);

		const asteroid = new Asteroid(element.id, Math.random() * (3 - 2) + 2, degrees);
		Asteroid.#instanceArr.push(asteroid);
	}
	/**@param {number} startX @param {number} startY @param {number} endX @param {number} endY*/
	static #getDirection(startX, startY, endX, endY) {
		const angle = (Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)) + 90;
		return (angle < 0) ? angle + 360 : angle;
	}
	static disposeAll() {
		for (const asteroid of Asteroid.#instanceArr) {
			document.querySelector('.play-area').removeChild(asteroid.element);
		}
		Asteroid.#instanceArr.splice(0, Asteroid.#instanceArr.length);
	}
	static toggleSpawns() {
		this.#canSpawn = !this.#canSpawn;

		clearTimeout(this.#spawnBoolChecker);
		this.#spawnBoolChecker = setTimeout(() => {//spawner was not turned back on in time
			if (this.#canSpawn) return;
			this.#canSpawn = true;
			throw new Error('spawner not turned back on | turning back on');
		}, 2500);

		return this.#canSpawn;
	}
	collide() {
		if (++this.#collisions >= 10) {
			this.dispose();
			return true;
		} else return false
	}
	dispose() {//destructor
		Asteroid.#instanceArr.splice(Asteroid.#instanceArr.indexOf(this), 1);
		document.querySelector('.play-area').removeChild(this.element);
	}
	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
	}
}