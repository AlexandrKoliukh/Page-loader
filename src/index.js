import axios from 'axios';
import _path from 'path';
import { promises as fs, createWriteStream } from 'fs';
import cheerio from 'cheerio';
import debug from 'debug';
import _ from 'lodash';
import _url from 'url';
import Listr from 'listr';
import httpAdapter from 'axios/lib/adapters/http';
import { getHtmlFileName, getNameFromLink } from './utils';
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
    })
    .catch((error) => {
      log(`Fetch resource ${url} failed ${error.message}`);
      throw error;
    });
};

export const loadResources = (url, outputPath, page) => {
  const relativeLinks = extractSourceLinks(page);

  const resultDirName = getNameFromLink(url, 'directory');
  const resultOutput = _path.join(outputPath, resultDirName);
  return fs.mkdir(resultOutput).then(() => {
    log(`Create folder ${resultOutput} for resources`);
    return relativeLinks.map((link) => {
      const { protocol } = new URL(url);
      const resourceUrl = `${protocol}${link}`;
      return {
        title: `Load ${link}`,
        task: () => loadResource(resourceUrl, link, resultOutput),
      };
    });
  })
    .then((tasks) => {
      const listr = new Listr(tasks, { concurrent: true, exitOnError: false });
      listr.run();
    })
    .catch((error) => {
      log(`Create folder ${resultOutput} failed ${error.message}`);
      throw error;
    });
};

const loadPage = (url, outputPath) => {
  const sourceDir = getNameFromLink(url, 'directory');

  return axios.get(url)
    .then((res) => {
      log(`Load page ${url} to ${outputPath}`);
      const resultFilePath = _path.join(outputPath, getHtmlFileName(url));
      const page = res.data;
      const newPage = changeLinksInPageToRelative(page, sourceDir);

      return { resultFilePath, newPage, res };
    })
    .then(({ resultFilePath, newPage, res }) => {
      fs.writeFile(resultFilePath, newPage)
        .catch((error) => {
          log(`Writing to ${resultFilePath} error, ${error.message}`);
        });
      return res;
    })
    .then(({ data }) => loadResources(url, outputPath, data));
};

export default loadPage;
