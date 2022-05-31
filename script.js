// Set up canvas
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")
canvas.width = 0.95 * window.innerWidth
canvas.height = canvas.width
let unitHeight = canvas.height / 6
let unitWidth = canvas.width / 6
var emojiBoard = ""
var movesTaken = 0

// State Variables
var selectedBlock = -1
var grid = [
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1]
]

// Change daily inital postions
// First block is main red block
// Orientation 0 for horizontal and 1 for vertical
const gameBeginning = new Date('22 May 2022').setHours(0, 0, 0, 0);

const dateIndex = (beginning, date) =>
    Math.round((date.setHours(0, 0, 0, 0) - beginning) / 864e5)

const data = boards[dateIndex(gameBeginning, new Date())]

// leaderboard data to store
// {"game_number": game_number, "moves_over_optimal": moves, "par": par}
let blockleStorageName = "BlockleStorage"

function readGamesFromStorage() {
    return JSON.parse(localStorage.getItem(blockleStorageName))
}

function addGameToStorage(game_number, moves, optimal, par) {
    gameData = {"game_number": game_number, "moves": moves, "optimal": optimal, "par": par}
    games = readGamesFromStorage()
    if (games) {
        var foundGame = false
        // only push game if you have a better score
        for (const game of games) {
            if (game.game_number == game_number) {
                foundGame = true
                if (game.moves >= moves) {
                    game.game_number = game_number
                    game.moves = moves
                    game.optimal = optimal
                    game.par = par
                }
            }
        }
        if (!foundGame) {
            // 1st attempt of day
            games.push(gameData)
        }
    } else {
        games = [gameData]
    }

    localStorage.setItem(blockleStorageName, JSON.stringify(games));
}


// load in data
let blockleNum = data["day"]
let blocklePar = data["par"] || 0
let optimalMoveNum = data["moves"]
var blocks = data["blocks"]

// reload view
window.onload = updateView;
window.onresize = updateView;
function updateView() {
    canvas.width = 0.95 * window.innerWidth
    canvas.height = canvas.width
    unitHeight = canvas.height / 6
    unitWidth = canvas.width / 6
    blocks.forEach(drawBlocks)
    drawCage()
    openModal(blockleNum)
}

// Initial setup
blocks.forEach(drawBlocks)
blocks.forEach(updateGrid)
createEmojiBoard()
drawCage()
openModal(blockleNum)


// Handle moving
canvas.addEventListener('pointerdown', getBlock)
canvas.addEventListener('pointermove', moveBlock)
canvas.addEventListener('pointerup', confirmMove)


// Function definitions
function openModal(game_number) {
    games = readGamesFromStorage()
    var foundGame = false
    if (games) {
        for (const game of games) {
            if (game.game_number == game_number) {
                foundGame = true
            }
        }
    }

    if (foundGame) {
        openModalGameOver(game_number)
    } else {
        openModalRules()
    }
}

function openModalRules() {
    document.getElementById("rules").style.display = "block"
}

function closeModalRules() {
    document.getElementById("rules").style.display = "none"
}

var rulesModal = document.getElementById('rules');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == rulesModal) {
        closeModalRules()
    }
}

var span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    rulesModal.style.display = "none";
}

function drawBlocks(block, index) {
    ctx.lineWidth = 1
    if (index != selectedBlock) {
        var blockHeight
        var blockWidth
        var blockColor = "#E88300"
        // 0 if block is horizantal 1 if vertical
        if (block["orientation"] == 0) {
            blockWidth = unitWidth * block["length"]
            blockHeight = unitHeight
        } else {
            blockHeight = unitHeight * block["length"]
            blockWidth = unitWidth
        }
        // change block color to red if first block in list
        if (index == 0) {
            blockColor = "#DC0100"
        }
        x = block["x"] * unitWidth
        y = block["y"] * unitHeight
        ctx.beginPath()
        ctx.rect(x, y, blockWidth, blockHeight)
        ctx.fillStyle = blockColor
        ctx.fill()
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, blockWidth, blockHeight);
        ctx.closePath()
    }
}

function drawCage() {
    ctx.lineWidth = 10 // emphasized border
    ctx.beginPath()
    ctx.moveTo(canvas.width, 2 * unitHeight);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    ctx.lineTo(canvas.width, 3 * unitHeight);
    ctx.stroke();
    ctx.closePath()
    ctx.beginPath()
    ctx.moveTo(canvas.width, 2 * unitHeight);
    ctx.lineTo(canvas.width, 3 * unitHeight);
    ctx.strokeStyle = "#FFFFFF"
    ctx.stroke();
    ctx.closePath()
}

