# QuickDraw 

This project is to train a model to recognize drawing.

## Prerequisites

This [page](https://www.npmjs.com/package/canvas) contains the list of prerequisites for canvas

- Ubuntu

        sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

## Installation

    npm install


## Benchmark
The benchmark contains python and js code to see how faster it is to convert strokes to images.
Resizing an image in js is faster when using ctx.translate instead of using a second canvas for cropping.

## script

The script files allowd to download the quickdraw ndjson files, to generate the labels file and to train the model.

### Download the ndjson files

- Download the quickdraw dataset files

    ./script download <number of file to download>

- Generate label types

    ./script create  <training | validation | testing >

- Train the model
    
    ./script train

## See in action

In this repository the model is deployed server side. But in can be possible to deploy it directly in the browser.

### launch the server

    ts-node server/server.ts

### launch the client

    npx parcel client/index.html



## Run the docker image
To run source code from disk on docker container
    ```bash
    npm run build-wip
    npm run wip
    ```
To create and run a stand alone docker image run 
    ```bash
    npm run build-prod
    npm run prod
    ```
To do any local training of the models run 
    ```bash
    npm run train
    ```

### Special Thanks
 - Kyle Suttlemyre for dockerizing the project