function load() {
	for (const el of document.getElementsByClassName('word')) {
		el.addEventListener('click', wordClick);
	}
	setWords();
	document.getElementById('player-name').value =
		localStorage.valuesPlayerName || '';
	if (localStorage.valuesPlayerName) {
		refreshResults();
	}

	let options = '';
	for (const usernameKey of Object.keys(localStorage).filter(
		(key) =>
			key.endsWith('-values-results') &&
			(!localStorage.valuesPlayerName ||
				key != `${localStorage.valuesPlayerName}-values-results`)
	)) {
		const username = usernameKey.substring(
			0,
			usernameKey.length - '-values-results'.length
		);
		options += `<option>${username}</option>`;
	}
	document.getElementById('other-player-select').innerHTML = options;
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
		localStorage.valuesPlayerName = playerName;
		const results = getResults(playerName);
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
			wins: results[loserWord]?.wins || 0,
		};
		// console.log(results);
		localStorage[`${playerName}-values-results`] = JSON.stringify(results);

		refreshResults();
		setWords();
	} else {
		document.getElementById('player-name').focus();
	}
}

function refreshResults(playerName) {
	playerName = playerName || localStorage.valuesPlayerName;
	const results = getResults(playerName);
	let html = '<table>';
	html += '<tr><th>Word</th><th>Score</th></tr>';
	const sortedWords = Object.keys(results).sort((a, b) => {
		// console.log(a, b);
		// console.log(a.wins, b.wins);
		// console.log(a.rounds, b.rounds);
		return results[a].wins / results[a].rounds >
			results[b].wins / results[b].rounds
			? -1
			: 1;
	});
	for (const word of sortedWords) {
		const score = Math.round((100 * results[word].wins) / results[word].rounds);
		html += `<tr><td>${word}</td><td>${score}</td></tr>`;
	}
	html += '</table>';
	document.getElementById(
		playerName == localStorage.valuesPlayerName
			? 'user-results'
			: 'other-user-results'
	).innerHTML = html;
}

function getResults(playerName) {
	return JSON.parse(localStorage[`${playerName}-values-results`] || '{}');
}

function setOtherUserResults() {
	const username = document.getElementById('other-player-select').value;
	refreshResults(username);
}
