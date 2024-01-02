"use strict";

class Bullet extends Entity {
	static instanceArr = [new Bullet()].filter(() => false);
	/**@private @param {string} elementID @param {number} velocity*/
	constructor(elementID, velocity) {
		super(elementID, velocity);
	}
	/**@param {number} velocity @param {number} direction @param {{x: number, y: number}} spawnPosition*/
	static spawn(velocity, direction, spawnPosition) {
		const element = document.createElement('img');
		element.src = './img/bullet.png';
		element.className = 'bullet';
		element.id = `bullet${Math.random().toString(16).slice(2)}`;

		element.style.setProperty('--direction', `${direction}deg`);
		element.style.top = `${spawnPosition.y}px`;
		element.style.left = `${spawnPosition.x}px`;

		document.querySelector('.wrapper').appendChild(element);

		const bullet = new Bullet(element.id, velocity);
		Bullet.instanceArr.push(bullet);
	}
	get inBounds() {
		const DOMRect = document.body.getBoundingClientRect();
		const entityRect = this.boundingBox;
		return !(entityRect.top > DOMRect.bottom || entityRect.right < DOMRect.left || entityRect.bottom < DOMRect.top || entityRect.left > DOMRect.right);
	}
	dispose() {//destructor
		Bullet.instanceArr.splice(Bullet.instanceArr.indexOf(this), 1);
		document.querySelector('.wrapper').removeChild(this.element);
	}
	/**@param {Asteroid} target*/
	#asteroidCollison(target) {
		const entityRect = this.boundingBox;
		const targetRect = target.boundingBox;
		if (!(entityRect.top > targetRect.bottom || entityRect.right < targetRect.left || entityRect.bottom < targetRect.top || entityRect.left > targetRect.right)) {
			target.dispose();
			return true;
		} else return false;
	}
	move() {
		if (Asteroid.instanceArr.some(bin => this.#asteroidCollison(bin)) || !this.inBounds) return this.dispose();
		super.move();
	}
}