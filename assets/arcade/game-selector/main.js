"use strict";

let currentSelect = 1;

document.querySelectorAll('#machine-btn').forEach((bin) => {//operate machine buttons
	bin.addEventListener('mousedown', () => {
		document.querySelector('#machine-img').src = `./img/machine-${Number(bin.dataset.selector)}-btn.png`;
		switch (Number(bin.dataset.selector)) {//change select
			case 1: //go left
				if (currentSelect > 0) currentSelect--;
				document.querySelectorAll('.selections-row > div').forEach(bin => bin.style.border = '');
				document.querySelectorAll('.selections-row > div')[currentSelect].style.border = '1px solid black';
				break;
			case 2: //select game
				const selected = [...document.querySelectorAll('.selections-row > div')].filter((bin) => {//find one with borde
					return window.getComputedStyle(bin).border == '1px solid rgb(0, 0, 0)';
				})[0];
				if (selected) window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'change-SRC', newSRC: selected.dataset.game}), '*');
				break;
			case 3:
				if (currentSelect < 2) currentSelect++;
				document.querySelectorAll('.selections-row > div').forEach(bin => bin.style.border = '');
				document.querySelectorAll('.selections-row > div')[currentSelect].style.border = '1px solid black';
				break;
			default: break;
		}
	});
	bin.addEventListener('click', () => {
		document.querySelector('#machine-img').src = './img/machine-base.png';
	});
});

document.querySelectorAll('.selections-row > div').forEach((bin) => {
	bin.addEventListener('click', () => {
		window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'change-SRC', newSRC: bin.dataset.game}), '*');
	});
});