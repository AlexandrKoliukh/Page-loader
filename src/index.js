import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { getFileNameFromLink } from './utils';

export default (url, outputPath) => {
  return axios.get(url)
    .then((res) => {
      const resultFilePath = path.join(outputPath, getFileNameFromLink(url));
      fs.writeFile(resultFilePath, res.data)
        .catch((error) => {
          throw new Error(`Cant write file ${resultFilePath} ${error}`);
        });
    })
    .catch((error) => {
      throw new Error(`Cant fetch ${url} ${error}`);
    });
}
