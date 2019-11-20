import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';
import nock from 'nock';
import { getFileNameFromLink, deleteFolderRecursive } from '../src/utils';
import loadPage from '../src';
import httpAdapter from 'axios/lib/adapters/http';

axios.defaults.adapter = httpAdapter;

const testLink = 'https://localhost/test';
const fixturePath = path.join(__dirname, '..', '__fixtures__', 'test.html');

const resultFileName = getFileNameFromLink(testLink);

let resultDirPath;
let nockBody;

beforeAll(async () => {
  resultDirPath = await fs.mkdtemp(path.join(os.tmpdir(), '/'));
  nockBody = await fs.readFile(fixturePath, 'utf-8');
  // await fs.rmdir(resultDirPath, { recursive: true }).catch(_.noop);
});

afterAll(() => {
  deleteFolderRecursive(resultDirPath);
});


test('pageLoad safe data', async () => {
  const scope = await nock('https://localhost')
    .get('/test')
    .reply(200, () => nockBody);

  let loadedData;

  loadPage(testLink, resultDirPath).then(async () => {
    loadedData = await fs.readFile(
      path.join(resultDirPath, resultFileName),
      'utf-8',
    );
    await scope.done();
    expect(loadedData).toBe(nockBody);
  });

});
