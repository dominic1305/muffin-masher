"use strict";

class Asteroid extends Entity {
	#inPlay = false;
	static #width = 39;
	static #maxAsteroids = 20;
	static #spawnTimer = 0;
	static #timerMax = 40;
	static #canSpawn = true;
	/**@type {number}*/ static #spawnBoolChecker;

	/**@private @param {element} element @param {number} velocity*/
	constructor(element, velocity) {
		super(element, velocity);
	}

	static spawn() {//initiate new asteroid object
		if (GlobalData.asteroids.Length >= this.#maxAsteroids || ++this.#spawnTimer <= this.#timerMax || !this.#canSpawn) return; //too many asteroids | asteroid spawn recently | bomb going off
		this.#spawnTimer = 0;

		const element = document.createElement('img');
		element.src = './img/asteroid.png';
		element.draggable = false;
		element.className = 'asteroid';
		element.id = `asteroid_${Math.random().toString(16).slice(2)}`;

		const startX = (Math.floor(Math.random() * 2) == 0) ? -this.#width : document.body.clientWidth + this.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const endX = (startX < 0) ? document.body.clientWidth + this.#width : -this.#width;
		const endY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = this.getAngleToPoint(startX, startY, endX, endY);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		GlobalData.asteroids.Add(new Asteroid(element, Math.random() * (3 - 2) + 2));
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

	dispose() {//destructor
		super.dispose();
		GlobalData.asteroids.Remove(this);
	}

	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
	}
}