function drawBlockTemp(block, index, x, y) {
    var blockHeight
    var blockWidth
    var blockColor = "#E88300"
    // 0 if block is horizantal 1 if vertical
    if (block["orientation"] == 0) {
        blockWidth = unitWidth * block["length"]
        blockHeight = unitHeight
    } else {
        blockHeight = unitHeight * block["length"]
        blockWidth = unitWidth
    }
    // change block color to red if first block in list
    if (index == 0) {
        blockColor = "#DC0100"
    }
    ctx.beginPath()
    ctx.lineWidth = 2 // add some emphasis on the selected block
    ctx.rect(x * unitWidth, y * unitHeight, blockWidth, blockHeight)
    ctx.fillStyle = blockColor
    ctx.fill()
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(x * unitWidth, y * unitHeight, blockWidth, blockHeight);
    ctx.closePath()
}

function clearGrid() {
    grid = [
      [-1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1],
      [-1, -1, -1, -1, -1, -1]
    ]
}

function updateGrid(block, index) {
    x = block["x"]
    y = block["y"]
    for (var i = 0; i < block["length"]; i++) {
        grid[x][y] = index
        if (block["orientation"] == 0) {
            x++
        } else {
            y++
        }
    }
}

function createEmojiBoard() {
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < 6; x++) {
            if (grid[x][y] == -1) {
                emojiBoard += "⬜️"
            } else if (grid[x][y] == 0) {
                emojiBoard += "🟥"
            } else {
                emojiBoard += "🟧"
            }
        }
        emojiBoard += "\n"
    }
}

var initialX
var initalY

function getBlock() {
    const rect = canvas.getBoundingClientRect()
    initialX = event.clientX - rect.left
    initialY = event.clientY - rect.top
    var selectedX = Math.floor(initialX / unitWidth)
    var selectedY = Math.floor(initialY / unitHeight)
    selectedBlock = grid[selectedX][selectedY]
    moveBlock(event)
}

var tempX
var tempY

