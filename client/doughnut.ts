import { Chart } from 'chart.js'

export class Doughnut {
    chart: Chart
    ctx: CanvasRenderingContext2D;
    data = {
        datasets: [{
            data: [100],
            backgroundColor: ['black'],
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'nothing'
        ]
    };
    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }
    init() {
        this.chart = new Chart(this.ctx, {
            type: 'doughnut',
            data: this.data,
            options: {
                legend: { display: true, labels: { fontSize: 30 } }
            }
        })
    }

    update({ labels, data }: { labels: string[], data: number[] }) {
        const backgroundColor = ['blue', 'yellow', 'green', 'red', 'pink'];
        const update = { labels, datasets: [{ data, backgroundColor }] }
        console.log('test', this.data.datasets)
        this.chart.data = update;
        this.chart.update();
    }
    clear() {
        this.chart.data = this.data;
        this.chart.update();
    }
}

