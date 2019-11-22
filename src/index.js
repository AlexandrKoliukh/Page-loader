import axios from 'axios';
import _path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import { getNameFromLink } from './utils';
import extractSourceLinks from './parser';
import cheerio from 'cheerio';
import _ from 'lodash';
import _url from "url";

const tagsMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const changeLinksInPageToRelative = (page, dir) => {
  const $ = cheerio.load(page);
  _.keys(tagsMapping).forEach((tag) => {
    $(tag).each((index, element) => {
      const temp = $(element).attr(tagsMapping[tag]);
      if (!temp) return;
      const { host } = _url.parse(temp);
      if (host) return;
      if (temp) $(element).attr(tagsMapping[tag], _path.join(dir, getNameFromLink(temp)));
    });
  });
  return $.html();
};

const loadPage = (url, outputPath) => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  const sourceDir = getNameFromLink(url, 'directory');

  return axios.get(url)
    .then((res) => {
      const resultFilePath = _path.join(outputPath, getNameFromLink(url));
      const page = res.data;
      Promise.all(loadResources(url, outputPath, page));
      return fs.writeFile(resultFilePath, changeLinksInPageToRelative(page, sourceDir));
    });
};

const loadResource = (url, link, outputPath) => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  const resultFilePath = _path.join(outputPath, getNameFromLink(link));

  return axios.get(url, { responseType: 'arraybuffer' })
    .then(({ data }) => {
      // return data.pipe(createWriteStream(resultFilePath));
      return fs.writeFile(resultFilePath, data);
    });
};

export const loadResources = (url, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);
  console.log(relativeLinks);
  const resultDirName = getNameFromLink(url, 'directory');
  const resultOutput = _path.join(outputPath, resultDirName);
  fs.mkdir(resultOutput);
  return relativeLinks.map((link) => {
    const sourceFileUrl = _path.join(url, link);
    return loadResource(sourceFileUrl, link, resultOutput);
  });
};

export default loadPage;
