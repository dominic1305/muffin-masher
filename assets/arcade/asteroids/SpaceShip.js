import Entity from "./Entity.js";

export default class SpaceShip extends Entity {
	#activeKeys = {
		W: false,
		A: false,
		S: false,
		D: false
	};
	/**@private @param {string} elementID @param {number} velocity @param {number} rotationalVelocity*/
	constructor(elementID, velocity, rotationalVelocity) {
		super(elementID, 0);
		this.maxVelocity = velocity;
		this.rotationalVelocity = 0;
		this.maxRotationalVelocity = rotationalVelocity;
	}
	/**@param {string} elementID @param {number} velocity @param {number} rotationalVelocity*/
	static getSpaceShip(elementID, velocity, rotationalVelocity) {
		const element = document.createElement('img');
		element.src = './img/space-ship.png';
		element.style.left = '50%';
		element.style.top = '50%';
		element.id = elementID;
		document.querySelector('.wrapper').appendChild(element);
		const spaceship = new SpaceShip(elementID, velocity, rotationalVelocity);
		spaceship.#attachUserControl();
		return spaceship;
	}
	#attachUserControl() {
		document.addEventListener('keydown', (e) => {//pefrom action on key press
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = true;
			switch (e.key) {
				case 'w': this.velocity = this.maxVelocity; break;
				case 'a': this.rotationalVelocity = -this.maxRotationalVelocity; break;
				case 's': this.velocity = -this.maxVelocity; break;
				case 'd': this.rotationalVelocity = this.maxRotationalVelocity; break;
			}
		});
		document.addEventListener('keyup', (e) => {//reset values when key is released
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = false;
			switch (e.key) {
				case 'w': (this.#activeKeys.S) ? this.velocity = -this.maxVelocity : this.velocity = 0; break;
				case 'a': (this.#activeKeys.D) ? this.rotationalVelocity = this.maxRotationalVelocity : this.rotationalVelocity = 0; break;
				case 's': (this.#activeKeys.W) ? this.velocity = this.maxVelocity : this.velocity = 0; break;
				case 'd': (this.#activeKeys.A) ? this.rotationalVelocity = -this.maxRotationalVelocity : this.rotationalVelocity = 0; break;
			}
		});
	}
	rotate() {
		const newAngle = this.degrees + this.rotationalVelocity;
		this.element.style.transform = `translate(-50%, -50%) scale(2) rotate(${newAngle}deg)`;
	}
}