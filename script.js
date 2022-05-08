var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")
canvas.width = 0.95 * window.innerWidth
canvas.height = canvas.width
let unitHeight = canvas.height/6
let unitWidth = canvas.width/6

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
const data = 
{
    moves: 3,
    blocks: [
        {
            orientation: 0,
            x: 0,
            y: 2,
            length: 2
        },
        {
            orientation: 1,
            x: 1,
            y: 0,
            length: 2
        },
        {
            orientation: 1,
            x: 2,
            y: 2,
            length: 2
        },
        {
            orientation: 1,
            x: 0,
            y: 4,
            length: 2
        },
        {
            orientation: 1,
            x: 4,
            y: 1,
            length: 2
        },
        {
            orientation: 0,
            x: 3,
            y: 4,
            length: 3
        }
    ]
}

// load in data
let optimalMoveNum = data["moves"]
var blocks = data["blocks"]

// Initial setup
blocks.forEach(drawBlocks)
blocks.forEach(updateGrid)
drawCage()

// Handle moving

canvas.addEventListener('pointerdown', function(e) {
    getBlock(canvas, e)
})

canvas.addEventListener('pointermove', function(e) {
    moveBlock(canvas, e)
})

canvas.addEventListener('pointerup', function(e) {
    confirmMove(canvas, e)
})


// Function definitions
function drawBlocks(block, index) {
    if (index != selectedBlock) {
        var blockHeight
        var blockWidth
        var blockColor = "#E88300"
        // 0 if block is horizantal 1 if vertical
        if (block["orientation"] == 0) {
            blockWidth = unitWidth * block["length"]
            blockHeight = unitHeight
        }
        else {
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
    ctx.beginPath()
    ctx.moveTo(canvas.width, 2*unitHeight);
    ctx.lineTo(canvas.width, 0);
    ctx.stroke();
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    ctx.lineTo(canvas.width, 3*unitHeight);
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
        }
        else {
            blockHeight = unitHeight * block["length"]
            blockWidth = unitWidth
        }
        // change block color to red if first block in list
        if (index == 0) {
            blockColor = "#DC0100"
        }
        ctx.beginPath()
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
        }
        else {
            y++
        }
    }
}

var initialX
var initalY
function getBlock(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    initialX = event.clientX - rect.left
    initialY = event.clientY - rect.top
    console.log(initialX)
    console.log(initialY)
    var selectedX = Math.floor(initialX/unitWidth)
    var selectedY = Math.floor(initialY/unitHeight)
    console.log(selectedX)
    console.log(selectedY)
    selectedBlock = grid[selectedX][selectedY]
}

var tempX
var tempY

function moveBlock(canvas, event) {

    if (selectedBlock >= 0) {
        var leftBound = 0
        for (var lb = blocks[selectedBlock]["x"]; lb > 0; lb--) {
            if (grid[lb-1][blocks[selectedBlock]["y"]] != -1) {
                leftBound = lb
                break
            }
        }
        var rightBound = 6
        for (var rb = blocks[selectedBlock]["x"] + blocks[selectedBlock]["length"] - 1; rb < 5; rb++) {
            if (grid[rb+1][blocks[selectedBlock]["y"]] != -1) {
                rightBound = rb + 1
                break
            }
        }
        var upperBound = 0
        for (var ub = blocks[selectedBlock]["y"]; ub > 0; ub--) {
            if (grid[blocks[selectedBlock]["x"]][ub-1] != -1) {
                upperBound = ub
                break
            }
        }
        var lowerBound = 6
        for (var lwb = blocks[selectedBlock]["y"] + blocks[selectedBlock]["length"] - 1; lwb < 5; lwb++) {
            if (grid[blocks[selectedBlock]["x"]][lwb+1] != -1) {
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
        offsetX = (newX - initialX)/unitWidth
        offsetY = (newY - initialY)/unitHeight    
        if (blocks[selectedBlock]["orientation"] == 0) {
            tempX = blocks[selectedBlock]["x"] + offsetX
            if (tempX < leftBound) {
                tempX = leftBound
            }
            else if (tempX + blocks[selectedBlock]["length"] > rightBound) {
                tempX = rightBound - blocks[selectedBlock]["length"]
            }
            drawBlockTemp(blocks[selectedBlock], selectedBlock, tempX, blocks[selectedBlock]["y"])
        }
        else {
            tempY = blocks[selectedBlock]["y"] + offsetY  
            if (tempY < upperBound) {
                tempY = upperBound
            }
            else if (tempY + blocks[selectedBlock]["length"] > lowerBound) {
                tempY = lowerBound - blocks[selectedBlock]["length"]
            }
            drawBlockTemp(blocks[selectedBlock], selectedBlock, blocks[selectedBlock]["x"], tempY)
        }
    }
}

var interval
function confirmMove(canvas, event) {
    if (selectedBlock >= 0) {
        if (blocks[selectedBlock]["orientation"] == 0) {
            if (blocks[selectedBlock]["x"] != Math.round(tempX)) {
                movesTaken++
            }
            blocks[selectedBlock]["x"] = Math.round(tempX)
        }
        else {
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

var elapsed = 0
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
    }
}

    