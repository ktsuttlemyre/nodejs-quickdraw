import WebSocket from 'ws';
import { loadModel } from '../model/model';
import { MODEL_PATH, getCategories } from '../utils/utils';
import { LayersModel, data } from '@tensorflow/tfjs-node';
import * as tf from '@tensorflow/tfjs-node';
import { imageDataToTensor } from '../model/dataset';

const wss = new WebSocket.Server({ port: 4000 });
let model: LayersModel;
let categories: string[];
(async () => {
    model = await loadModel(MODEL_PATH);
    categories = await getCategories();
})()

wss.on('connection', function connection(ws) {
    console.log('connected')
    ws.on('message', async function incoming(message: number[]) {
        /* console.log('len', message.length)
            const feature = tf.node.decodeImage(message, 1)
            console.log('len', message.length); */
        const feature = imageDataToTensor(message).expandDims(0);

        (model.predict(feature) as tf.Tensor).print();

        const prediction = model.predict(feature) as tf.Tensor;
        const topk = prediction.topk(5);
        const topkIndices = await topk.indices.data();
        const labels = (Array.from(topkIndices)).map((p: number) => categories[p]);
        const topkValues = await topk.values.data()
        const data = Array.from(topkValues).map(p => p * 100);
        console.log(labels);
        ws.send(JSON.stringify({ labels, data }));
    });


});