import Entity from "./Entity.js";
import { player } from "./main.js";

export default class Asteroid extends Entity {
	static asteroidArr = [new Asteroid()].filter(() => false);
	#inPlay = false;
	static #width = 39;
	static #maxAsteroids = 20;
	static #spawnTimer = 0;
	static #timerMax = 40;
	#collisions = 0;
	/**@private @param {string} elementID @param {number} velocity @param {number} direction*/
	constructor(elementID, velocity, direction) {
		super(elementID, velocity);
		this.direction = direction;
	}
	static spawn() {//initiate new asteroid object
		Asteroid.#spawnTimer++;
		if (Asteroid.asteroidArr.length >= Asteroid.#maxAsteroids || Asteroid.#spawnTimer <= Asteroid.#timerMax) return; //too many asteroids | asteroid was spawn in last few frames
		Asteroid.#spawnTimer = 0;

		const element = document.createElement('img');
		element.src = './img/asteroid.png';
		element.className = 'asteroid';
		element.id = `asteroid${Math.random().toString(16).slice(2)}`;

		const startX = (Math.floor(Math.random() * 1000) % 2 == 0) ? 0 - Asteroid.#width : document.body.clientWidth + Asteroid.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = Asteroid.#getDirection(startX, startY, (startX < 0) ? document.body.clientWidth + Asteroid.#width : 0 - Asteroid.#width, Math.floor(Math.random() * document.body.clientHeight));

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		document.querySelector('.wrapper').appendChild(element);

		const asteroid = new Asteroid(element.id, Math.random() * (5 - 2) + 2, degrees);
		Asteroid.asteroidArr.push(asteroid);
	}
	get inBounds() {
		const DOMRect = document.body.getBoundingClientRect();
		const entityRect = this.boundingBox;
		return !(entityRect.top > DOMRect.bottom || entityRect.right < DOMRect.left || entityRect.bottom < DOMRect.top || entityRect.left > DOMRect.right);
	}
	/**@param {number} startX @param {number} startY @param {number} endX @param {number} endY*/
	static #getDirection(startX, startY, endX, endY) {
		const angle = (Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)) + 90;
		return (angle < 0) ? angle + 360 : angle;
	}
	get playerCollision() {
		const playerBoundary = player.boundingBox;
		const entityBoundary = this.boundingBox;
		return !(entityBoundary.top > playerBoundary.bottom || entityBoundary.right < playerBoundary.left || entityBoundary.bottom < playerBoundary.top || entityBoundary.left > playerBoundary.right);
	}
	dispose() {
		Asteroid.asteroidArr.splice(Asteroid.asteroidArr.indexOf(this), 1);
		document.querySelector('.wrapper').removeChild(this.element);
	}
	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
		if (this.playerCollision) this.#collisions++;
		if (this.#collisions >= 10) throw new Error('collison with player');
	}
}