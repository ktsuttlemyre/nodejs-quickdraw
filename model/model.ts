import * as tf from '@tensorflow/tfjs-node'
import { data } from './dataset';
import { getClasses, IMAGE_H, IMAGE_W, createDirectory } from '../utils/utils';
import { fileSystem } from '@tensorflow/tfjs-node/dist/io';

export function createModel() {
    // Create a sequential neural network model. tf.sequential provides an API
    // for creating "stacked" models where the output from one layer is used as
    // the input to the next layer.
    const classes = getClasses();
    const model = tf.sequential();

    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_H, IMAGE_W, 1],
        kernelSize: 3,
        filters: 16,
        activation: 'relu'
    }));

    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));

    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 64, activation: 'relu' }));
    model.add(tf.layers.flatten({}));
    // model.add(tf.layers.dropout({rate: 0.2}))

    model.add(tf.layers.dense({ units: 164, activation: 'relu' }));

    model.add(tf.layers.dense({ units: classes, activation: 'softmax' }));

    return model;
}

export function train(model: tf.Sequential, trainingSet: tf.data.Dataset<tf.TensorContainer>, validationSet?: tf.data.Dataset<tf.TensorContainer>) {
    const optimizer = 'adam';

    model.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: [top5CategoricalAccuracy],
    });

    model.fitDataset(trainingSet, {
        epochs: 5,
        // validationData: validationSet,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {
                console.log(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(3)}`);
                model.save(`file://saveModel/epoch${epoch}`)
            }
        }
    })


}
function top5CategoricalAccuracy(yTrue: tf.Tensor, yPred: tf.Tensor): tf.Tensor {
    return tf.tidy(
        () => {
            return tf.cast(

                tf.equal(tf.argMax(yTrue, -1).expandDims(-1), tf.topk(yPred, 5).indices).sum().div(yTrue.shape[0]), 'float32');
        })
}

export async function loadModel(path: string) {
    console.log('path', path)
    const model = await tf.loadLayersModel(path);
    return model;
}