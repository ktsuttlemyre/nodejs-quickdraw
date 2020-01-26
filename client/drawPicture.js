const clearButton = document.getElementById('clear-button');

clearButton.addEventListener('click', () => {

    const update = {
        datasets: [{
            data: [60, 10, 10, 20],
            backgroundColor: ['blue','yellow', 'green', 'red', 'pink'],
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Red',
            'Yellow',
            'Blue',
            'test'
        ]
    };

    myDoughnutChart.data = update;
    myDoughnutChart.update();

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    initializeCanvas();
})