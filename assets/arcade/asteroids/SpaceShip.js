"use strict";

class SpaceShip extends Entity {
	/**@type {number[]}*/ static #animationPorts = new Array(10);
	#activeKeys = {
		W: false,
		A: false,
		S: false,
		D: false,
		SPACE: false
	};
	#const_Velocity;
	#const_RotationalVelocity;
	#shotTimer = 0;
	#invincible = false;
	#shields;
	#const_shields;
	#bombs;
	#const_bombs;
	#bombHits = 0;
	#canBomb = true;
	#bulletType = EffectTypes.DEFAULT;
	#ammo = 100;

	get BulletType() {
		return this.#bulletType;
	}

	get IsMaxShield() {
		return this.#shields == this.#const_shields;
	}

	get IsMaxBombs() {
		return this.#bombs == this.#const_bombs;
	}

	get inBounds() {
		const rect = this.boundingBox;
		return rect.top >= 0 && rect.left >= 0 && rect.bottom <= document.querySelector('.wrapper').clientHeight && rect.right <= document.querySelector('.wrapper').clientWidth;
	}

	/**@private @param {Element} element @param {number} velocity @param {number} rotationalVelocity @param {number} shields @param {number} bombs*/
	constructor(element, velocity, rotationalVelocity, shields, bombs) {
		super(element, velocity);
		this.#const_Velocity = velocity;
		this.rotationalVelocity = 0;
		this.#const_RotationalVelocity = rotationalVelocity;
		this.#shields = shields;
		this.#const_shields = shields;
		this.#bombs = bombs;
		this.#const_bombs = bombs;
	}

	/**@param {number} velocity @param {number} rotationalVelocity @param {number} shields @param {number} bombs*/
	static spawn(velocity, rotationalVelocity, shields, bombs) {
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

		const spaceship = new SpaceShip(element, velocity, rotationalVelocity, shields, bombs);
		spaceship.#attachUserControl();
		return spaceship;
	}

	/**@param {number} id_REF*/
	#removeAnimation(id_REF) {
		clearInterval(SpaceShip.#animationPorts[id_REF]);
		SpaceShip.#animationPorts[id_REF] = null;
	}

	/**@param {number} animation_PORT*/
	#addAnimation(animation_PORT) {
		for (let i = 0; i < SpaceShip.#animationPorts.length; i++) {//find available place for port address
			if (SpaceShip.#animationPorts[i] != null) continue;
			SpaceShip.#animationPorts[i] = animation_PORT;
			break;
		}
		const return_val = SpaceShip.#animationPorts.indexOf(animation_PORT);
		if (return_val == -1) throw new Error('cannot assign animation port address, out of bounds');
		return return_val;
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

	#checkCollisions() {
		for (const asteroid of Asteroid.InstanceArr) {
			if (!this.hasCollidedWith(asteroid) || this.#invincible) continue;

			asteroid.dispose();
			return this.#takeDamage();
		}

		for (const effect of Effect.InstanceArr) {
			if (!this.hasCollidedWith(effect)) continue;

			switch (effect.Type) {
				case EffectTypes.SHIELD: {//add 1 shield
					this.#shields++;
					const shield_element = document.createElement('img')
					shield_element.src = './img/effect.png';
					document.querySelector('#space-ship-shields-container').appendChild(shield_element);
					this.element.classList.add('shielded');
					break;
				}
				case EffectTypes.BOMB: {//add 1 bomb
					this.#bombs++;
					const shield_element = document.createElement('img')
					shield_element.src = './img/effect.png';
					document.querySelector('#space-ship-bombs-container').appendChild(shield_element);
					break;
				}
				default: {//bullet change
					this.#bulletType = effect.Type;
					break;
				}
			}

			const new_ammo = Math.round(Math.random() * (31 - 20) + 20) + this.#ammo;
			this.#ammo = (new_ammo > 100) ? 100 : new_ammo;

			effect.dispose();
			scoreBoard.addToScore(500);
		}

		for (const ammo of Ammo.InstanceArr) {
			if (!this.hasCollidedWith(ammo)) continue;

			const new_ammo = Math.floor(Math.random() * (8 - 3) + 3) + this.#ammo;
			this.#ammo = (new_ammo > 100) ? 100 : new_ammo;

			ammo.dispose();
			scoreBoard.addToScore(10);
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
				if (Math.floor(Math.random() * 2) == 0) Ammo.spawn(asteroid.position); //50% chance to spawn an ammo

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
		for (let i = 0; i < SpaceShip.#animationPorts.length; i++) this.#removeAnimation(i);
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
		if (--this.#shotTimer > 0 || this.#ammo <= 0) return;
		this.#shotTimer = 50; //default timer reset

		switch (this.#bulletType) {
			case EffectTypes.DEFAULT: {//use default timer reset
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				this.#ammo -= 1;
				break;
			}
			case EffectTypes.GIANT: {//Bullet contructor handles size change
				Bullet.spawn(this.#const_Velocity * 1.5, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 75;
				this.#ammo -= 1;
				break;
			}
			case EffectTypes.RAPID: {//shoot twice as fast and faster bullets
				Bullet.spawn(this.#const_Velocity * 2.5, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 25;
				this.#ammo -= 1;
				break;
			}
			case EffectTypes.SPREAD: {//use default timer reset
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				Bullet.spawn(this.#const_Velocity * 2, this.degrees + 15, this.position, this.#bulletType);
				Bullet.spawn(this.#const_Velocity * 2, this.degrees - 15, this.position, this.#bulletType);
				this.#ammo -= 3;
				break;
			}
			case EffectTypes.PIERCE: {//Bullet constructor handles pierce flag set
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 40;
				this.#ammo -= 1;
				break;
			}
			case EffectTypes.EXPLODE: {//Bullet constructor handles bullet destruction
				Bullet.spawn(this.#const_Velocity * 1.5, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 65;
				this.#ammo -= 2;
				break;
			}
			case EffectTypes.TRACKING: {//Bullet move method handles tracking
				if (Asteroid.InstanceArr.length == 0) { this.#shotTimer = 0; break; } //no tracking target available, don't spawn
				Bullet.spawn(this.#const_Velocity * 1.5, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 75;
				this.#ammo -= 5;
				break;
			}
			case EffectTypes.SPLIT: {//shoot a bullet in front and behind
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				Bullet.spawn(this.#const_Velocity * 2, (this.degrees + 180) % 360, this.position, this.#bulletType);
				this.#ammo -= 2;
				break;
			}
			case EffectTypes.FLAME: {//very fast shot speed, very short distence, & smaller bullets. Bullet constructor handles bullet destruction & size alteration
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				this.#shotTimer = 3;
				this.#ammo -= 0.25; //don't instantly consume all the user's ammo
				break;
			}
			default: {//not valid bullet type, fall back to default bullet type
				console.warn('invalid bullet type, falling back to default');
				this.#bulletType = EffectTypes.DEFAULT;
				Bullet.spawn(this.#const_Velocity * 2, this.degrees, this.position, this.#bulletType);
				this.#ammo -= 1;
				break;
			}
		}
	}

	move() {
		if (!this.inBounds) return endGameHandler();
		if (this.#bombHits <= 0) this.#canBomb = true;

		super.move();
		this.#rotate();
		this.#shoot();
		this.#checkCollisions();

		document.querySelector('#space-ship-ammo-count').innerHTML = String(Math.ceil(this.#ammo)).padStart(3, '0');
	}
}