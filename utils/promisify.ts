import { readFile } from 'fs'

export function readFilePromisified(filename: string):Promise<string> {
    return new Promise((resolve, reject) => {
        readFile(filename, 'utf8', (err: any, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}