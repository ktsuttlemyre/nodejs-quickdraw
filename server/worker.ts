import { LayersModel } from "@tensorflow/tfjs";
import * as tf from '@tensorflow/tfjs-node';
import { parentPort } from 'worker_threads';
import { imageDataToTensor } from "../model/dataset";
import { loadModel } from "../model/model";
import { getCategories, MODEL_PATH } from "../utils/utils";


let model: LayersModel;
let categories: string[];
(async () => {
    model = await loadModel(MODEL_PATH);
    categories = await getCategories();
})()

async function predictTop5(message: any) {
    const feature = imageDataToTensor(message).expandDims(0);

    const prediction = model.predict(feature) as tf.Tensor;
    const topk = prediction.topk(5);
    const topkIndices = await topk.indices.data();
    const labels = (Array.from(topkIndices)).map((p: number) => categories[p]);
    const topkValues = await topk.values.data()
    const data = Array.from(topkValues).map(p => p * 100);
    return { labels, data };
}

parentPort.on('message', async ({message,  id}) => {
    parentPort.postMessage({prediction: await predictTop5(message), id});
});
