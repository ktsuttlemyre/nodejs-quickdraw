var fs = require('fs');
var ndjson = require('ndjson');
interface drawings {
  drawing: number[][][]
}

export function parseSimplifiedDrawings(fileName: string): Promise<drawings[]> {
  return new Promise((resolve, reject) => {
    var drawings: drawings[] = [];
    var fileStream = fs.createReadStream(fileName)
    fileStream
      .pipe(ndjson.parse())
      .on('data', function (obj: drawings) {
        drawings.push(obj)
      })
      .on("error", function (err: any) {
        reject(err)
      })
      .on("end", function () {
        resolve(drawings)
      });
  })
}
