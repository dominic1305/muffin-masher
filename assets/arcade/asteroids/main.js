"use strict";

/**@type {SpaceShip}*/ let player;
let gameState = false;

/**@type {number}*/ let TIME;
requestAnimationFrame(function loop(time) {
	const delta = time - TIME;
	document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
	TIME = time;
	if (gameState) {//actionable code
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

document.querySelector('.game-start-btn').addEventListener('click', () => {//start game | pre-game handler
	window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'game-start'}), '*');
	document.querySelector('.game-start-modal').style.visibility = 'hidden';
	gameState = true;
	player = SpaceShip.spawn(5, 4, 50);
});

function endGameHandler() {//perform actions to end game and set up next game
	gameState = false;
	player.dispose();
	Asteroid.disposeAll();
	Bullet.disposeAll();

	document.body.appendChild(document.querySelector('#game-over-modal-template').content.cloneNode(true));
	document.querySelector('.game-over-txt').innerHTML = 'you died';
	document.querySelector('.game-over-inputs-container').addEventListener('click', (e) => {
		if (e.target == document.querySelector('#game-over-play-again')) {//reset for next game
			document.querySelector('.game-start-btn').click();
			document.body.removeChild(document.querySelector('.game-over-modal'));
		} else if (e.target == document.querySelector('#game-over-quit')) {//perform game exit actions
			window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'cash-out', val: 0}), '*'); //TODO: update {val} with ticket score output
		}
	});
}