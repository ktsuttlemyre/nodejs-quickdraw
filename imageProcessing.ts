import { parseSimplifiedDrawings } from "./simplified-parser";
import { vectorToRaster, vectorToRasterScaling } from "./strokeToPicture";
import { createWriteStream, readFile, writeFile, accessSync, constants, mkdirSync , readdirSync} from 'fs'
import { get } from 'https'
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
    return vectorToRaster({ vectorImages: strokes.slice(0, 1000)})
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

export function downloadFile(url: string): Promise<string> {
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
}

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
  return Promise.all(categories.slice(0, n).map(category =>
    downloadGoogleStorageFile(`${category}.ndjson`, destinationFolder)
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

(async () => {
  const time = process.hrtime();
  await strokesToPicture()
  const diff = process.hrtime(time);

  console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
  console.log(`Benchmark took ${diff[0]} seconds`);
})()