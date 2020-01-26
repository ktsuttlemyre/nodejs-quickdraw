import { Worker } from 'worker_threads';
import WebSocket from 'ws';

const worker = new Worker('./worker.import.js', { resourceLimits: {} })

const wss = new WebSocket.Server({ port: 4000 });
let id = 0;
wss.on('connection', function connection(ws) {
    (ws as any).id = ++id; // unique id for each client
    worker.on('message', (response) => {
        if (response.id === (ws as any).id) {
            ws.send(JSON.stringify(response.prediction));
        }
    })
    ws.on('message', async function incoming(message: Uint8ClampedArray) {
        worker.postMessage({ message, id: (ws as any).id }, [message.buffer])
    });

});