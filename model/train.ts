import * as tf from '@tensorflow/tfjs-node'
import { dataGenerator, imageDataToTensor } from './dataset'
import { createModel, train, loadModel } from './model'
import { readFilePromisified } from '../utils/utils';

export async function training () {
  const trainingDataset = tf.data.generator(dataGenerator)
    .shuffle(20000)
    .batch(200);
  const it = await tf.data.generator(dataGenerator).iterator()
  let value = await it.next()
  console.log(value)
  value = await it.next()
  console.log(value)
  const model = createModel()

  train(model, trainingDataset, trainingDataset)
  // retrainModel('file:///home/ed/Documents/tfjs-tutorial/quickdraw/saveModelBest/epoch5/model.json', trainingDataset)

  // const model = await loadModel('file:///home/ed/Documents/tfjs-tutorial/quickdraw/saveModelBest/epochbest/model.json')
  const images: number[][] = JSON.parse(await readFilePromisified(`${__dirname}/../dataset/label4.json`));

  const feature = imageDataToTensor(images[200]).expandDims(0);
  (model.predict(feature) as tf.Tensor).topk(5).indices.print()
}