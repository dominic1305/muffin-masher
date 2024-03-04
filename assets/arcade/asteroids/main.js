"use strict";

/**@type {SpaceShip}*/ let player;
/**@type {ScoreBoardManager}*/ let scoreBoard;
let gameState = false;

/**@type {number}*/ let TIME;
requestAnimationFrame(function loop(time) {
	const delta = time - TIME;
	document.querySelector('.fps-counter').innerHTML = `${Math.round(1000 / delta)}fps`;
	TIME = time;
	if (gameState) {//actionable code
		player.move();
		Asteroid.spawn();
		scoreBoard.updateScoreBoard();
		for (const asteroid of Asteroid.InstanceArr) {
			asteroid.move();
		}
		for (const bullet of Bullet.InstanceArr) {
			bullet.move();
		}
	}
	requestAnimationFrame(loop);
});

document.querySelector('.game-start-btn').addEventListener('click', async () => {//start game | pre-game handler
	window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'game-start'}), '*');
	scoreBoard = await ScoreBoardManager.getConnection();
	gameState = true;
	player = SpaceShip.spawn(3, 4, 50, 2, 3);
	document.querySelector('.game-start-modal').style.visibility = 'hidden';
});

function endGameHandler() {//perform actions to end game and set up next game
	gameState = false;
	player.dispose();
	Asteroid.disposeAll();
	Bullet.disposeAll();

	document.body.appendChild(document.querySelector('#game-over-modal-template').content.cloneNode(true));
	document.querySelector('.game-over-txt').innerHTML = 'you died';
	document.querySelector('.game-over-tickets-earned').innerHTML = `${scoreBoard.getRoundTickets()}x`;
	document.querySelector('.game-over-inputs-container').addEventListener('click', (e) => {
		if (e.target == document.querySelector('#game-over-play-again')) {//reset for next game
			document.querySelector('.game-start-btn').click();
			document.body.removeChild(document.querySelector('.game-over-modal'));
		} else if (e.target == document.querySelector('#game-over-quit')) {//perform game exit actions
			window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'cash-out', val: ScoreBoardManager.TicketsEarned}), '*');
		}
	});
}