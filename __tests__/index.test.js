import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';
import nock from 'nock';
import httpAdapter from 'axios/lib/adapters/http';
import { getFileNameFromLink, deleteFolderRecursive } from '../src/utils';
import loadPage from '../src';

axios.defaults.adapter = httpAdapter;

const testLink = 'https://localhost/test';
const fixturePath = path.join(__dirname, '..', '__fixtures__', 'test.html');

const resultFileName = getFileNameFromLink(testLink);

let resultDirPath;
let nockBody;

beforeEach(async () => {
  resultDirPath = await fs.mkdtemp(path.join(os.tmpdir(), '/'));
  nockBody = await fs.readFile(fixturePath, 'utf-8');
});

afterEach(async () => {
  deleteFolderRecursive(resultDirPath);
  // await fs.rmdir(resultDirPath, { recursive: true })
  // .catch(_.noop);
});

test('pageLoad safe data', async () => {
  const scope = nock('https://localhost')
    .get('/test')
    .reply(200, nockBody);

  await loadPage(testLink, resultDirPath).then(() => console.log('read'));
  const loadedData = await fs.readFile(
    path.join(resultDirPath, resultFileName),
    'utf-8',
  );

  await scope.done();
  expect(loadedData).toBe(nockBody);
});
