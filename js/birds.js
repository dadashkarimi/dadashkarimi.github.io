const p5Polyfill = {
    PI: Math.PI,
    HALF_PI: Math.PI / 2,
    random: (a, b) => {
        if (a !== undefined && b !== undefined) {
            return Math.floor(Math.random() * (b - a)) + a;
        } else {
            const i = Math.floor(Math.random() * a.length);
            return a[i];
        }
    },
    fill: (c) => context.fillStyle = c,
    stroke: (c) => context.strokeStyle = c,
    noFill: () => context.fillStyle = 'transparent',
    noStroke: () => context.strokeStyle = 'transparent',
    push: () => context.save(),
    pop: () => context.restore(),
    translate: (x, y) => context.translate(x, y),
    scale: (x, y) => context.scale(x, y),
    rect: (x, y, w, h) => {
        context.fillRect(x, y, w, h);
        context.strokeRect(x, y, w, h);
    },
    square: (x, y, size) => context.fillRect(x, y, size, size)
};

function squares(p) {
    const totalRows = 3;
    const totalCols = 3;
    let img;
    let blockSize;
    const displayDelay = 500;
    let isDrawing = false;

    const folders = ['church/1/', 'church/2/', 'church/3/','church/4/','church/5/',
        'church/6/','church/7/','church/8/','church/9/','church/10/','church/11/',
        'church/12/','church/13/','church/14/','church/15/','church/16/','church/17/',
        'church/18/','church/19/','church/20/','church/21/','church/22/','church/23/',
      'church/24/','church/25/','church/26/','church/27/',
    'church/28/','church/29/','church/30/'];
    const imageName = 'church-doors.png';

    setup();

    function setup() {
        const rekt = document.getElementById('birbs').getBoundingClientRect();
        const canvas = document.querySelector('#birbs > canvas');
        if (!canvas) return;

        context = canvas.getContext('2d');
        canvas.style.width = rekt.width + 'px';
        canvas.style.height = rekt.height + 'px';
        rekt.width *= window.devicePixelRatio;
        rekt.height *= window.devicePixelRatio;
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.width = rekt.width;
        canvas.height = rekt.height;
        p.width = rekt.width;
        p.height = rekt.height;
        p.noStroke();

        loadRandomContent();

        canvas.addEventListener('click', () => {
            if (!isDrawing) loadRandomContent();
        });
    }

    function loadRandomContent() {
        if (window.innerWidth <= 600) {
            // For small screens, always draw shapes (solid squares only)
            drawShapes();
        } else {
            // For larger screens, continue with original random content selection
            if (Math.random() < 0.2) {
                drawShapes();
            } else {
                loadRandomImage();
            }
        }
    }

    function loadRandomImage() {
        isDrawing = true;
        const randomFolder = p.random(folders);
        img = new Image();
        img.src = randomFolder + imageName;
        img.onload = () => {
            blockSize = img.width / totalCols;
            draw();
        };
    }

    function draw() {
        context.clearRect(0, 0, p.width, p.height);
        const indices = Array.from({ length: totalRows * totalCols }, (_, i) => i);
        shuffleArray(indices);

        indices.forEach((index, i) => {
            setTimeout(() => {
                const row = Math.floor(index / totalCols);
                const col = index % totalCols;
                const x = col * blockSize;
                const y = row * blockSize;
                context.drawImage(
                    img,
                    col * blockSize, row * blockSize, blockSize, blockSize,
                    x, y, blockSize, blockSize
                );
                if (i === indices.length - 1) isDrawing = false;
            }, i * displayDelay);
        });
    }

    function drawShapes() {
        isDrawing = true;
        const colors = ['#84B4F9', '#1231B5', '#BFE9DC', '#39948E', '#FAC832', '#FECBCA', '#F83735'];
        const shapes = ['square', 'skip'];

        const minCells = Math.floor(p.random(5, 7));
        p.fill('white');
        p.rect(0, 0, p.width, p.height);

        let rows, cols, cellSize;
        if (p.width <= p.height) {
            cols = minCells;
            cellSize = Math.floor(p.width / cols);
            rows = Math.floor(p.height / cellSize);
        } else {
            rows = minCells;
            cellSize = p.height / rows;
            cols = Math.ceil(p.width / cellSize);
        }

        let currentRow = 0;
        let currentCol = 0;
        const animationInterval = setInterval(() => {
            if (currentCol < cols) {
                p.noStroke();
                p.fill(p.random(colors));
                const shape = p.random(shapes);
                if (shape === 'square') {
                    p.square(currentCol * cellSize, currentRow * cellSize, cellSize);
                }

                currentCol++;
                if (currentCol >= cols) {
                    currentCol = 0;
                    currentRow++;
                }
                if (currentRow >= rows) {
                    clearInterval(animationInterval);
                    isDrawing = false;
                }
            }
        }, 100);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

let context;
window.p = p5Polyfill;
squares(p);
