import axios from 'axios';
import _path from 'path';
import { promises as fs } from 'fs';
import { getNameFromLink } from './utils';
import extractSourceLinks from './parser';
import url from "url";

const loadPage = (url, outputPath) => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

  return axios.get(url)
    .then((res) => {
      const resultFilePath = _path.join(outputPath, getNameFromLink(url));
      return fs.writeFile(resultFilePath, res.data);
    });
};

export const loadResources = (url, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);
  const outputDirPath = getNameFromLink(url, 'directory');

};

export default loadPage;
