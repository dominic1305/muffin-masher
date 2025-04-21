"use strict";

class EffectType {
	/**@returns {EffectType}*/ static get RAPID()		{ return 0x0; }
	/**@returns {EffectType}*/ static get SPREAD()		{ return 0x1; }
	/**@returns {EffectType}*/ static get GIANT()		{ return 0x2; }
	/**@returns {EffectType}*/ static get PIERCE()		{ return 0x3; }
	/**@returns {EffectType}*/ static get EXPLODE()		{ return 0x4; }
	/**@returns {EffectType}*/ static get TRACKING()	{ return 0x5; }
	/**@returns {EffectType}*/ static get SPLIT()		{ return 0x6; }
	/**@returns {EffectType}*/ static get FLAME()		{ return 0x7; }
	/**@returns {EffectType}*/ static get SHIELD()		{ return 0x8; }
	/**@returns {EffectType}*/ static get BOMB()		{ return 0x9; }
	/**@returns {EffectType}*/ static get DEFAULT()		{ return 0xA; }

	/**@returns {EffectType[]}*/
	static GetValues() {
		return Object.getOwnPropertyNames(this).filter(prop => typeof this[prop] == 'number' && prop != 'length').map(prop => this[prop]);
	}
}

class Effect extends Entity {
	static #spawnTimer = 0;
	static #timerMax = 1800; //60 ticks * 30 seconds = twice per minute
	static #width = 35;
	#inPlay = false;
	#type;

	static get #newType() {
		const selection = EffectType.GetValues().filter((bin) => {
			switch (bin) {
				case EffectType.DEFAULT:			return false;								//no effect for default bullet type
				case EffectType.BOMB:				return (!GlobalData.player.IsMaxBombs);		//player already has max number of bombs
				case EffectType.SHIELD:				return (!GlobalData.player.IsMaxShield);	//player already has max number of shields
				case GlobalData.player.BulletType:	return false;								//player already has this bullet type
				default:							return true;								//is a valid effect type
			}
		});

		return selection[Math.floor(Math.random() * selection.length)];
	}

	get Type() {
		return this.#type;
	}

	/**@private @param {Element} element @param {number} velocity @param {EffectType} type*/
	constructor(element, velocity, type) {
		super(element, velocity);
		this.#type = type;
	}

	static spawn() {
		if (GlobalData.effects.Length >= 1 || ++this.#spawnTimer < this.#timerMax) return; //too many effects | effect spawned recently
		this.#spawnTimer = 0;

		if (Math.floor(Math.random() * 5) == 0) return; //20% chance to spawn

		const type = this.#newType;
		const { colour, char } = this.getInfo(type);

		const element = document.createElement('span');
		element.innerHTML = '<img src="./img/effect.png" draggable="false">';
		element.className = 'effect';
		element.id = `effect_${Math.random().toString(16).slice(2)}`;
		element.style.setProperty('--colour', `${colour}deg`);

		const startX = (Math.floor(Math.random() * 2) == 0) ? -this.#width : document.body.clientWidth + this.#width;
		const startY = Math.floor(Math.random() * document.body.clientHeight);
		const endX = (startX < 0) ? document.body.clientWidth + this.#width : -this.#width;
		const endY = Math.floor(Math.random() * document.body.clientHeight);
		const degrees = this.getAngleToPoint(startX, startY, endX, endY);

		element.style.setProperty('--txt-rot', `${-degrees}deg`); //inverse rotation to have text right-side up
		element.style.setProperty('--text', `"${char}"`);

		element.style.top = `${startY}px`;
		element.style.left = `${startX}px`;
		element.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;

		GlobalData.effects.Add(new Effect(element, 1, type));
	}

	/**@param {EffectType} type*/
	static getInfo(type) {
		switch (type) {
			case EffectType.RAPID:		return { colour: 180,	char: 'R'	}
			case EffectType.SPREAD:		return { colour: 240,	char: 'S'	}
			case EffectType.GIANT:		return { colour: 30,	char: 'G'	}
			case EffectType.PIERCE:		return { colour: 70,	char: 'P'	}
			case EffectType.EXPLODE:	return { colour: 266,	char: 'E'	}
			case EffectType.TRACKING:	return { colour: 310,	char: 'T'	}
			case EffectType.SPLIT:		return { colour: 160,	char: 'S'	}
			case EffectType.FLAME:		return { colour: 50,	char: 'F'	}
			case EffectType.SHIELD:		return { colour: 140,	char: ''	}
			case EffectType.BOMB:		return { colour: 230,	char: ''	}
			case EffectType.DEFAULT:	return { colour: 120,	char: ''	}
			default:					throw new Error('invalid type for colour');
		}
	}

	dispose() {
		super.dispose();
		GlobalData.effects.Remove(this);
	}

	move() {
		if (!this.#inPlay && this.inBounds) this.#inPlay = true;
		else if (this.#inPlay && !this.inBounds) return this.dispose();

		super.move();
	}
}