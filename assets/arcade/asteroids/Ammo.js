"use strict";

class Ammo extends Entity {
	/**@type {Ammo[]}*/ static #instanceArr = [];
	static #width = 20;
	static #spawnTimer = 0;
	static #timerMax = 90;
	static #maxAmmos = 30;
	#inPlay = false;

	static get InstanceArr() {
		return Object.freeze(this.#instanceArr.map(bin => Object.freeze(bin)));
	}

	/**@private @param {Element} element @param {number} velocity*/
	constructor(element, velocity) {
		super(element, velocity);
	}

	/**@param {{x:number, y:number}?} position*/
	static spawn(position) {
		if (position == null && (this.#instanceArr.length >= this.#maxAmmos || ++this.#spawnTimer <= this.#timerMax)) return; //too many ammos | ammo spawn too recently
		if (position == null) this.#spawnTimer = 0;

		const element = document.createElement('img');
		element.src = './img/ammo.png';
		element.draggable = false;
		element.className = 'ammo';
		element.id = `ammo_${Math.random().toString(16).slice(2)}`;

		const startX = (position != null) ? position.x : (Math.floor(Math.random() * 2) == 0) ? -this.#width : document.body.clientWidth + this.#width;
		const startY = (position != null) ? position.y : Math.floor(Math.random() * document.body.clientHeight);
		const degrees = this.#getDirection(startX, startY, player.position.x, player.position.y);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		document.querySelector('.play-area').appendChild(element);

		const ammo = new Ammo(element, 1);
		this.#instanceArr.push(ammo);
	}

	/**@param {number} startX @param {number} startY @param {number} endX @param {number} endY*/
	static #getDirection(startX, startY, endX, endY) {
		const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI) + 90;
		return (angle < 0) ? angle + 360 : angle;
	}

	static disposeAll() {
		for (const ammo of this.#instanceArr) {
			document.querySelector('.play-area').removeChild(ammo.element);
		}
		this.#instanceArr.splice(0, this.#instanceArr.length);
	}

	dispose() {//destructor
		Ammo.#instanceArr.splice(Ammo.#instanceArr.indexOf(this), 1);
		document.querySelector('.play-area').removeChild(this.element);
	}

	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
	}
}