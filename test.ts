import { accessSync, mkdirSync, readdirSync, writeFile } from 'fs';

import { parseSimplifiedDrawings } from "./simplified-parser";
import { vectorToRaster } from "./strokeToPicture";
import { dataset, VALIDATION_SET, TESTING_SET, createDirectory } from './utils/utils';

/* import { vectorToRaster } from "./strokeToPicture";
import { getDrawingsFiles } from "./imageProcessing"; */

/* getDrawingsFiles()
.then(d => console.log(d))
.catch(err => console.log(err)) */
/* const time = process.hrtime()
vectorToRaster({prefix: '',
  vectorImages: [[[[0,15,61,99,137,143,204,199],[230,195,112,50,0,33,222,221]],[[16,19,46,56,64,66,59,86,90,176,178,173,173,201,197,197],[226,224,226,213,208,218,250,255,212,216,217,225,253,253,238,215]],[[106,106,109],[49,136,198]],[[156,158,148,153],[13,36,110,222]],[[35,57,192],[117,123,130]],[[34,105,197],[149,152,165]],[[32,125,219],[170,179,179]]]]})
  const diff = process.hrtime(time);
  console.log(diff[0] * 1e9  + diff[1], 's'); */
/* (async() => {
  await getDrawingsFiles(1, 'tmp2')
})

try {
  accessSync(DATASET_FILE, constants.R_OK | constants.W_OK);
  console.log('can read/write');
} catch (err) {
  closeSync(openSync(DATASET_FILE, 'w'));
}
*/
/* forEach((images, i) => {
  readFile('dataset.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      const content = JSON.parse(data); //now it an object
      content.push({ [i]: images }); //add some data
      const json = JSON.stringify(content); //convert it back to json
      writeFile('dataset.json', json, 'utf8', err => {
        if(err) {
          console.log(err)
        }
      }); // write it back 
    }
  });
}) */

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
async function createDataset(d: dataset, numberOfLabels = 20) {
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

(async () => {
  /* const files = readdirSync('/tmp')
  for await (let drawings of parsingGenerator(files)) {
    const strokes = drawings.map(d => d.drawing)
    vectorToRaster({ vectorImages: strokes.slice(0, 1000) })
  } */
  createDataset("training");
})()