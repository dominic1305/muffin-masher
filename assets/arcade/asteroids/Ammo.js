"use strict";

class Ammo extends Entity {
	static #width = 20;
	static #spawnTimer = 0;
	static #timerMax = 90;
	static #maxAmmos = 30;
	#inPlay = false;

	/**@private @param {Element} element @param {number} velocity*/
	constructor(element, velocity) {
		super(element, velocity);
	}

	/**@param {{x:number, y:number}?} position*/
	static spawn(position) {
		if (position == null && (GlobalData.ammos.Length >= this.#maxAmmos || ++this.#spawnTimer <= this.#timerMax)) return; //too many ammos | ammo spawn too recently
		if (position == null) this.#spawnTimer = 0;

		const element = document.createElement('img');
		element.src = './img/ammo.png';
		element.draggable = false;
		element.className = 'ammo';
		element.id = `ammo_${Math.random().toString(16).slice(2)}`;

		const startX = (position != null) ? position.x : (Math.floor(Math.random() * 2) == 0) ? -this.#width : document.body.clientWidth + this.#width;
		const startY = (position != null) ? position.y : Math.floor(Math.random() * document.body.clientHeight);
		const degrees = this.getAngleToPoint(startX, startY, GlobalData.player.position.x, GlobalData.player.position.y);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		GlobalData.ammos.Add(new Ammo(element, 1));
	}

	dispose() {//destructor
		super.dispose();
		GlobalData.ammos.Remove(this);
	}

	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();
		super.move();
	}
}