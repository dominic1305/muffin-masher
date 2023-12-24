import Entity from "./Entity.js";
import SpaceShip from "./SpaceShip.js";
import Asteroid from "./Asteroid.js";

export let asteroidArr = [new Asteroid()].filter(() => false);

export const player = SpaceShip.getSpaceShip('player', 6, 4);

let TIME;
requestAnimationFrame(function loop(time) {
	if (time != null) {
		const delta = time - TIME;
		document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
		TIME = time;

		//actionable code
		player.move();
		player.rotate();
		Asteroid.spawn();
		for (const asteroid of Asteroid.asteroidArr) {
			asteroid.move();
		}
	}
	requestAnimationFrame(loop);
});