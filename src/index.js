import axios from 'axios';
import _path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import cheerio from 'cheerio';
import debug from 'debug';
import _ from 'lodash';
import _url from 'url';
import Listr from 'listr';
import httpAdapter from 'axios/lib/adapters/http';
import { getNameFromLink } from './utils';
import extractSourceLinks from './parser';

const log = debug('page-loader');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
axios.defaults.adapter = httpAdapter;

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
  const resultFilePath = _path.join(outputPath, getNameFromLink(link));
  return axios({
    method: 'get',
    url,
    responseType: 'stream',
  })
    .then(({ data }) => {
      log(`Fetch resource ${url} to ${resultFilePath}`);
      data.pipe(createWriteStream(resultFilePath));
      // return fs.writeFile(resultFilePath, data);
    })
    .catch((error) => {
      console.error(error.message);
      log(`Fetch resource ${url} failed ${error.message}`);
    });
};

export const loadResources = (url, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);

  const resultDirName = getNameFromLink(url, 'directory');
  const resultOutput = _path.join(outputPath, resultDirName);
  return fs.mkdir(resultOutput).then(() => {
    log(`Create folder ${resultOutput} for resources`);
    return relativeLinks.map((link) => {
      const { origin } = new URL(url);
      const sourceFileUrl = _path.join(origin, link);
      return {
        title: `Load ${link}`,
        task: () => loadResource(sourceFileUrl, link, resultOutput),
      };
    });
  }).then((tasks) => {
    const a = new Listr(tasks, { concurrent: true, exitOnError: false });
    a.run().catch(() => {});
  });
};

const loadPage = (url, outputPath) => {
  const sourceDir = getNameFromLink(url, 'directory');

  return axios.get(url)
    .then((res) => {
      log(`Load page ${url} to ${outputPath}`);
      const resultFilePath = _path.join(outputPath, getNameFromLink(url));
      const page = res.data;
      const newPage = changeLinksInPageToRelative(page, sourceDir);
      fs.writeFile(resultFilePath, newPage)
        .catch((error) => {
          console.error(error.message);
          log(`Writing to ${resultFilePath} error, ${error.message}`);
        });
      return res;
    })
    .then(({ data }) => loadResources(url, outputPath, data))
    .catch((error) => {
      console.error(error.message);
      log(`Failed to fetch ${url}`);
    });
};

export default loadPage;
