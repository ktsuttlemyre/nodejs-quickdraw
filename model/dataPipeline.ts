import { readdirSync, readFileSync } from 'fs'
import * as utils from '../utils/utils'
import * as tf from '@tensorflow/tfjs-node'
import { TensorContainerObject } from '@tensorflow/tfjs-node';
import { IMAGE_H, IMAGE_W } from '../utils/utils';

export interface data extends TensorContainerObject {
  xs: tf.Tensor;
  ys: tf.Tensor;
}


export function* dataGenerator() {
  const path = `${__dirname}/../${utils.DATASET_FOLDER_NAME}`;
  const files = readdirSync(path);
  const numberOfLabels = files.length;
  const offset = 127;

  for (const file of files) {
    const labelIndex = Number(file.match(/label(\d+)/)[1]);
    const labelArray = utils.createLabelArray(labelIndex, numberOfLabels)
    const features: number[][] = JSON.parse(readFileSync(`${path}/${file}`).toString());

    for (const feature of features) {

      const image = tf.tensor(feature).reshape([IMAGE_H, IMAGE_W, -1]);
      const imageSliced = image.slice([0], [-1, -1, 3]) // without alpha channel
      const grayscale = imageSliced.mean(2);
      const xs = grayscale.expandDims(-1).sub(offset).div(offset);

      yield {
        xs,
        ys: tf.tensor(labelArray)
      }
    }
  }
}

export function imageDataToTensor(imageData: number[]) {
  return tf.tidy(() => {
    const offset = 127;
    const image = tf.tensor(imageData).reshape([IMAGE_H, IMAGE_W, -1]);
    const imageSliced = image.slice([0], [-1, -1, 3]) // without alpha channel
    const grayscale = imageSliced.mean(2);
    const tensor = grayscale.expandDims(-1).sub(offset).div(offset);
    return tensor
  })
}

