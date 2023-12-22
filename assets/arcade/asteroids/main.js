import Entity from "./Entity.js";
import SpaceShip from "./SpaceShip.js";

const player = SpaceShip.getSpaceShip('player', 6, 4);

let TIME;
requestAnimationFrame(function loop(time) {
	if (time != null) {
		const delta = time - TIME;
		document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
		TIME = time;

		//actionable code
		player.move();
		player.rotate();
	}
	requestAnimationFrame(loop);
});