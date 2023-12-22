/**@abstract*/
export default class Entity {
	/**@param {string} elementID @param {number} velocity*/
	constructor(elementID, velocity) {
		this.elementID = elementID;
		this.velocity = velocity;
	}
	get element() {
		return document.querySelector(`#${this.elementID}`);
	}
	get degrees() {
		const matrix = window.getComputedStyle(this.element).transform;
		const values = matrix.split('(')[1].split(')')[0].split(',');
		const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
		return ((angle < 0) ? angle + 360 : angle) % 360;
	}
	/**@returns {1 | 2 | 3 | 4} */
	get directionSector() {
		return Math.ceil(this.degrees / 90) || 1;
	}
	get angle() {
		const angle = this.degrees % 90;
		if (angle == 0) {//is a due angle
			switch (this.degrees) {
				case 0: return 90; //north
				case 90: return 0; //east
				case 180: return 90; //south
				case 270: return 0; //west
				default: throw new Error('invalid direction');
			}
		} else if ((this.degrees < 360 && this.degrees > 270) || (this.degrees < 180 && this.degrees > 90)) {//angles 2 or 4
			return angle;
		} else if ((this.degrees < 90 && this.degrees > 0) || (this.degrees < 270 && this.degrees > 180)) {//angles 1 or 3
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
	move() {
		this.element.style.left = `${this.position.x + this.vector.x}px`;
		this.element.style.top = `${this.position.y - this.vector.y}px`;
	}
}