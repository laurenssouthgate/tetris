const tetris = () => {
    const canvas = document.getElementById('tetris') as HTMLCanvasElement
    const context = canvas.getContext('2d')

    

    context.fillStyle = '#000'
    context.fillRect(0, 0, canvas.width, canvas.height)

    const matrix = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ]
}

tetris()