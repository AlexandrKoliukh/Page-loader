import axios from 'axios';
import path from 'path';
import { promises as fs } from 'fs';
import { getNameFromLink } from './utils';
import parse from './parser';

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

export const loadResources = (url, page) => {
  const relativeLinks = parse(page);
  const absoluteLinks = relativeLinks.map(i => path.join(url, i));

  absoluteLinks.forEach((link) => {
    const type = path.extname(link).split('.')[1];
    const outputDirPath = getNameFromLink(url, 'directory');
    const outputFilePath = getNameFromLink(link, type);
    const outputPath = path.join(outputDirPath, outputFilePath);

    console.log(outputPath);
  });
};

export default loadPage;
