import { accessSync, mkdirSync, readdirSync } from 'fs';
import { DATASET_FOLDER_NAME, CATEGORIES_PATH } from "./constants";
import { readFilePromisified } from './promisify';

/**
 * 
 * @param index position of label
 * @param length size of array
 * @description creates an array with all values set to 0 
 * except the position of the label set to 1 
 */
export function createLabelArray(index: number, length: number) {
    return Array.from({ length }, (_, i) => i === index ? 1 : 0);
}

export function getClasses() {
    const path = `${__dirname}/../${DATASET_FOLDER_NAME}`;
    const files = readdirSync(path);
    return files.length;
}

/**
 * 
 * @param path directory to create
 * @description recursively checks for intermediate directory 
 * and creates it if missing
 */
export function createDirectory(path: string) {
    const rootFolder = __dirname.slice(0, __dirname.split('/').length - 1) // parent of the current folder
    const subFolder = path.replace(rootFolder, '');
    subFolder.split('/').forEach((_, i, a) => {
        const intermediatePath = a.slice(0, i + 1).join('/');
        try {
            accessSync(`${rootFolder}${intermediatePath}`);
        } catch (err) {
            mkdirSync(`${rootFolder}${intermediatePath}`);
        }
    })
}

export async function getCategories() {
    try {
       return (await readFilePromisified(CATEGORIES_PATH)).split("\n");
    } catch (err) {
        console.log(err)
    }
}


