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

	let options = `<option disabled>Select another user</option>`;
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
	let word1 = words[Math.floor(Math.random() * words.length)];
	const wordMatches = JSON.parse(localStorage.wordMatches || '{}');
	wordMatches[word1] = wordMatches[word1] || [];
	const numMatches = wordMatches[word1].length;
	while (numMatches + 1 >= words.length) {
		word1 = words[Math.floor(Math.random() * words.length)];
	}
	const word2Index = Math.floor(
		Math.random() * (words.length - numMatches - 1)
	);
	let word2,
		i = 0,
		j = 0;
	do {
		word2 = words[i++];
		if (!wordMatches[word1].includes(word2) && word2 != word1) {
			j++;
		}
	} while (j < word2Index);
	wordMatches[word1].push(word2);
	localStorage.wordMatches = JSON.stringify(wordMatches);

	document.getElementById('left-word').innerHTML = word1;
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
		setOtherUserResults();
		setWords();
	} else {
		document.getElementById('player-name').focus();
	}
}

function refreshResults(playerName) {
	playerName = playerName || localStorage.valuesPlayerName;
	const isCurrentUser = playerName == localStorage.valuesPlayerName;
	const results = getResults(playerName);
	const userResults = getResults(localStorage.valuesPlayerName);
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
		let wordClass = '',
			currentUserScore = '';
		if (!isCurrentUser && userResults[word]) {
			wordClass = 'word-match';
			currentUserScore =
				' (' +
				Math.round((100 * userResults[word].wins) / userResults[word].rounds) +
				')';
		}
		html += `<tr><td class="${wordClass}">${word}</td><td>${score} ${currentUserScore}</td></tr>`;
	}
	html += '</table>';
	document.getElementById(
		isCurrentUser ? 'user-results' : 'other-user-results'
	).innerHTML = html;

	const otherUsername = document.getElementById('other-player-select').value;
	if (otherUsername) {
		const otherResults = getResults(otherUsername);

		let sum = 0,
			n = 0;
		for (const word of Object.keys(userResults)) {
			if (otherResults[word] != null) {
				// console.log(word);
				const score = Math.round(
					userResults[word].wins / userResults[word].rounds
				);
				const otherScore = Math.round(
					otherResults[word].wins / otherResults[word].rounds
				);
				sum += Math.abs(score - otherScore);
				n++;
			}
		}
		if (n > 0) {
			document.getElementById('player-score-correspondence').innerHTML =
				Math.round(100 * (1 - sum / n)) +
				` / 100 (with ${n} word${n > 1 ? 's' : ''} in common)`;
		}
	}
}

function getResults(playerName) {
	return JSON.parse(localStorage[`${playerName}-values-results`] || '{}');
}

function setOtherUserResults() {
	const username = document.getElementById('other-player-select').value;
	if (username) {
		refreshResults(username);
	}
}

function reset() {
	if (localStorage.valuesPlayerName) {
		delete localStorage[`${localStorage.valuesPlayerName}-values-results`];
		refreshResults();
		document.getElementById('player-score-correspondence').innerHTML = '';
	}
}

function playerNameInput() {
	// console.log(document.getElementById('player-name').value);
}
