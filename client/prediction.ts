import { fromEvent, Observable } from "rxjs";
import { concatMap, debounceTime, tap, filter } from "rxjs/operators";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Drawing } from "./drawing";

export interface Data { }

export class Prediction {
    ws: WebSocketSubject<any>;
    imageData$: Observable<Data>;
    constructor(public drawing: Drawing, public url: string) {
        this.init();
    }

    init() {
        console.log('init')
        this.ws = webSocket({
            url: this.url, serializer: data => data,
            deserializer: e => JSON.parse(e.data)
        })
        // this.ws.subscribe();
        this.setListener();
        // this.setListener()
    }
    private setListener() {
        this.imageData$ = fromEvent(this.drawing.canvas, 'mousemove')
            .pipe(
               filter((e: MouseEvent) => e.buttons === 1),
                debounceTime(20),
                tap((e: MouseEvent) => {
                    this.predict(this.drawing.getImgData().data.buffer);
                }),
                concatMap(_ => this.ws)
            )
    }

    /**
     * 
     * @param data : buffer of a typed array
     * it avoids to have a copy of the typedarray
     */
    private predict(data: ArrayBuffer) {
        this.ws.next(data)
    }

    getdataObservable() {
        return this.imageData$;
    }
}