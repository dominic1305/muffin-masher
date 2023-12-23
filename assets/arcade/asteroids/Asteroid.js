import Entity from "./Entity.js";

export default class Asteroid extends Entity {
	static asteroidArr = [new Asteroid()].filter(() => false);
	#inPlay = false;
	static #width = 39;
	static #maxAsteroids = 10;
	/**@param {string} elementID @param {number} velocity @param {number} direction*/
	constructor(elementID, velocity, direction) {
		super(elementID, velocity);
		this.direction = direction;
	}
	static spawnAsteroid() {//initiate new asteroid object
		if (Asteroid.asteroidArr.length >= Asteroid.#maxAsteroids) return; //too many asteroids
		const element = document.createElement('img');
		element.src = './img/asteroid.png';
		element.className = 'asteroid';
		element.id = `asteroid${Math.random().toString(16).slice(2)}`;

		const startX = (Math.floor(Math.random() * 1000) % 2 == 0) ? 0 - Asteroid.#width : document.body.clientWidth + Asteroid.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const endX = (startX < 0) ? document.body.clientWidth + Asteroid.#width : 0 - Asteroid.#width;
		const endY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = Asteroid.#getDirection(startX, startY, endX, endY);

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
	dispose() {
		Asteroid.asteroidArr[Asteroid.asteroidArr.indexOf(this)] = null;
		Asteroid.asteroidArr = Asteroid.asteroidArr.filter(bin => bin instanceof Asteroid);
		document.querySelector('.wrapper').removeChild(this.element);
	}
	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
	}
}