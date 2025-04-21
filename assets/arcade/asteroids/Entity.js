"use strict";

/**@abstract*/
class Entity {
	/**@protected*/ velocity;
	/**@protected*/ element;
	/**@protected*/ degrees;
	/**@protected*/ position;

	#isDisposed = false;

	/**@returns {1 | 2 | 3 | 4}*/
	get directionSector() {
		return Math.ceil(this.degrees / 90) || 1;
	}

	get angle() {
		const angle = this.degrees % 90;

		if (angle == 0) {//is cardinal angle
			switch (this.degrees) {
				case 0:		return 90;	//north
				case 90:	return 0;	//east
				case 180:	return 90;	//south
				case 270:	return 0;	//west
				default:	throw new Error('invalid direction');
			}
		} else if ((this.degrees < 360 && this.degrees > 270) || (this.degrees < 180 && this.degrees > 90)) {//quadrant 2 or 4
			return angle;
		} else if ((this.degrees < 90 && this.degrees > 0) || (this.degrees < 270 && this.degrees > 180)) {//quadrant 1 or 3
			return 90 - angle;
		} else return angle;
	}

	get nextVector() {
		const sector = this.directionSector;
		const angle = this.angle;

		return {
			x: (sector == 1 || sector == 2) ? Math.cos(angle * (Math.PI / 180)) * this.velocity : -Math.cos(angle * (Math.PI / 180)) * this.velocity,
			y: (sector == 4 || sector == 1) ? Math.sin(angle * (Math.PI / 180)) * this.velocity : -Math.sin(angle * (Math.PI / 180)) * this.velocity
		};
	}

	get boundingBox() {
		return this.element.getBoundingClientRect();
	}

	/**@returns {{x: number, y: number}[]}*/
	get vertices() {
		const rect = this.boundingBox;

		return [
			{ x: rect.x,				y: rect.y				},
			{ x: rect.x + rect.width,	y: rect.y				},
			{ x: rect.x + rect.width,	y: rect.y + rect.width	},
			{ x: rect.x,				y: rect.y + rect.width	}
		];
	}

	get inBounds() {
		const DOMRect = document.body.getBoundingClientRect();
		const entityRect = this.boundingBox;
		return !(entityRect.top > DOMRect.bottom || entityRect.right < DOMRect.left || entityRect.bottom < DOMRect.top || entityRect.left > DOMRect.right);
	}

	/**@protected @param {Element} element @param {number} velocity*/
	constructor(element, velocity) {
		this.element = element;
		this.velocity = velocity;

		GlobalData.playArea.appendChild(element);

		this.position = {
			x: parseFloat(window.getComputedStyle(this.element).left),
			y: parseFloat(window.getComputedStyle(this.element).top)
		};

		const matrix = window.getComputedStyle(element).transform;
		const values = matrix.split('(')[1].split(')')[0].split(',').map(bin => Number(bin));
		const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
		this.degrees = ((angle < 0) ? angle + 360 : angle) % 360;
	}

	/**@protected @param {number} startX @param {number} startY @param {number} endX @param {number} endY*/
	static getAngleToPoint(startX, startY, endX, endY) {
		const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI) + 90;
		return (angle < 0) ? angle + 360 : angle;
	}

	/**@returns {void} @param {SwapBackArray<Entity>} instances*/
	static disposeAll(instances) {
		for (const instance of instances.Enumerate()) {
			if (GlobalData.playArea.contains(instance.element)) GlobalData.playArea.removeChild(instance.element);
		}

		instances.Clear();
	}

	dispose() {
		this.#isDisposed = true;
		if (GlobalData.playArea.contains(this.element)) GlobalData.playArea.removeChild(this.element);
	}

	/**@protected @param {Entity} target*/
	hasCollidedWith(target) {
		const targRect = target.boundingBox;
		const thisRect = this.boundingBox;
		if (thisRect.top > targRect.bottom || thisRect.right < targRect.left || thisRect.bottom < targRect.top || thisRect.left > targRect.right) return false; //don't bother with SAT, AABB says they're far away

		const verts_A = this.vertices;
		const verts_B = target.vertices;

		for (let i = 0; i < verts_A.length; i++) {//use SAT on this entity
			const va = verts_A[i];
			const vb = verts_A[(i + 1) % verts_A.length];

			const edge = { x: vb.x - va.x, y: vb.y - va.y };
			const normal = { x: -edge.y, y: edge.x };

			const [ maxA, minA ] = this.#projectVertices(verts_A, normal);
			const [ maxB, minB ] = this.#projectVertices(verts_B, normal);

			if (minA >= maxB || minB >= maxA) return false; //separating axis was found
		}

		for (let i = 0; i < verts_B.length; i++) {//use SAT on target entity
			const va = verts_B[i];
			const vb = verts_B[(i + 1) % verts_B.length];

			const edge = { x: vb.x - va.x, y: vb.y - va.y };
			const normal = { x: -edge.y, y: edge.x };

			const [ maxA, minA ] = this.#projectVertices(verts_A, normal);
			const [ maxB, minB ] = this.#projectVertices(verts_B, normal);

			if (minA >= maxB || minB >= maxA) return false; //separating axis was found
		}

		return true; //no separating axis was found | entities are colliding
	}

	/**@returns {[max: number, min: number]} @param {{x: number, y: number}[]} vertices @param {{x: number, y: number}} normal*/
	#projectVertices(vertices, normal) {
		let min = Number.MAX_VALUE;
		let max = Number.MIN_VALUE;
		for (let i = 0; i < vertices.length; i++) {
			let projection = this.#dotProd(Object.values(vertices[i]), Object.values(normal));
			if (projection < min) min = projection;
			if (projection > max) max = projection;
		}
		return [ max, min ];
	}

	/**@param {number[]} vec1 @param {number[]} vec2*/
	#dotProd(vec1, vec2) {
		if (vec1.length != vec2.length) throw new Error('different sized matrices cannot have a dot product');
		let result = 0;
		for (let i = 0; i < vec1.length; i++) {
			result += vec1[i] * vec2[i];
		}
		return result;
	}

	move() {
		if (this.#isDisposed) return; //don't move if entity is dead

		this.position.x += this.nextVector.x;
		this.position.y -= this.nextVector.y;

		this.element.style.left = `${this.position.x}px`;
		this.element.style.top = `${this.position.y}px`;
	}
}