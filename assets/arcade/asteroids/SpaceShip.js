"use strict";

class SpaceShip extends Entity {
	/**@type {number[]}*/ #animationPorts = new Array(10).fill(null);
	#activeKeys = {
		W: false,
		A: false,
		S: false,
		D: false,
		SPACE: false
	};
	#const_Velocity;
	#const_RotationalVelocity;
	#shotTimer;
	#invincible = false;
	#shields;
	#bombs;
	#bombHits = 0;
	#canBomb = true;
	/**@private @param {string} elementID @param {number} velocity @param {number} rotationalVelocity @param {number} firerate @param {number} shields @param {number} bombs*/
	constructor(elementID, velocity, rotationalVelocity, firerate, shields, bombs) {
		super(elementID, velocity);
		this.#const_Velocity = velocity;
		this.rotationalVelocity = 0;
		this.#const_RotationalVelocity = rotationalVelocity;
		this.firerate = firerate;
		this.#shotTimer = firerate * 0.5;
		this.#shields = shields;
		this.#bombs = bombs;
	}
	/**@param {number} velocity @param {number} rotationalVelocity @param {number} firerate @param {number} shields @param {number} bombs*/
	static spawn(velocity, rotationalVelocity, firerate, shields, bombs) {
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

		for (let i = 0; i < bombs; i++) {
			const shield_element = document.createElement('img')
			shield_element.src = './img/effect.png';
			document.querySelector('#space-ship-bombs-container').appendChild(shield_element);
		}

		document.querySelector('.space-ship-stats').style.visibility = 'visible';
		document.querySelector('.play-area').appendChild(element);

		const spaceship = new SpaceShip(element.id, velocity, rotationalVelocity, firerate, shields, bombs);
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
					const asteroid = Asteroid.InstanceArr.filter(bin => bin.elementID == element.id)[0];
					if (asteroid.collide()) return this.#takeDamage();
					break;
				default: continue;
			}
		}
	}
	/**@returns {Generator<{distance: number, asteroid: Asteroid}>}*/
	*#getAsteroidDistances() {//enumerates distances of asteroids relative to spaceship location
		for (const asteroid of Asteroid.InstanceArr) {
			const relative_X = asteroid.position.x - this.position.x;
			const relative_Y = asteroid.position.y - this.position.y;
			yield { distance: relative_X / Math.cos(Math.atan2(relative_Y, relative_X)), asteroid: asteroid };
		}
	}
	#useBomb() {
		if (!this.#canBomb || this.#bombs <= 0) return;
		this.#bombs--;
		this.#canBomb = false;

		const bombCounter = document.querySelector('#space-ship-bombs-container');
		while (bombCounter.childNodes.length > this.#bombs) bombCounter.removeChild(bombCounter.firstChild);

		const shockwave = document.createElement('img');
		shockwave.classList = 'bomb-shockwave';
		shockwave.src = './img/shockwave.png';
		shockwave.style.top = `${this.position.y}px`;
		shockwave.style.left = `${this.position.x}px`;
		document.querySelector('.play-area').appendChild(shockwave);
		setTimeout(() => document.querySelector('.play-area').removeChild(shockwave), 500);

		Asteroid.toggleSpawns();
		for (const { distance, asteroid } of this.#getAsteroidDistances()) {
			if (distance > 512) continue; //out of shockwave range
			this.#bombHits++;
			setTimeout(() => {
				this.#bombHits--;
				if (Asteroid.InstanceArr.indexOf(asteroid) == -1) return; //asteroid has been destroyed already, pointer no longer exists
				asteroid.dispose();
				scoreBoard.addToScore(100);
			}, distance / 0.992); //shockwave velocity 0.992px/s
		}
		Asteroid.toggleSpawns();
	}
	#attachUserControl() {
		document.addEventListener('keydown', (e) => {//perfrom action on key press
			if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) this.#activeKeys[e.key.toUpperCase()] = true;
			switch (e.key.toLowerCase()) {
				case 'w': this.velocity = this.#const_Velocity * 1.5; break;
				case 'a': this.rotationalVelocity = -this.#const_RotationalVelocity; break;
				case 's': this.velocity = this.#const_Velocity * 0.5; break;
				case 'd': this.rotationalVelocity = this.#const_RotationalVelocity; break;
				case ' ': if (!this.#activeKeys.SPACE && gameState) { this.#useBomb(); this.#activeKeys.SPACE = true; } break;
			}
		});
		document.addEventListener('keyup', (e) => {//reset values when key is released
			if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) this.#activeKeys[e.key.toUpperCase()] = false;
			switch (e.key.toLowerCase()) {
				case 'w': (this.#activeKeys.S) ? this.velocity = this.#const_Velocity * 0.5 : this.velocity = this.#const_Velocity; break;
				case 'a': (this.#activeKeys.D) ? this.rotationalVelocity = this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
				case 's': (this.#activeKeys.W) ? this.velocity = this.#const_Velocity * 1.5 : this.velocity = this.#const_Velocity; break;
				case 'd': (this.#activeKeys.A) ? this.rotationalVelocity = -this.#const_RotationalVelocity : this.rotationalVelocity = 0; break;
				case ' ': this.#activeKeys.SPACE = false; break;
			}
		});
	}
	dispose() {//destructor
		for (let i = 0; i < this.#animationPorts.length; i++) this.#removeAnimation(i);
		document.querySelector('#space-ship-shields-container').innerHTML = '';
		document.querySelector('#space-ship-bombs-container').innerHTML = '';
		document.querySelector('.play-area').removeChild(this.element);
		player = null;
	}
	#rotate() {
		const newAngle = this.degrees + this.rotationalVelocity;
		this.element.style.transform = `translate(-50%, -50%) scale(2) rotate(${newAngle}deg)`;
	}
	#shoot() {
		if (++this.#shotTimer <= this.firerate) return;
		this.#shotTimer = 0;

		Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position);
	}
	move() {
		if (!this.inBounds) return endGameHandler();
		if (this.#bombHits <= 0) this.#canBomb = true;
		super.move();
		this.#rotate();
		this.#shoot();
		this.#checkCollisions();
	}
}