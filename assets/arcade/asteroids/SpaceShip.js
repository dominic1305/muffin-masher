"use strict";

class SpaceShip extends Entity {
	#activeKeys = {
		W: false,
		A: false,
		S: false,
		D: false
	};
	#const_Velocity;
	#const_RotationalVelocity;
	#shotTimer = 0;
	/**@private @param {string} elementID @param {number} velocity @param {number} rotationalVelocity @param {number} firerate*/
	constructor(elementID, velocity, rotationalVelocity, firerate) {
		super(elementID, velocity);
		this.#const_Velocity = velocity;
		this.rotationalVelocity = 0;
		this.#const_RotationalVelocity = rotationalVelocity;
		this.firerate = firerate;
		this.#shotTimer = firerate * 0.5;
	}
	/**@param {string} elementID @param {number} velocity @param {number} rotationalVelocity @param {number} firerate*/
	static spawn(elementID, velocity, rotationalVelocity, firerate) {
		const element = document.createElement('img');
		element.src = './img/space-ship.png';
		element.style.left = '50%';
		element.style.top = '50%';
		element.id = elementID;

		document.querySelector('.wrapper').appendChild(element);

		const spaceship = new SpaceShip(elementID, velocity, rotationalVelocity, firerate);
		spaceship.#attachUserControl();
		return spaceship;
	}
	#attachUserControl() {
		document.addEventListener('keydown', (e) => {//pefrom action on key press
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = true;
			switch (e.key) {
				case 'w': this.velocity = this.#const_Velocity * 1.5; break;
				case 'a': this.rotationalVelocity = -this.#const_RotationalVelocity; break;
				case 's': this.velocity = this.#const_Velocity * 0.5; break;
				case 'd': this.rotationalVelocity = this.#const_RotationalVelocity; break;
			}
		});
		document.addEventListener('keyup', (e) => {//reset values when key is released
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = false;
			switch (e.key) {
				case 'w': (this.#activeKeys.S) ? this.velocity = this.#const_Velocity * 0.5 : this.velocity = this.#const_Velocity; break;
				case 'a': (this.#activeKeys.D) ? this.rotationalVelocity = this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
				case 's': (this.#activeKeys.W) ? this.velocity = this.#const_Velocity * 1.5 : this.velocity = this.#const_Velocity; break;
				case 'd': (this.#activeKeys.A) ? this.rotationalVelocity = -this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
			}
		});
	}
	#rotate() {
		const newAngle = this.degrees + this.rotationalVelocity;
		this.element.style.transform = `translate(-50%, -50%) scale(2) rotate(${newAngle}deg)`;
	}
	#shoot() {
		this.#shotTimer++;
		if (this.#shotTimer <= this.firerate) return;
		this.#shotTimer = 0;

		Bullet.spawn(this.velocity * 1.5, this.degrees, this.position);
	}
	move() {
		if (!this.inBounds) throw new Error('entity is out of bounds');
		super.move();
		this.#rotate();
		this.#shoot();
	}
}