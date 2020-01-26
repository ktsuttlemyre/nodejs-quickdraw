export class Drawing {

    pos = { x: 0, y: 0 }
    ctx: CanvasRenderingContext2D;
    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d');

        this.AddEventListeners()
        this.init();
    }

    init() {
        this.ctx.fillStyle = '#000000'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    AddEventListeners() {
        this.canvas.addEventListener('mousedown', e => this.onMove(e))
        this.canvas.addEventListener('mouseenter', e => this.onEnter(e))
        this.canvas.addEventListener('mousemove', e => this.onDown(e))
    }

    onMove(e: MouseEvent) {
        console.log('onMove')
        this.setPosition(e);
    }

    onEnter(e: MouseEvent) {
        console.log('onEnter')
        this.setPosition(e);
    }

    onDown(e: MouseEvent) {
        console.log('onDown')
        if (e.buttons !== 1) {
            return;
        }

        console.log('drawing', e.buttons)

        this.ctx.beginPath(); // begin

        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#ffffff';

        this.ctx.moveTo(this.pos.x, this.pos.y);
        this.setPosition(e);
        this.ctx.lineTo(this.pos.x, this.pos.y);

        this.ctx.stroke();
    }

    setPosition(e: MouseEvent) {
        this.pos.x = e.offsetX;
        this.pos.y = e.offsetY;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.init();
    }

    getImgData(): ImageData {
        // const scaled = 
        this.ctx.drawImage(this.canvas, 0, 0, 28, 28);
        return this.ctx.getImageData(0, 0, 28, 28);
    }

}