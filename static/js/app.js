document.addEventListener('DOMContentLoaded', function () {

    console.log('Frontend starting')
    const tileDisplay = document.querySelector('.tile-container')
    const keyboard = document.querySelector('.key-container')
    const messageDisplay = document.querySelector('.message-container')
    const keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL',]
    // const PORT = process.env.PORT || 8000
    const wordLength = 5
    const numberTries = 6
    const guessRows = Array(numberTries)
    for (let rowIdx = 0; rowIdx < numberTries; rowIdx++) {
        tileRow = Array(wordLength)
        for (let tileIdx = 0; tileIdx < wordLength; tileIdx++) {
            tileRow[tileIdx] = ''
        }
        guessRows[rowIdx] = tileRow
    }
    console.log(guessRows)

    let word
    const getWord = () => {
        fetch(`https://word-get-and-check.herokuapp.com/word`)
            .then(response => response.json())
            .then(json => {
                console.log(json)
                word = json
            })
            .catch(err => {
                console.log(err)
            })
    }

    word = getWord()

    let currentRow = 0
    let currentTile = 0
    let isGameOver = false

    // create guessing tiles
    guessRows.forEach((guessRow, guessRowIdx) => {
        const rowElement = document.createElement('div')
        rowElement.setAttribute('id', 'guessRow-' + guessRowIdx)
        guessRow.forEach((guess, guessIdx) => {
            const tileElement = document.createElement('div')
            tileElement.setAttribute('id', 'guessRow-' + guessRowIdx + '-tile-' + guessIdx)
            tileElement.classList.add('tile')
            rowElement.append(tileElement)
        })
        tileDisplay.append(rowElement)
    })

    // create keyboard
    const handleClick = (event) => {
        if (!isGameOver) {
            const letter = event.currentTarget.id
            if (letter === 'DEL') {
                console.log('Delete')
                deleteLetter()
                return
            }
            if (letter === 'ENTER') {
                console.log('Check Row')
                checkRow()
                return
            }
            addLetter(letter)
        }
    }

    const addLetter = (letter) => {
        if (currentTile < wordLength && currentRow < numberTries) {
            const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
            tile.textContent = letter
            guessRows[currentRow][currentTile] = letter
            tile.setAttribute('data', letter)
            currentTile++
        }
    }

    const deleteLetter = () => {
        if (currentTile > 0) {
            currentTile--
            const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile)
            tile.textContent = ''
            guessRows[currentRow][currentTile] = ''
            tile.setAttribute('data', '')
        }
    }

    const checkRow = () => {
        const guessWord = guessRows[currentRow].join('').toLowerCase()
        console.log('guess to check w/ api:', guessWord)
        if (currentTile === 5) {
            fetch(`https://word-get-and-check.herokuapp.com/check/?word=${guessWord}`)
                .then(response => response.json())
                .then(json => {
                    if (json == 'Entry word not found') {
                        showMessage('Word is not in dictionary!')
                        return
                    } else {
                        const guess = guessRows[currentRow].join('').toLowerCase()
                        flipTile()
                        if (word === guess) {
                            showMessage('Magnifient, you won!')
                            isGameOver = true
                            return
                        } else {
                            console.log(guess + " does NOT match " + word)
                            if (currentRow >= numberTries - 1) {
                                isGameOver = true
                                showMessage('Game Over')
                                return
                            }
                            if (currentRow < 5) {
                                currentRow++
                                currentTile = 0
                                return
                            }
                        }
                    }
                }).catch(err => console.log(err))

        }
    }

    const showMessage = (message) => {
        const messageElement = document.createElement('p')
        messageElement.textContent = message
        messageDisplay.append(messageElement)
        setTimeout(() => messageDisplay.removeChild(messageElement), 2000)
    }

    const addColorToKey = (keyLetter, colorClass) => {
        const key = document.getElementById(keyLetter)
        key.classList.add(colorClass)
    }

    //  helper function to replace string at location
    const replaceByIndex = (original_str, idx, replacement_str) => {
        let output_ls = []
        for (let i = 0; i < original_str.length; i++) {
            const letter = original_str[i]
            if (i === idx) {
                output_ls.push(replacement_str)
            } else {
                output_ls.push(letter)
            }
        }
        return output_ls.join('')
    }

    const flipTile = () => {
        const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes
        const guess = []
        const animation_length = 500
        let checkWord = word.toLowerCase()

        // Make guesses grey by default
        rowTiles.forEach((tile, idx) => {
            guess.push({
                letter: tile.getAttribute('data').toLowerCase(),
                color: 'grey-overlay'
            })
        })

        guess.forEach((g, idx) => {
            if (g.letter == word[idx]) {
                g.color = 'green-overlay'
                checkWord = replaceByIndex(checkWord, idx, '*')
            } else if (checkWord.includes(g.letter)) {
                g.color = 'yellow-overlay'
            }
        })

        // guess.forEach((g, idx) => {

        // })

        rowTiles.forEach((tile, idx) => {
            const guessLetter = guess[idx]
            setTimeout(() => {
                tile.classList.add('flip')
                tile.classList.add(guessLetter.color)
                addColorToKey(guessLetter.letter.toUpperCase(), guessLetter.color)
            }, animation_length * idx)
        })


    }

    keys.forEach(k => {
        const buttonElement = document.createElement('button')
        buttonElement.textContent = k
        buttonElement.setAttribute('id', k)
        buttonElement.addEventListener('click', handleClick)
        keyboard.append(buttonElement)
    })
})