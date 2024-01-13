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
	/**@param {number} velocity @param {number} rotationalVelocity @param {number} firerate*/
	static spawn(velocity, rotationalVelocity, firerate) {
		const element = document.createElement('img');
		element.src = './img/space-ship.png';
		element.draggable = false;
		element.style.left = '50%';
		element.style.top = '70%';
		element.className = 'space-ship';
		element.id = `spaceShip_${Math.random().toString(16).slice(2)}`;

		document.querySelector('.play-area').appendChild(element);

		const spaceship = new SpaceShip(element.id, velocity, rotationalVelocity, firerate);
		spaceship.#attachUserControl();
		return spaceship;
	}
	get inBounds() {
		const rect = this.boundingBox;
		return rect.top >= 0 && rect.left >= 0 && rect.bottom <= document.querySelector('.wrapper').clientHeight && rect.right <= document.querySelector('.wrapper').clientWidth;
	}
	#attachUserControl() {
		document.addEventListener('keydown', (e) => {//perfrom action on key press
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
	dispose() {//destructor
		document.querySelector('.play-area').removeChild(this.element);
		player = null;
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
		if (!this.inBounds) return endGameHandler();
		super.move();
		this.#rotate();
		this.#shoot();
	}
}