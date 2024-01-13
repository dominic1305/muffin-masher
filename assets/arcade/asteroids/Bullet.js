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
		element.draggable = false;
		element.className = 'bullet';
		element.id = `bullet_${Math.random().toString(16).slice(2)}`;

		element.style.setProperty('--direction', `${direction}deg`);
		element.style.top = `${spawnPosition.y}px`;
		element.style.left = `${spawnPosition.x}px`;

		document.querySelector('.play-area').appendChild(element);

		const bullet = new Bullet(element.id, velocity);
		Bullet.instanceArr.push(bullet);
	}
	static disposeAll() {
		for (const bullet of Bullet.instanceArr) {
			document.querySelector('.play-area').removeChild(bullet.element);
		}
		Bullet.instanceArr.splice(0, Bullet.instanceArr.length);
	}
	dispose() {//destructor
		Bullet.instanceArr.splice(Bullet.instanceArr.indexOf(this), 1);
		document.querySelector('.play-area').removeChild(this.element);
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