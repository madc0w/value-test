function load() {
	for (const el of document.getElementsByClassName('word')) {
		el.addEventListener('click', wordClick);
	}
	setWords();
}

function setWords() {
	const word1 = words[Math.floor(Math.random() * words.length)];
	document.getElementById('left-word').innerHTML = word1;
	const word2 = words[Math.floor(Math.random() * words.length)];
	document.getElementById('right-word').innerHTML = word2;
}

function wordClick(el) {
	const playerName = document.getElementById('player-name').value;
	if (playerName) {
		const results = JSON.parse(localStorage[`${playerName}-results`] || '{}');
		const winnerWord = el.target.innerHTML;
		results[winnerWord] = {
			rounds: (results[winnerWord]?.rounds || 0) + 1,
			wins: (results[winnerWord]?.wins || 0) + 1,
		};
		const loserWord = document.getElementById(
			el.target == document.getElementById('left-word')
				? 'right-word'
				: 'left-word'
		).innerHTML;
		results[loserWord] = {
			rounds: (results[loserWord]?.rounds || 0) + 1,
			wins: results[winnerWord]?.wins || 0,
		};
		console.log(results);
		localStorage[`${playerName}-results`] = JSON.stringify(results);
		setWords();
	} else {
		document.getElementById('player-name').focus();
	}
}
