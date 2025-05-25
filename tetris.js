const STORAGE_KEY = 'TETRIS_HIGH_SCORE'

const canvas = document.getElementById('tetris')
const context = canvas.getContext('2d')

let dropCounter = 0
let dropInterval = 1000
let lastTime = 0

context.scale(20, 20)

context.fillStyle = '#000'
context.fillRect(0, 0, canvas.width, canvas.height)

const arenaSweep = () => {
    let rowCount = 1

    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer
            }
        }

        const row = arena.splice(y, 1)[0].fill(0)
        arena.unshift(row)
        ++y
        player.score += rowCount * 10
        rowCount *= 2
    }
}

const collide = (arena, player) => {
    const [m, o] = [player.matrix, player.pos]

    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0
            ) {
                return true
            }
        }
    }
    return false
}

const createMatrix = (w, h) => {
    const matrix = []

    while (h--) {
        matrix.push(new Array(w).fill(0))
    }

    return matrix
}

const createPiece = (type) => {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ]
    }

    if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ]
    }

    if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ]
    }

    if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ]
    }

    if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ]
    }

    if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ]
    }

    if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ]
    }

}
 
const draw = () => {
    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    drawMatrix(arena, {x: 0, y: 0})
    drawMatrix(player.matrix, player.pos)
}

const drawMatrix = (matrix, offset) => {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value]
                context.fillRect(
                    x + offset.x, 
                    y + offset.y, 
                    1, 
                    1
                )

                context.strokeStyle = '#FFFFFF'
                context.lineWidth = 0.05

                context.strokeRect(x + offset.x, y + offset.y, 1, 1)
            }
        })
    }) 
}

const merge = (arena, player) => {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value
            } 
        })
    })
}

const playerDrop = () => {
    player.pos.y++
    if (collide(arena, player)) {
        player.pos.y--
        merge(arena, player)
        playerReset()
        arenaSweep()
        updateScore()
    }
    dropCounter = 0
}

const playerMove = (dir) => {
    player.pos.x += dir
    if (collide(arena, player)) {
        player.pos.x -= dir
    }
}

const playerReset = () => {
    const pieces = 'ILJOTSZ'
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0])
    player.pos.y = 0
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0))
        updateHighScore()
        player.score = 0
        updateScore()
    }
}

const playerRotate = (dir) => {
    const pos = player.pos.x
    let offset = 1
    rotate(player.matrix, dir)
    while (collide(arena, player)) {
        player.pos.x += offset
        offset = -(offset + (offset > 0 ? 1 : -1))
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir)
            player.pos.x = pos
            return
        }
    }
}

const rotate = (matrix, dir) => {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ]
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse())
    } else {
        matrix.reverse()
    }
}

const updateScore = () => {
    document.getElementById('score').innerHTML = `<span class="score">Score: ${player.score}</span>`

}

const updateHighScore = () => {
    const localScore = localStorage.getItem(STORAGE_KEY)

    if (!localScore) {
        localStorage.setItem(STORAGE_KEY, player.score)
    }

    if (localScore) {
        if (localScore > player.score) return
        
        localStorage.setItem(STORAGE_KEY, player.score)
    }

    document.getElementById('high-score').innerHTML = `<span class="high-score">High Score: ${localScore ?? 0}</span>`
}

const update = (time = 0) => {
    const deltaTime = time - lastTime
    lastTime = time

    dropCounter += deltaTime
    if (dropCounter > dropInterval) {
        playerDrop()
    }

    draw()
    requestAnimationFrame(update)
}

const colors = [
    null,
    '#227C9D',
    '#17C3B2',
    '#FFCB77',
    '#FEF9EF',
    '#FE6D73',
    '#4C2A85',
    '#BCEDF6'
]

const arena = createMatrix(12, 20)

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0
}

document.addEventListener('keydown', e => {
    console.log(e)

    if (e.key === 'ArrowLeft') {
        playerMove(-1)
    }

    if (e.key === 'ArrowRight') {
        playerMove(1)
    }

    if (e.key === 'ArrowDown') {
        playerDrop()
    }

    if (e.key === 'q') {
        playerRotate(-1)
    }

    if (e.key === 'e') {
        playerRotate(1)
    }
})

playerReset()
updateHighScore()
updateScore()
update()

