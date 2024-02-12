"use strict";

class SpaceShip extends Entity {
	/**@type {number[]}*/ #animationPorts = new Array(10).fill(null);
	#activeKeys = {
		W: false,
		A: false,
		S: false,
		D: false
	};
	#const_Velocity;
	#const_RotationalVelocity;
	#shotTimer;
	#invincible = false;
	#shields;
	/**@private @param {string} elementID @param {number} velocity @param {number} rotationalVelocity @param {number} firerate @param {number} shields*/
	constructor(elementID, velocity, rotationalVelocity, firerate, shields) {
		super(elementID, velocity);
		this.#const_Velocity = velocity;
		this.rotationalVelocity = 0;
		this.#const_RotationalVelocity = rotationalVelocity;
		this.firerate = firerate;
		this.#shotTimer = firerate * 0.5;
		this.#shields = shields;
	}
	/**@param {number} velocity @param {number} rotationalVelocity @param {number} firerate @param {number} shields*/
	static spawn(velocity, rotationalVelocity, firerate, shields) {
		const element = document.createElement('img');
		element.src = './img/space-ship.png';
		element.draggable = false;
		element.style.left = '50%';
		element.style.top = '70%';
		element.id = `spaceship_${Math.random().toString(16).slice(2)}`;
		element.classList.add('space-ship');
		if (shields > 0) element.classList.add('shielded');

		for (let i = 0; i < shields; i++) {
			const shield_element = document.createElement('img')
			shield_element.src = './img/effect.png';
			document.querySelector('#space-ship-shields-container').appendChild(shield_element);
		}

		document.querySelector('.space-ship-stats').style.visibility = 'visible';
		document.querySelector('.play-area').appendChild(element);

		const spaceship = new SpaceShip(element.id, velocity, rotationalVelocity, firerate, shields);
		spaceship.#attachUserControl();
		return spaceship;
	}
	/**@param {number} id_REF*/
	#removeAnimation(id_REF) {
		clearInterval(this.#animationPorts[id_REF]);
		this.#animationPorts[id_REF] = null;
	}
	/**@param {number} animation_PORT*/
	#addAnimation(animation_PORT) {
		for (let i = 0; i < this.#animationPorts.length; i++) {//find available place for port address
			if (this.#animationPorts[i] != null) continue;
			this.#animationPorts[i] = animation_PORT;
			break;
		}
		const return_val = this.#animationPorts.indexOf(animation_PORT);
		if (return_val == -1) throw new Error('cannot assign animation port address, out of bounds');
		return return_val;
	}
	get inBounds() {
		const rect = this.boundingBox;
		return rect.top >= 0 && rect.left >= 0 && rect.bottom <= document.querySelector('.wrapper').clientHeight && rect.right <= document.querySelector('.wrapper').clientWidth;
	}
	/**@param {number} timespan*/
	#goInvincible(timespan) {
		this.#invincible = true;
		const animation_REF = this.#addAnimation(setInterval(() => this.element.style.visibility = (window.getComputedStyle(this.element).visibility == 'visible') ? 'hidden' : 'visible', 200));
		const timeout_REF = this.#addAnimation(setTimeout(() => {
			this.#invincible = false;
			this.#removeAnimation(animation_REF);
			this.#removeAnimation(timeout_REF);
			this.element.style.visibility = 'visible';
		}, timespan));
	}
	#takeDamage() {
		if (this.#shields-- <= 0) return endGameHandler();

		this.#goInvincible(1000);
		const element = document.querySelector('#space-ship-shields-container');
		while (element.childNodes.length > this.#shields) element.removeChild(element.firstChild);
		if (this.#shields == 0) this.element.classList.remove('shielded');
	}
	#checkCollisions () {
		for (const element of document.querySelectorAll('.play-area > *')) {//search for collidable objects
			const targetRect = element.getBoundingClientRect();
			const entityRect = this.boundingBox;
			if (entityRect.top > targetRect.bottom || entityRect.right < targetRect.left || entityRect.bottom < targetRect.top || entityRect.left > targetRect.right) continue; //collision didn't occur

			switch (element.id.split('_')[0]) {//handle collision
				case 'asteroid':
					if (this.#invincible) continue;
					const asteroid = Asteroid.instanceArr.filter(bin => bin.elementID == element.id)[0];
					if (asteroid.collide()) return this.#takeDamage();
					break;
				default: continue;
			}
		}
	}
	#attachUserControl() {
		document.addEventListener('keydown', (e) => {//perfrom action on key press
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = true;
			switch (e.key.toLocaleLowerCase()) {
				case 'w': this.velocity = this.#const_Velocity * 1.5; break;
				case 'a': this.rotationalVelocity = -this.#const_RotationalVelocity; break;
				case 's': this.velocity = this.#const_Velocity * 0.5; break;
				case 'd': this.rotationalVelocity = this.#const_RotationalVelocity; break;
			}
		});
		document.addEventListener('keyup', (e) => {//reset values when key is released
			if (['w', 'a', 's', 'd'].includes(e.key)) this.#activeKeys[e.key.toUpperCase()] = false;
			switch (e.key.toLocaleLowerCase()) {
				case 'w': (this.#activeKeys.S) ? this.velocity = this.#const_Velocity * 0.5 : this.velocity = this.#const_Velocity; break;
				case 'a': (this.#activeKeys.D) ? this.rotationalVelocity = this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
				case 's': (this.#activeKeys.W) ? this.velocity = this.#const_Velocity * 1.5 : this.velocity = this.#const_Velocity; break;
				case 'd': (this.#activeKeys.A) ? this.rotationalVelocity = -this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
			}
		});
	}
	dispose() {//destructor
		for (let i = 0; i < this.#animationPorts.length; i++) this.#removeAnimation(i);
		document.querySelector('#space-ship-shields-container').innerHTML = '';
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

		Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position);
	}
	move() {
		if (!this.inBounds) return endGameHandler();
		super.move();
		this.#rotate();
		this.#shoot();
		this.#checkCollisions();
	}
}