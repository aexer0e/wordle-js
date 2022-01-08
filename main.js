const words = require('an-array-of-english-words').filter(e => e.length == 5).map(e => e.toUpperCase());
const { createCipheriv } = require('crypto');
const readline = require('readline')
//wordle game
class Game {
    #word = '';
    guesses = [];
    guessCount = 0;
    maxGuesses = 0;
    gameOver = false;

    constructor() {
        this.#word = words[Math.floor(Math.random() * words.length)]
        this.guesses = []
        this.guessCount = 0
        this.maxGuesses = 5
        this.gameOver = false
        // console.log(this.#word)
    }

    guess(guessedWord) {
        if (guessedWord.length != 5) return "Invalid word length!"
        if (this.gameOver) return "Game is over!"
        guessedWord = guessedWord.toUpperCase()

        this.guessCount++
        let guess = {
            word: guessedWord,
            correct: this.#word == guessedWord,
            letters: [],
            guessCount: this.guessCount,
        }

        for (let i = 0; i < 5; i++) {
            guess.letters.push({
                letter: guessedWord[i],
                correct: guessedWord[i] === this.#word[i],
                contained: this.#word.includes(guessedWord[i]),
            })
        }

        this.guesses.push(guess)
        
        if (this.guessCount >= this.maxGuesses) {
            this.gameOver = true
        }

        return guess
    }
}

async function play() {
    const chalkImp = await import('chalk')
    const chalk = new chalkImp.Chalk()
    const myGame = new Game()

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    while (!myGame.gameOver) {
        const guessesLeft = myGame.maxGuesses - myGame.guessCount
        const guess = await new Promise(resolve => rl.question(guessesLeft + ' guesses left. Guess a word: ', resolve))
        const guessResult = myGame.guess(guess)
        if (typeof guessResult === 'string') {
            console.log(chalk.red(guessResult))
            continue
        }
        const result = guessResult.letters.map(e => {
            if (e.correct) return chalk.green(e.letter)
            if (e.contained) return chalk.yellow(e.letter)
            return chalk.red(e.letter)
        })
        console.log(result.join(' '))
    }

    rl.close()
}

play()