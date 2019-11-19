import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import nock from 'nock';

import { getFileNameFromLink, deleteFolderRecursive } from '../src/utils';
import pageLoad from '../src';

const testLink = 'https://hexlet.io/courses';
const fileName = 'hexlet-io-courses.html';
const fixturePath = `${__dirname}/__fixtures__/${fileName}`;

const resultFileName = getFileNameFromLink(testLink);

let resultDirPath;
let nockBody;

beforeEach(async () => {
  resultDirPath = await fs.mkdtemp(`${__dirname}/`);
  nockBody = await fs.readFile(fixturePath, 'utf-8');
});

afterEach(async () => {
  // await fs.rmdir(resultDirPath, { recursive: true });
  deleteFolderRecursive(resultDirPath);
});

axios.defaults.adapter = require('axios/lib/adapters/http');

test('pageload save data', async () => {
  const scope = nock('https://hexlet.io')
    .get('/courses')
    .reply(200, () => nockBody);

  await pageLoad(testLink, resultDirPath);

  const loadedData = await fs.readFile(
    path.join(resultDirPath, resultFileName),
    'utf-8',
  );

  await axios.get('https://hexlet.io/courses');
  scope.done();
  expect(loadedData).toBe(nockBody);
});

