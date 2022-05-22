import random
import json

file1 = open('blockle.txt', 'r')
Lines = file1.readlines()

day = 14
# Strips the newline character
boards = []
for line in Lines:
    if day == 366:
        break
    day += 1
    moves = int(line[:2])
    par = random.randint(0, 3)
    board = line[3:]
    seen = set()
    blocks = []
    for c in board:
        if c != 'o':
            if c not in seen:
                orientation = 1
                if c+c in board:
                    orientation = 0
                length = board.count(c)
                index = board.find(c)
                x = index % 6
                y = int(index / 6)
                block = {
                    "orientation": orientation,
                    "length": length,
                    "x": x,
                    "y": y
                }
                if c == 'A':
                    blocks.insert(0, block)
                else:
                    blocks.append(block)
                seen.add(c)
    boardJson = {
        "day": day,
        "moves": moves,
        "par": par,
        "blocks": blocks
    }
    boards.append(boardJson)

with open('boards.json', 'w') as fout:
    json.dump(boards, fout)









