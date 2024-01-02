"use strict";

let asteroidArr = [new Asteroid()].filter(() => false);

const player = SpaceShip.spawn('player', 5, 4, 50);

let TIME;
requestAnimationFrame(function loop(time) {
	if (time != null) {
		const delta = time - TIME;
		document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
		TIME = time;

		//actionable code
		player.move();
		Asteroid.spawn();
		for (const asteroid of Asteroid.instanceArr) {
			asteroid.move();
		}
		for (const bullet of Bullet.instanceArr) {
			bullet.move();
		}
	}
	requestAnimationFrame(loop);
});