import axios from 'axios';
import _path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import cheerio from 'cheerio';
// import debug from 'debug';
import _ from 'lodash';
import _url from 'url';
import { getNameFromLink } from './utils';
import extractSourceLinks from './parser';

// const log = debug('page-loader');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

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


const loadResource = (url, link, outputPath) => {
  console.log(url);
  const resultFilePath = _path.join(outputPath, getNameFromLink(link));

  axios({
    method: 'get',
    url,
    responseType: 'stream',
  })
    .then(({ data }) => {
      data.pipe(createWriteStream(resultFilePath));
      // return fs.writeFile(resultFilePath, data);
    })
    .catch(error => console.error(error.message));
};

export const loadResources = (url, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);

  const resultDirName = getNameFromLink(url, 'directory');
  const resultOutput = _path.join(outputPath, resultDirName);
  fs.mkdir(resultOutput).then(() => {
    relativeLinks.forEach((link) => {
      const { origin } = new URL(url);
      const sourceFileUrl = _path.join(origin, link);
      loadResource(sourceFileUrl, link, resultOutput);
    });
  });
};

const loadPage = (url, outputPath) => {
  const sourceDir = getNameFromLink(url, 'directory');

  return axios({
    method: 'get',
    url,
  })
    .then((res) => {
      const resultFilePath = _path.join(outputPath, getNameFromLink(url));
      const page = res.data;
      loadResources(url, outputPath, page);
      return fs.writeFile(resultFilePath, changeLinksInPageToRelative(page, sourceDir));
    });
};

export default loadPage;
