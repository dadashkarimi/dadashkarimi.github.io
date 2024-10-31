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
    square: (x, y, size) => {
        context.fillRect(x, y, size, size);
        context.strokeRect(x, y, size, size);
    },
    text: (str, x, y) => {
        context.fillText(str, x, y);
    },
    textSize: (size) => {
        context.font = `${size}px sans-serif`;
    }
};

let context;
let nn; // Neural network

function squares(p) {
    const colors = ['#84B4F9', '#1231B5', '#BFE9DC', '#39948E', '#FAC832', '#FECBCA', '#F83735'];
    let currentRow = 0;
    let currentCol = 0;
    let animationInterval;

    setup();

    function setup() {
        const rekt = document.getElementById('birbs').getBoundingClientRect();
        const canvas = document.querySelector('#birbs > canvas');
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
        p.textSize(40); // Set the text size for digits

        // Create the neural network
        nn = new brain.NeuralNetwork({ hiddenLayers: [10] }); // Simple 1 hidden layer NN

        // Train the network with a sample dataset
        trainNetwork();

        // Start drawing shapes on initial load
        draw();

        // Add event listener for click to reset grid
        canvas.addEventListener('click', reset);
    }

    function trainNetwork() {
        // Training data: Input: array of pixel values, Output: digit as one-hot encoded
        const trainingData = [
            { input: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], output: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0] }, // 0
            { input: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0], output: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0] }, // 1
            { input: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], output: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0] }, // 2
            // Add more samples for 3-9...
        ];
        nn.train(trainingData, { iterations: 20000, log: true });
    }

    function draw() {
        const minCells = Math.floor(p.random(5, 7)); // Randomize number of cells
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

        // Start the animation loop
        animationInterval = setInterval(() => {
            if (currentCol < cols) {
                const digit = p.random(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']); // Random digit
                p.fill(p.random(colors));
                drawDigitForCell(digit, cellSize, currentRow, currentCol);

                // Move to the next cell
                currentCol++;
                if (currentCol >= cols) {
                    currentCol = 0;
                    currentRow++;
                }
                // If we've gone through all rows, stop the animation
                if (currentRow >= rows) {
                    clearInterval(animationInterval);
                }
            }
        }, 100); // Adjust the speed of the animation here (in milliseconds)
    }

    function reset() {
        // Reset the grid state
        currentRow = 0;
        currentCol = 0;
        draw(); // Call draw to start a new animation
    }

    function drawDigitForCell(digit, cellSize, i, j) {
        if (i < 0 || j < 0) return;
        const y = i * cellSize + (cellSize / 1.5); // Center the text vertically
        const x = j * cellSize + (cellSize / 4); // Center the text horizontally
        p.push();
        p.translate(j * cellSize, i * cellSize); // Position for square
        p.square(0, 0, cellSize); // Draw square
        p.fill('black'); // Set text color
        p.text(digit, x, y); // Draw digit in the center of the square
        p.pop();
    }
}

window.p = p5Polyfill;
squares(p);

