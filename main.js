const words = require('an-array-of-english-words').filter(e => e.length == 5).map(e => e.toUpperCase());
const readline = require('readline')
//wordle game
class Game {
    #word = '';
    guesses = [];
    guessCount = 0;
    maxGuesses = 0;
    gameOver = false;
    won = false;

    constructor(word) {
        this.#word = word || words[Math.floor(Math.random() * words.length)]
        this.guesses = []
        this.guessCount = 0
        this.maxGuesses = 5
        this.gameOver = false
        this.won = false
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
            guessCount: this.guessCount
        }

        for (let i = 0; i < 5; i++) {
            guess.letters.push({
                letter: guessedWord[i],
                correct: guessedWord[i] === this.#word[i],
                contained: this.#word.includes(guessedWord[i]),
            })
        }

        this.guesses.push(guess)
        
        if (guessedWord == this.#word) {
            this.gameOver = true
            this.won = true
            return `Correct! You won with ${this.guessCount} guesses!`
        }

        if (this.guessCount >= this.maxGuesses) {
            this.gameOver = true
            return `You lost! The word was ${this.#word}`
        }

        return guess
    }
}

async function play(initWord = 'hello', pickedWord = null) {
    const chalkImp = await import('chalk')
    const chalk = new chalkImp.Chalk()
    const myGame = new Game(pickedWord)

    const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout
    })

    let letterBlacklists = [ new Set(), new Set(), new Set(), new Set(), new Set() ]
    let includedLetters = new Set()
    let possibleWords = [...words]
    let knownLetters = []

    while (!myGame.gameOver) {
        const guessesLeft = myGame.maxGuesses - myGame.guessCount
        // const guess = await new Promise(resolve => rl.question(guessesLeft + ' guesses left. Guess a word: ', resolve))
        const guess = myGame.guessCount == 0 ? initWord : possibleWords[Math.floor(Math.random() * possibleWords.length)]
        console.log('guessing ' + guess)
        const guessResult = myGame.guess(guess)
        if (typeof guessResult === 'string') {
            if (guessResult.startsWith('Correct!')) console.log(chalk.green(guessResult))
            else console.log(chalk.red(guessResult))
            continue
        }
        const resultColored = guessResult.letters.map(e => {
            if (e.correct) return chalk.green(e.letter)
            if (e.contained) return chalk.yellow(e.letter)
            return chalk.red(e.letter)
        })
        console.log(resultColored.join(' '))

        wrongLetters = guessResult.letters.filter(e => !e.correct && !e.contained).map(e => e.letter)

        for (let i = 0; i < 5; i++) {
            const letter = guessResult.letters[i]

            wrongLetters.forEach(e => { letterBlacklists[i].add(e) })

            if (letter.contained) {
                includedLetters.add(letter.letter)
                if (letter.correct) knownLetters[i] = letter.letter
                else {letterBlacklists[i].add(letter.letter)}
            }
        }
        possibleWords = possibleWords.filter(e => {
            for (let i = 0; i < 5; i++) { 
                if (knownLetters[i] && knownLetters[i] != e[i]) return false
                if (letterBlacklists[i].has(e[i])) return false
            }
            for (let i = 0; i < includedLetters.size; i++) {
                if (!e.includes([...includedLetters][i])) return false
            }
            return true
        })
        if (possibleWords.length > 50) console.log(possibleWords.length + ' possible words')
        else console.log(possibleWords.length + ' possible words: ' + possibleWords.join(', '))
    }

    rl.close()
    return myGame.won
}
play()
function main() {
    let wordsWinrate = {}
    for (let i = 0; i < words.length; i++) {
       let wins = 0
       for (let y = 0; y < words.length; y++) {
           const won = play(words[i], words[y])
           if (won) wins++
       }
       wordsWinrate[words[i]] = wins / words.length
       console.log(words[i] + ': ' + wins + '/' + words.length + ' (' + (wins / words.length * 100) + '%)' + ` (${i}/${words.length})`)
    }
    console.log(JSON.stringify(wordsWinrate))
}