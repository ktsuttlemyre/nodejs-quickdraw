# QuickDraw 

This project is to train a model to recognize drawing.

## Installation

    npm install


## Benchmark
The benchmark contains python and js code to see how faster it is to convert strokes to images.
Resizing an image in js is faster when using ctx.translate instead of using a second canvas for cropping.

## script

The script files allowd to download the quickdraw ndjson files, to generate the labels file and to train the model.

## See in action

In this repository the model is deployed server side. But in can be possible to deploy it directly in the browser.

### launch the server

    ts-node server.ts

### launch the client

    npx parcel index.html
