// Set up canvas
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")
canvas.width = 0.95 * window.innerWidth
canvas.height = canvas.width
let unitHeight = canvas.height / 6
let unitWidth = canvas.width / 6
window.onload = updateView;
window.onresize = updateView;
function updateView() {
    canvas.width = 0.95 * window.innerWidth
    canvas.height = canvas.width
    unitHeight = canvas.height / 6
    unitWidth = canvas.width / 6
    blocks.forEach(drawBlocks)
    drawCage()
    openModalRules()
}

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
const data = {
    day: 14,
    moves: 17,
    blocks: [
        {
            orientation: 0,
            x: 2,
            y: 2,
            length: 2
        },
        {
            orientation: 0,
            x: 0,
            y: 1,
            length: 2
        },
        {
            orientation: 1,
            x: 0,
            y: 2,
            length: 2
        },
        {
            orientation: 1,
            x: 1,
            y: 2,
            length: 2
        },
        {
            orientation: 1,
            x: 4,
            y: 0,
            length: 3
        },
        {
            orientation: 1,
            x: 2,
            y: 3,
            length: 2
        },
        {
            orientation: 1,
            x: 1,
            y: 4,
            length: 2
        },
        {
            orientation: 0,
            x: 3,
            y: 3,
            length: 2
        },
        {
            orientation: 0,
            x: 3,
            y: 4,
            length: 2
        },
        {
            orientation: 0,
            x: 2,
            y: 5,
            length: 3
        }
    ]
}

// leaderboard data to store
// {"game_number": game_number, "moves_over_optimal": moves, "par": par}
let cookiePrefix = "BlockleCookie="

function readGamesFromCookie() {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        // find the Blockle cookie
        if (cookie.indexOf(cookiePrefix) === 0) {
            return JSON.parse(cookie.substring(cookiePrefix.length, cookie.length));
        }
    }
    return null;
}

function addGameToCookie(game_number, moves, optimal, par) {
    gameData = {"game_number": game_number, "moves": moves, "optimal": optimal, "par": par}
    games = readGamesFromCookie()
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
            games.push(gameData)
        }
    } else {
        games = [gameData]
    }

    const cookie = cookiePrefix + JSON.stringify(games) + ";";
    document.cookie = cookie;
}


// load in data
let blockleNum = data["day"]
let blocklePar = data["par"] || 0
let optimalMoveNum = data["moves"]
var blocks = data["blocks"]

// Initial setup
blocks.forEach(drawBlocks)
blocks.forEach(updateGrid)
createEmojiBoard()
drawCage()
openModalRules()


// Handle moving
canvas.addEventListener('pointerdown', getBlock)
canvas.addEventListener('pointermove', moveBlock)
canvas.addEventListener('pointerup', confirmMove)


// Function definitions
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

function openModal() {
    document.getElementById("gameOver").style.display = "block"
}

function closeModal() {
    document.getElementById("gameOver").style.display = "none"
}

var modal = document.getElementById('gameOver');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal()
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
        document.getElementById("your_stats").innerHTML = "Your Moves: " + movesTaken
        document.getElementById("blockle_stats").innerHTML = "Optimal: " + optimalMoveNum + "\tPar: " + blocklePar
        document.getElementById("blockle_score").innerHTML = "Blockle Score: " + (movesTaken - optimalMoveNum - blocklePar)
        document.getElementById("emoji").innerHTML = emojiBoard;
        addGameToCookie(blockleNum, movesTaken, optimalMoveNum, blocklePar)

        var games = readGamesFromCookie()
        var totalGames = 0
        var totalBlockleScore = 0
        var blockleBuckets = {
            "0": 0,
            "1-2": 0,
            "3-4": 0,
            "5+": 0,
        }
        for (i in games) {
            game = games[i]
            totalGames += 1
            totalBlockleScore += game["moves"] - game["optimal"] - game["par"]
            var movesOverOptimal = game["moves"] - game["optimal"]
            if (movesOverOptimal == 0) {
                blockleBuckets["0"] += 1
            } else if (movesOverOptimal == 1 || movesOverOptimal == 2) {
                blockleBuckets["1-2"] += 1
            } else if (movesOverOptimal == 3 || movesOverOptimal == 4) {
                blockleBuckets["3-4"] += 1
            } else {
                blockleBuckets["5+"] += 1
            }
        }
        var averageBlockleScore = totalBlockleScore / totalGames

        // todo: buckets
        document.getElementById("all_time_total_blockle").innerHTML = "Blockle Score: " + totalBlockleScore
        document.getElementById("all_time_average_blockle").innerHTML = "Average Blockle Score: " + averageBlockleScore
        openModal()
        shareText = 'Blockle #' + blockleNum + '  Moves: ' + movesTaken + '\n' + emojiBoard
        shareData = {
            text: shareText,
            url: shareUrl
        }
    }
}

const btn = document.querySelector('button');

btn.addEventListener('click', async () => {
    try {
        await navigator.share(shareData)
    } catch (err) {
        await navigator.share(shareData)
        navigator.clipboard.writeText(shareText + shareUrl)
        btn.innerHTML = 'copied!'
    }
});
