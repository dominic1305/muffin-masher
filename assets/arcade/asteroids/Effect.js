"use strict";

class Effect extends Entity {
	/**@type {Effect[]}*/ static #instanceArr = [];
	static #spawnTimer = 0;
	static #timerMax = 1800; //60 ticks * 30 seconds = twice per minute
	static #width = 35;
	#inPlay = false;
	#type;

	static get InstanceArr() {
		return Object.freeze(this.#instanceArr.map(bin => Object.freeze(bin)));
	}

	static get #newType() {
		const selection = Object.values(EffectTypes).filter((bin) => {
			switch (bin) {
				case EffectTypes.DEFAULT:	return false;					//no effect for default bullet type
				case EffectTypes.BOMB:		return (!player.IsMaxBombs);	//player already has max number of bombs
				case EffectTypes.SHIELD:	return (!player.IsMaxShield);	//player already has max number of shields
				case player.BulletType:		return false;					//player alreadty has this bullet type
				default:					return true;
			}
		});

		return selection[Math.floor(Math.random() * selection.length)];
	}

	get Type() {
		return this.#type;
	}

	/**@private @param {Element} element @param {number} velocity @param {symbol} type*/
	constructor(element, velocity, type) {
		super(element, velocity);
		this.#type = type;
	}

	static spawn() {
		if (this.#instanceArr.length >= 1 || ++this.#spawnTimer < this.#timerMax) return; //too many effects | effect spawned recently
		this.#spawnTimer = 0;

		if (Math.floor(Math.random() * 5) == 0) return; //20% chance to spawn

		const type = this.#newType;

		const element = document.createElement('span');
		element.innerHTML = '<img src="./img/effect.png" draggable="false">';
		element.className = 'effect';
		element.id = `effect_${Math.random().toString(16).slice(2)}`;
		element.style.setProperty('--colour', `${this.getColour(type)}deg`);

		const startX = (Math.floor(Math.random() * 2) == 0) ? -this.#width : document.body.clientWidth + this.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const endX = (startX < 0) ? document.body.clientWidth + this.#width : -this.#width;
		const endY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = this.#getDirection(startX, startY, endX, endY);

		element.style.setProperty('--txt-rot', `${-degrees}deg`); //inverse rotation to have text right-side up
		element.style.setProperty('--text', `"${type.description}"`);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		document.querySelector('.play-area').appendChild(element);

		this.#instanceArr.push(new Effect(element, 1, type));
	}

	/**@param {number} startX @param {number} startY @param {number} endX @param {number} endY*/
	static #getDirection(startX, startY, endX, endY) {
		const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI) + 90;
		return (angle < 0) ? angle + 360 : angle;
	}

	static disposeAll() {
		for (const effect of this.#instanceArr) {
			document.querySelector('.play-area').removeChild(effect.element);
		}
		this.#instanceArr.splice(0, this.#instanceArr.length);
	}

	/**@param {Symbol} type*/
	static getColour(type) {
		switch (type) {
			case EffectTypes.DEFAULT:	return 120;
			case EffectTypes.RAPID:		return 180;
			case EffectTypes.SPREAD:	return 240;
			case EffectTypes.GIANT:		return 30;
			case EffectTypes.SHIELD:	return 140;
			case EffectTypes.BOMB:		return 230;
			case EffectTypes.PIERCE:	return 70;
			case EffectTypes.EXPLODE:	return 266;
			case EffectTypes.TRACKING:	return 310;
			case EffectTypes.SPLIT:		return 160;
			case EffectTypes.FLAME:		return 50;
			default:					throw new Error('invalid type for colour');
		}
	}

	dispose() {
		Effect.#instanceArr.splice(Effect.#instanceArr.indexOf(this), 1);
		document.querySelector('.play-area').removeChild(this.element);
	}

	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();

		super.move();
	}
}

const EffectTypes = Object.freeze({
	RAPID: Symbol('R'),		// [R]apid
	SPREAD: Symbol('S'),	// [S]pread
	GIANT: Symbol('G'),		// [G]iant
	PIERCE: Symbol('P'),	// [P]ierce
	EXPLODE: Symbol('E'),	// [E]xplode
	TRACKING: Symbol('T'),	// [T]racking
	SPLIT: Symbol('S'),		// [S]plit
	FLAME: Symbol('F'),		// [F]lame
	SHIELD: Symbol(''),		// *blank*
	BOMB: Symbol(''),		// *blank*
	DEFAULT: Symbol(''),	// *null*
});