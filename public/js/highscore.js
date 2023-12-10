
export default class Highscore {
	constructor() {
		this.storage = localStorage.getItem("highscores")
		if (this.storage == null) {
			localStorage.setItem("highscore", [])
			this.storage = localStorage.getItem("highscores")
		}
		this.scoreList = this.storage.sort(this.sortScores);

	}
	sortScores(a, b) {
		return a.score - b.score;
	}
	get scores() {
		return this.storage;
	}
	set newScore(score) {
		if (this.scoreList[this.scoreList.length - 1].score <= score.score) {
			this.scoreList.pop(this.scoreList.length - 1);
			this.scoreList.push(score);
			localStorage.setItem("highscore", this.scoreList);
			this.storage = localStorage.getItem("highscore");
			this.scoreList = this.storage.sort(this.sortScores);
			return 1;
		}

	}
}
