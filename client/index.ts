import { Prediction } from "./prediction";
import { Drawing } from "./drawing";
import { Doughnut } from "./doughnut";

const URL = 'ws://localhost:4000/test'
const canvas: HTMLCanvasElement = document.getElementById('draw-canvas') as HTMLCanvasElement;

const draw = new Drawing(canvas)

const button = document.getElementById('clear-button') as HTMLButtonElement;
button.addEventListener('click', clearCanvas);

const chartCanvas: HTMLCanvasElement = document.getElementById('doughnut') as HTMLCanvasElement;
const doughnut = new Doughnut(chartCanvas);

new Prediction(draw, URL).getdataObservable().subscribe((data: any )=> {
    console.log('prediction', data)
    doughnut.update(data);
} );


function clearCanvas(e: Event) {
    draw.clear()
    doughnut.clear();
}