function moveBlock() {

    if (selectedBlock >= 0) {
        var leftBound = 0
        for (var lb = blocks[selectedBlock]["x"]; lb > 0; lb--) {
            if (grid[lb - 1][blocks[selectedBlock]["y"]] != -1) {
                leftBound = lb
                break
            }
        }
        var rightBound = 6
        for (var rb = blocks[selectedBlock]["x"] + blocks[selectedBlock]["length"] - 1; rb < 5; rb++) {
            if (grid[rb + 1][blocks[selectedBlock]["y"]] != -1) {
                rightBound = rb + 1
                break
            }
        }
        var upperBound = 0
        for (var ub = blocks[selectedBlock]["y"]; ub > 0; ub--) {
            if (grid[blocks[selectedBlock]["x"]][ub - 1] != -1) {
                upperBound = ub
                break
            }
        }
        var lowerBound = 6
        for (var lwb = blocks[selectedBlock]["y"] + blocks[selectedBlock]["length"] - 1; lwb < 5; lwb++) {
            if (grid[blocks[selectedBlock]["x"]][lwb + 1] != -1) {
                lowerBound = lwb + 1
                break
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        blocks.forEach(drawBlocks)
        drawCage()
        const rect = canvas.getBoundingClientRect()
        var newX = event.clientX - rect.left
        var newY = event.clientY - rect.top
        offsetX = (newX - initialX) / unitWidth
        offsetY = (newY - initialY) / unitHeight
        if (blocks[selectedBlock]["orientation"] == 0) {
            tempX = blocks[selectedBlock]["x"] + offsetX
            if (tempX < leftBound) {
                tempX = leftBound
            } else if (tempX + blocks[selectedBlock]["length"] > rightBound) {
                tempX = rightBound - blocks[selectedBlock]["length"]
            }
            drawBlockTemp(blocks[selectedBlock], selectedBlock, tempX, blocks[selectedBlock]["y"])
        } else {
            tempY = blocks[selectedBlock]["y"] + offsetY
            if (tempY < upperBound) {
                tempY = upperBound
            } else if (tempY + blocks[selectedBlock]["length"] > lowerBound) {
                tempY = lowerBound - blocks[selectedBlock]["length"]
            }
            drawBlockTemp(blocks[selectedBlock], selectedBlock, blocks[selectedBlock]["x"], tempY)
        }
    }
}

var interval

function confirmMove() {
    if (selectedBlock >= 0) {
        if (blocks[selectedBlock]["orientation"] == 0) {
            if (blocks[selectedBlock]["x"] != Math.round(tempX)) {
                movesTaken++
            }
            blocks[selectedBlock]["x"] = Math.round(tempX)
        } else {
            if (blocks[selectedBlock]["y"] != Math.round(tempY)) {
                movesTaken++
            }
            blocks[selectedBlock]["y"] = Math.round(tempY)
        }
    }
    document.getElementById("score").innerHTML = movesTaken;
    selectedBlock = -1
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blocks.forEach(drawBlocks)
    drawCage()
    clearGrid()
    blocks.forEach(updateGrid)
    if (blocks[0]["x"] == 4) {
        selectedBlock = 0
        interval = setInterval(gameOver, 10);
    }
}

function openModalGameOver(game_number) {
    var games = readGamesFromStorage()
    var optimalMoveNum, blocklePar, todaysBest = 0
    if (games) {
        for (const game of games) {
            if (game.game_number == game_number) {
                todaysBest = game.moves
                optimalMoveNum = game.optimal
                blocklePar = game.par
            }
        }
    }
    var totalGames = 0
    var gamesWon = 0
    for (i in games) {
        game = games[i]
        totalGames += 1
        if((game["moves"] - game["optimal"] - game["par"]) <= 0) {
            gamesWon += 1
        }
    }

    document.getElementById("statistic_blockle_num").innerHTML = game_number
    document.getElementById("statistic_optimal").innerHTML = optimalMoveNum
    document.getElementById("statistic_par").innerHTML = optimalMoveNum + blocklePar
    document.getElementById("statistic_your_score").innerHTML = todaysBest

    document.getElementById("statistic_played").innerHTML = totalGames
    document.getElementById("statistic_win_percent").innerHTML = Math.round((gamesWon / totalGames) * 100)
    // document.getElementById("statistic_current_streak").innerHTML = optimalMoveNum + blocklePar
    // document.getElementById("statistic_max_streak").innerHTML = todaysBest
    if(todaysBest <= (optimalMoveNum + blocklePar)) {
        document.getElementById("win_status").innerHTML = "WINNER!"
        document.getElementById("win_status").style.color = "#2c974b"
    } else {
        document.getElementById("win_status").innerHTML = "TRY AGAIN!"
        document.getElementById("win_status").style.color = "red"
    }

    shareText = 'Blockle #' + game_number + '  Moves: ' + todaysBest + '\n' + emojiBoard
    shareData = {
        text: shareText,
        url: shareUrl
    }

    document.getElementById("gameOver").style.display = "block"
}

function closeModalGameOver() {
    document.getElementById("gameOver").style.display = "none"
}

var modal = document.getElementById('gameOver');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        closeModalGameOver()
    }
}

var span = document.getElementsByClassName("close")[1];
span.onclick = function () {
    modal.style.display = "none";
}

var elapsed = 0
var shareText
var shareUrl = 'https://blockle.io'
var shareData

function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blocks.forEach(drawBlocks)
    drawCage()
    drawBlockTemp(blocks[0], 0, 4 + (0.05 * elapsed), blocks[0]["y"])
    elapsed++
    if (elapsed == 41) {
        clearInterval(interval)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        blocks.forEach(drawBlocks)
        drawCage()
        selectedBlock = -1
        canvas.removeEventListener('pointerdown', getBlock)
        canvas.removeEventListener('pointermove', moveBlock)
        canvas.removeEventListener('pointerup', confirmMove)
        addGameToStorage(blockleNum, movesTaken, optimalMoveNum, blocklePar)
        // reload will auto add the game over modal
        setTimeout(()=>{
            window.location.reload(true);
        });
        // openModalGameOver(blockleNum)
    }
}

const btn_share = document.getElementById('button_share');

btn_share.addEventListener('click', async () => {
    try {
        await navigator.share(shareData)
    } catch (err) {
        await navigator.share(shareData)
        navigator.clipboard.writeText(shareText + shareUrl)
        btn_share.innerHTML = 'copied!'
    }
});
