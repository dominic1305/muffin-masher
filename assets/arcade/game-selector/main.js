"use strict";

let currentSelect = 1;

document.querySelectorAll('#machine-btn').forEach((bin) => {//operate machine buttons
	bin.addEventListener('mousedown', () => {
		document.querySelector('#machine-img').src = `./img/machine-${Number(bin.dataset.selector)}-btn.png`;
		switch (Number(bin.dataset.selector)) {//change select
			case 1: //go left
				if (currentSelect > 0) currentSelect--;
				document.querySelectorAll('.selections-row > div').forEach(bin => bin.style.backgroundColor = 'rgba(0, 0, 0, 0)');
				document.querySelectorAll('.selections-row > div')[currentSelect].style.backgroundColor = 'rgba(0 ,0 , 0, 0.25)';
				break;
			case 2: //select game
				const selected = [...document.querySelectorAll('.selections-row > div')].filter((bin) => {//find one with border
					return window.getComputedStyle(bin).backgroundColor == 'rgba(0, 0, 0, 0.25)';
				})[0];
				if (selected) window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'change-SRC', newSRC: selected.dataset.game}), '*');
				break;
			case 3: //go right
				if (currentSelect < 2) currentSelect++;
				document.querySelectorAll('.selections-row > div').forEach(bin => bin.style.backgroundColor = 'rgba(0, 0, 0, 0)');
				document.querySelectorAll('.selections-row > div')[currentSelect].style.backgroundColor = 'rgba(0 ,0 , 0, 0.25)';
				break;
			default: break;
		}
	});
	bin.addEventListener('click', () => {//return to default img
		document.querySelector('#machine-img').src = './img/machine-base.png';
	});
});

document.body.onload = () => {
	window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'read-tickets-cache'}), '*');
	window.addEventListener('message', (msg) => {
		const data = JSON.parse(msg.data);
		if (data.purpose == 'tickets-cache-data' && Number(data.val) > 0) {//tickets were awarded
			document.querySelector('.new-tickets-modal > p:nth-child(2)').innerHTML = `You Earned:<br>${data.val}<span class="sub-script">x</span><img src="./img/arcade-ticket.png">`;
			document.querySelector('.new-tickets-modal').showModal();
		}
	}, {once: true});
}

document.querySelector('.new-tickets-modal > .close-btn').addEventListener('click', () => {
	document.querySelector('.new-tickets-modal').close();
});

document.querySelectorAll('.selections-row > div').forEach((bin) => {
	bin.addEventListener('click', () => {
		window.parent.postMessage(JSON.stringify({origin: 'arcade', purpose: 'change-SRC', newSRC: bin.dataset.game}), '*');
	});
});