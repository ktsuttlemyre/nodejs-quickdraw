import { createCanvas, Canvas, ImageData } from 'canvas'

interface config {
    vectorImages: number[][][][];
    side?: number;
    lineDiameter?: number;
    padding?: number;
    bgColor?: number[];
    fgColor?: number[];
    resizeSize?: number;
    saveImage?: boolean;
    prefix?: string;
}

export function vectorToRaster(
    { vectorImages, side = 28, lineDiameter = 16,
        padding = 16, bgColor = [0, 0, 0], fgColor = [255, 255, 255],
        resizeSize = 28, saveImage = false, prefix }: config) {

    const originalSide = 256
    const canvas = createCanvas(originalSide, originalSide)
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = lineDiameter

    const totalPadding = padding * 2 + lineDiameter
    const newScale = side / (originalSide + totalPadding)
    console.log('scale', newScale)

    // second canvas for resizing

    const resizedCanvas = createCanvas(resizeSize, resizeSize)
    const ctx2 = resizedCanvas.getContext('2d')

    const rasterImages: number[][] = [];
    let index = 0;
    for (let i = 0; i < vectorImages.length; i++) {
        const vectorImage = vectorImages[i];
        console.log(`processing image ${index++}`)
        ctx.fillStyle = `rgb(${bgColor.toString()})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const bbox = vectorImage.reduce((a, b) => {
            return [Math.max(a[0], ...b[0]), Math.max(a[1], ...b[1])]
        }, [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY])

        const offset = bbox.map(b => (256 - b) / 2)

        const centered = vectorImage.map(a => a.map((a, i) => a.map(e => e + offset[i])))

        centered.forEach(([xv, yv]) => {
            ctx.beginPath();

            ctx.strokeStyle = `rgb(${fgColor.toString()})`
            ctx.moveTo(xv[0], yv[0]);
            ctx.strokeText(`text ${xv[0]}`, xv[0], yv[0])
            xv.forEach((x, i) => {
                const y = yv[i];
                ctx.lineTo(x, y);
            })
            ctx.stroke()

        });

        ctx2.drawImage(canvas, 0, 0, 256, 256, 0, 0, 28, 28)
        if (saveImage) {
            saveToFile(resizedCanvas, i, prefix);
        }
        rasterImages.push(Array.from(ctx2.getImageData(0, 0, resizeSize, resizeSize).data))
    }
    return rasterImages

}

export function vectorToRasterScaling({ vectorImages, side = 28, lineDiameter = 16,
    padding = 16, bgColor = [0, 0, 0], fgColor = [255, 255, 255], resizeSize = 28,
    saveImage = false, prefix }: config) {
    const originalSide = 256
    const canvas = createCanvas(originalSide, originalSide)
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = lineDiameter
    const totalPadding = padding * 2 + lineDiameter
    const newScale = side / (originalSide + totalPadding)

    ctx.scale(newScale, newScale)
    ctx.translate(totalPadding / 2, totalPadding / 2)

    // second canvas for resizing

    const rasterImages: any = [];
    for (let i = 0; i < vectorImages.length; i++) {
        const vectorImage = vectorImages[i];
        console.log(`processing image ${i}`)
        ctx.fillStyle = `rgb(${bgColor.toString()})`
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const bbox = vectorImage.reduce((a, b) => {
            return [Math.max(a[0], ...b[0]), Math.max(a[1], ...b[1])]
        }, [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY])

        const offset = bbox.map(b => (256 - b) / 2)

        const centered = vectorImage.map(a => a.map((a, i) => a.map(e => e + offset[i])))

        centered.forEach(([xv, yv]) => {
            ctx.beginPath();

            ctx.strokeStyle = `rgb(${fgColor.toString()})`
            ctx.moveTo(xv[0], yv[0]);
            ctx.strokeText(`text ${xv[0]}`, xv[0], yv[0])
            xv.forEach((x, i) => {
                const y = yv[i];
                ctx.lineTo(x, y);
            })
            // ctx.closePath()
            ctx.stroke()
        });

        if (saveImage) {
            saveToFile(canvas, i, prefix);
        }

        rasterImages.push(ctx.getImageData(0, 0, resizeSize, resizeSize).data)
    }
    return rasterImages
}

/**
 * 
 * @param canvas element to save to file
 * @param index name to give to save file
 * @param prefix will be added to begining of file or for creating path
 */
export function saveToFile(canvas: Canvas, index: number, prefix?: string) {
    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + `/image/${prefix ? prefix : ''}${index}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => console.log('The PNG file was created.'))
}



/*
generate sample image
vectorToRasterScaling({
    saveImage: true, prefix: 'benchmark',
    vectorImages: [[[[0, 15, 61, 99, 137, 143, 204, 199], [230, 195, 112, 50, 0, 33, 222, 221]], [[16, 19, 46, 56, 64, 66, 59, 86, 90, 176, 178, 173, 173, 201, 197, 197], [226, 224, 226, 213, 208, 218, 250, 255, 212, 216, 217, 225, 253, 253, 238, 215]], [[106, 106, 109], [49, 136, 198]], [[156, 158, 148, 153], [13, 36, 110, 222]], [[35, 57, 192], [117, 123, 130]], [[34, 105, 197], [149, 152, 165]], [[32, 125, 219], [170, 179, 179]]]]
})
 */