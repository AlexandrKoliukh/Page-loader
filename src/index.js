import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { getNameFromLink } from './utils';

const loadPage = (url, outputPath) => axios.get(url)
  .then((res) => {
    const resultFilePath = path.join(outputPath, getNameFromLink(url, 'html'));
    fs.writeFile(resultFilePath, res.data)
      .catch((error) => {
        throw new Error(`Cant write file ${resultFilePath} ${error}`);
      });
  })
  .catch((error) => {
    throw new Error(`Cant fetch ${url} ${error}`);
  });

export default loadPage;
