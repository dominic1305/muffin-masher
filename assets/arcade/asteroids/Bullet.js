"use strict";

class Bullet extends Entity {
	/**@type {Bullet[]}*/static #instanceArr = [];
	#pierce = false;
	#destructTimer = Number.MAX_VALUE; //large number to represent infinite timer
	#type;
	#explodable = false;
	/**@type {Readonly<Asteroid>?}*/ #trackingTarget;

	static get InstanceArr() {
		return Object.freeze(this.#instanceArr.map(bin => Object.freeze(bin)));
	}

	/**@private @param {element} element @param {number} velocity @param {Symbol} type*/
	constructor(element, velocity, type) {
		super(element, velocity);
		this.#type = type;
	}

	/**@param {number} velocity @param {number} direction @param {{x: number, y: number}} spawnPosition @param {Symbol} type*/
	static spawn(velocity, direction, spawnPosition, type) {
		const element = document.createElement('img');
		element.src = './img/bullet.png';
		element.draggable = false;
		element.className = 'bullet';
		element.id = `bullet_${Math.random().toString(16).slice(2)}`;

		element.style.setProperty('--direction', `${direction}deg`);
		element.style.top = `${spawnPosition.y}px`;
		element.style.left = `${spawnPosition.x}px`;
		element.style.filter = `hue-rotate(${Effect.getColour(type)}deg) brightness(2)`;

		const bullet = new Bullet(element, velocity, type);

		switch (type) {
			case EffectTypes.GIANT: {
				element.style.width = '20px';
				break;
			}
			case EffectTypes.PIERCE: {
				bullet.#pierce = true;
				break;
			}
			case EffectTypes.SPREAD: {
				bullet.#destructTimer = 50; //delete after 50 ticks (0.83s)
				break;
			}
			case EffectTypes.EXPLODE: {
				bullet.#destructTimer = 60; //delete after 60 ticks (1s)
				bullet.#explodable = true;
				break;
			}
			case EffectTypes.TRACKING: {
				bullet.#trackingTarget = this.#getClosestAsteroid(spawnPosition);
				break;
			}
			case EffectTypes.FLAME: {
				bullet.#destructTimer = 30; //delete after 40 ticks (0.5s)
				bullet.#pierce = true;
				element.style.width = '8px';
				break;
			}
		}

		document.querySelector('.play-area').appendChild(element);

		this.#instanceArr.push(bullet);

		return bullet;
	}

	static disposeAll() {
		for (const bullet of this.#instanceArr) {
			document.querySelector('.play-area').removeChild(bullet.element);
		}
		this.#instanceArr.splice(0, this.#instanceArr.length);
	}

	/**@param {{x: number, y: number}} position*/
	static #getClosestAsteroid(position) {
		if (Asteroid.InstanceArr.length == 0) return null; //no asteroids exist

		return Asteroid.InstanceArr.map((bin) => {
			const relative_X = bin.position.x - position.x;
			const relative_Y = bin.position.y - position.y;
			return { distance: relative_X / Math.cos(Math.atan2(relative_Y, relative_X)), reference: bin };
		}).sort((a, b) => a.distance - b.distance)[0].reference;
	}

	dispose() {//destructor
		Bullet.#instanceArr.splice(Bullet.#instanceArr.indexOf(this), 1);
		document.querySelector('.play-area').removeChild(this.element);
	}

	move() {
		if (!this.inBounds || --this.#destructTimer < 0) return this.dispose();

		const collidingAsteroid = Asteroid.InstanceArr.filter(bin => this.hasCollidedWith(bin))[0];
		if (collidingAsteroid != null) {//has collided with asteroid
			if (this.#type == EffectTypes.EXPLODE && this.#explodable) {//explode on contact
				const spacing = 360 / 12;

				for (let i = 0; i + i * spacing < 360; i++) {//spawn bullets in all directions
					const bullet = Bullet.spawn(this.velocity, this.degrees + spacing * i, this.position, EffectTypes.EXPLODE);
					bullet.#explodable = false;
				}
			}

			if (Math.floor(Math.random() * 2) == 0) {//50% chance to spawn an ammo
				Ammo.spawn(collidingAsteroid.position);
			}

			scoreBoard.addToScore(100);
			collidingAsteroid.dispose();
			if (!this.#pierce) return this.dispose();
		}

		tracking: if (this.#type == EffectTypes.TRACKING && this.#trackingTarget != null) {//has tracking target, change angle toward target
			if (document.querySelector(`#${this.#trackingTarget.element.id}`) == null) {//target no longer exists, remove target
				this.#trackingTarget = null;
				break tracking;
			}

			const x = this.#trackingTarget.position.x - this.position.x;
			const y = this.#trackingTarget.position.y - this.position.y;
			const sector = (x > 0 && y < 0) ? 0 : (x > 0 && y > 0) ? 1 : (x < 0 && y > 0) ? 2 : (x < 0 && y < 0) ? 3 : 3; //cartesian sectors [[3, 0], [2, 1]]

			let change = Math.atan2(Math.abs(y), Math.abs(x)) * (180 / Math.PI) + (90 * sector) - this.degrees; //[relative arctangent] * [rad to deg ratio] + [cartesian offset] - [current degrees]

			if (change > 180) change = -180 + (change % 180); //if change is too far clockwise, go anticlockwise instead. take shortest path

			change = (change >= 5) ? 5 : (change <= -5) ? -5 : change; //clamp change to 5deg per tick

			this.element.style.setProperty('--direction', `${this.degrees + change}deg`);
		}

		super.move();
	}
}