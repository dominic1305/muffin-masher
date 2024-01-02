import Entity from "./Entity.js";
import SpaceShip from "./SpaceShip.js";
import Asteroid from "./Asteroid.js";
import Bullet from "./Bullet.js";

export let asteroidArr = [new Asteroid()].filter(() => false);

export const player = SpaceShip.spawn('player', 5, 4, 50);

let TIME;
requestAnimationFrame(function loop(time) {
	if (time != null) {
		const delta = time - TIME;
		document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
		TIME = time;

		//actionable code
		player.move();
		Asteroid.spawn();
		for (const asteroid of Asteroid.asteroidArr) {
			asteroid.move();
		}
		for (const bullet of Bullet.bulletArr) {
			bullet.move();
		}
	}
	requestAnimationFrame(loop);
});