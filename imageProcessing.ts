import { accessSync, constants, createWriteStream, mkdirSync, readdirSync, readFile, writeFile } from 'fs';
import { get } from 'https';
import { parseSimplifiedDrawings } from "./simplified-parser";
import { vectorToRaster } from "./strokeToPicture";
import request from 'request';
import { createDirectory, TESTING_SET, VALIDATION_SET, dataset } from './utils/utils';
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('quickdraw_dataset');
const DATASET_FOLDER = `${__dirname}/dataset`

export async function strokesToPicture() {
  // const NS_PER_SEC = 1e9;
  // const time = process.hrtime();
  let files: string[];
  try {
    accessSync(DATASET_FOLDER, constants.R_OK | constants.W_OK);
  } catch (err) {
    mkdirSync(DATASET_FOLDER);
  }

  /* try {
    files = await getDrawingsFiles(10);
  } catch(err) {
    console.log(err)
  } */

  files = readdirSync('tmp')

  const dataset = await Promise.all(files.slice(15, 20).map(f =>
    parseSimplifiedDrawings(`tmp/${f}`)
  ));
  dataset.map((drawings, i) => {
    console.log(`file ${i}`)
    const strokes = drawings
      .map(d => d.drawing)
    return vectorToRaster({ vectorImages: strokes.slice(0, 1000) })
  }).forEach((images, i) => {
    writeFile(`dataset4/label${i + 15}.json`, JSON.stringify(images), 'utf8', err => {
      if (err) {
        console.error(err)
      }
    });
  })

  /* parseSimplifiedDrawings("data/eiffel.ndjson", function (err, drawings) {
    if (err) return console.error(err);
    const strokes: [] = drawings.map(d => d.drawing)

    vectorToRaster({ vectorImages: strokes.slice(0, 1), prefix: 'resize', saveImage: true });
    const diff = process.hrtime(time);
    console.log("# of drawings:", drawings.length);
    console.log(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
    console.log(`Benchmark took ${diff[0]} seconds`);

    const time2 = process.hrtime();
    vectorToRasterScaling({ vectorImages: strokes.slice(0, 1), prefix: 'scale', saveImage: true })
    const diff2 = process.hrtime(time);
    console.log("# of drawings:", drawings.length);
    console.log(`Benchmark took ${diff2[0] * NS_PER_SEC + diff2[1]} nanoseconds`);
    console.log(`Benchmark took ${diff2[0]} seconds`);

  }) */

}

export function getListCategories(): Promise<string[]> {
  const filename = 'categories.txt';
  const file = createWriteStream('categories.txt');
  return new Promise((resolve, reject) => {
    get("https://raw.githubusercontent.com/googlecreativelab/quickdraw-dataset/master/categories.txt", function (response) {
      response.pipe(file);
      readFile(filename, function (err, text) {
        if (err) {
          reject(err)
        }
        const textByLine = text.toString().split("\n")
        resolve(textByLine)
      });

    });
  })
}

export function downloadFile(url: string, destinationFolder = 'tmp'): Promise<string> {
  const baseUrl = 'https://storage.googleapis.com/quickdraw_dataset/full/raw'
  console.log('url', url)
  const filename = url.substring(url.lastIndexOf('/') + 1)
  const file = createWriteStream(`${destinationFolder}/${decodeURI(filename)}`);
  return new Promise((resolve, reject) => {
    request
      .get(`${baseUrl}/${url}`, function () {
        file.on('finish', () => {
          console.log('finish')
          resolve(filename)
        })
      })
      .on('error', function (err) {
        reject(err)
      })
      .pipe(file)
  })
}


/* export function downloadFile(url: string): Promise<string> {
  console.log('url', url)
  const filename = url.substring(url.lastIndexOf('/') + 1)
  const file = createWriteStream(`tmp/${decodeURI(filename)}`);
  return new Promise((resolve, reject) => {
    get(url, function (response) {
      response.pipe(file);
      file.on('data', data => {
        console.log('data', data)
      })
      file.on('finish', () => {
        console.log('finish')
        resolve(filename)
      })
    }).on('error', err => {
      reject(err)
    })
  })
} */

/**
 * get the list of all categories of the quickdraw dataset
 */
export async function getCategoriesFile() {
  const categories = await getListCategories();
  const baseUrl = 'https://storage.cloud.google.com/quickdraw_dataset/full/simplified';
  return await Promise.all(categories.slice(0, 2).map(categorie =>
    downloadFile(encodeURI(`${baseUrl}/${categorie}.ndjson`))
  ))
}

/**
 * @param n number of files to download
 * @description download the first n drawing files from the quickdraw dataset
 */
export async function getDrawingsFiles(n: number, destinationFolder = 'tmp') {
  const categories = await getListCategories()
  await Promise.all(categories.slice(0, n).map(category =>
    downloadFile(`${category}.ndjson`, destinationFolder)
  ))
}

/**
 * 
 * @param filename file to download
 * @returns a promise that resolve to the name of the file downloaded
 */
function downloadGoogleStorageFile(filename: string, destinationFolder: string): Promise<string> {
  const baseUrl = 'full/simplified';
  const file = bucket.file(`${baseUrl}/${filename}`);
  return new Promise((resolve, reject) => {
    file.download({
      destination: `${destinationFolder}/${filename}`
    }, function (err: any) {
      if (err) {
        reject(err);
      } else {
        resolve(filename);
      }
    });
  })
}

function* parsingGenerator(files: string[]) {
  for (const f of files) {
    yield parseSimplifiedDrawings(f)
  }
}

/**
 * 
 * @param d type of dataset to create
 * @param numberOfLabels number of files to create, one for each label
 */
export async function createDataset(d: dataset, numberOfLabels = 20) {
  let begin = 0;
  let end = 1000;
  const files = readdirSync('tmp').map(f => `tmp/${f}`)
  if (d === VALIDATION_SET) {
    begin = 1000;
    end = 1100;
  }
  if (d === TESTING_SET) {
    begin = 1100;
    end = 1300
  }
  try {
    accessSync(d)
  } catch (err) {
    console.log(err)
    mkdirSync(d)
  }

  for await (let drawings of parsingGenerator(files.slice(0, numberOfLabels))) {
    const strokes = drawings.map(d => d.drawing);
    const pictures = vectorToRaster({ vectorImages: strokes.slice(begin, end) });
    createPicturesFile(pictures, d);
  }
}

export function createPicturesFile(imageArray: number[][], path: string) {
  const directory = path.substring(0, path.lastIndexOf('/'));
  try {
    accessSync(directory)
  } catch (err) {
    console.log(err);
    createDirectory(directory)
  }

  imageArray.forEach((images, i) => {
    writeFile(`${path}/label${i}.json`, JSON.stringify(images), 'utf8', err => {
      if (err) {
        console.error(err)
      }
    });
  })
}
