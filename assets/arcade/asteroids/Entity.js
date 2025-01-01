"use strict";

/**@abstract*/
class Entity {
	/**@protected*/ velocity;

	get degrees() {
		const matrix = window.getComputedStyle(this.element).transform;
		const values = matrix.split('(')[1].split(')')[0].split(',').map(bin => Number(bin));
		const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
		return ((angle < 0) ? angle + 360 : angle) % 360;
	}

	/**@returns {1 | 2 | 3 | 4}*/
	get directionSector() {
		return Math.ceil(this.degrees / 90) || 1;
	}

	get angle() {
		const degrees = this.degrees;
		const angle = degrees % 90;
		if (angle == 0) {//is cardinal angle
			switch (degrees) {
				case 0: return 90; //north
				case 90: return 0; //east
				case 180: return 90; //south
				case 270: return 0; //west
				default: throw new Error('invalid direction');
			}
		} else if ((degrees < 360 && degrees > 270) || (degrees < 180 && degrees > 90)) {//quadrant 2 or 4
			return angle;
		} else if ((degrees < 90 && degrees > 0) || (degrees < 270 && degrees > 180)) {//quadrant 1 or 3
			return 90 - angle;
		} else return angle;
	}

	get vector() {
		return {
			x: (this.directionSector == 1 || this.directionSector == 2) ? Math.cos(this.angle * (Math.PI / 180)) * this.velocity : -Math.cos(this.angle * (Math.PI / 180)) * this.velocity,
			y: (this.directionSector == 4 || this.directionSector == 1) ? Math.sin(this.angle * (Math.PI / 180)) * this.velocity : -Math.sin(this.angle * (Math.PI / 180)) * this.velocity
		};
	}

	get position() {
		return {
			x: parseFloat(window.getComputedStyle(this.element).left),
			y: parseFloat(window.getComputedStyle(this.element).top)
		};
	}

	get boundingBox() {
		return this.element.getBoundingClientRect();
	}

	/**@returns {{x: number, y: number}[]}*/
	get vertices() {
		const rect = this.boundingBox;
		const vertices = new Array(4);
		vertices[0] = { x: rect.x, y: rect.y };
		vertices[1] = { x: rect.x + rect.width, y: rect.y };
		vertices[2] = { x: rect.x + rect.width, y: rect.y + rect.width };
		vertices[3] = { x: rect.x, y: rect.y + rect.width };
		return vertices;
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

	/**@returns {[min: number, max: number]} @param {{x: number, y: number}[]} vertices @param {{x: number, y: number}} normal*/
	#projectVertices(vertices, normal) {
		let min = Number.MAX_VALUE;
		let max = Number.MIN_VALUE;
		for (let i = 0; i < vertices.length; i++) {
			let vertex = vertices[i];
			let projection = this.#dotProd(Object.values(vertex), Object.values(normal));
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
		this.element.style.left = `${this.position.x + this.vector.x}px`;
		this.element.style.top = `${this.position.y - this.vector.y}px`;
	}
}