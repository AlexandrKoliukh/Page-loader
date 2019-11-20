import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';
import nock from 'nock';
import httpAdapter from 'axios/lib/adapters/http';
import { getNameFromLink, deleteFolderRecursive } from '../src/utils';
import loadPage from '../src';
import parse from '../src/parser';

axios.defaults.adapter = httpAdapter;

const testLink = 'https://localhost/test';
const getFixturePath = (fileName) => path.join(__dirname, '..', '__fixtures__', fileName);

const resultFileName = getNameFromLink(testLink, 'html');

let resultDirPath;
let nockBody;

beforeEach(async () => {
  resultDirPath = await fs.mkdtemp(path.join(os.tmpdir(), '/'));
  nockBody = await fs.readFile(getFixturePath('test.html'), 'utf-8');
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

test('parse', async () => {
  const data1 = await fs.readFile(getFixturePath('ru-courses.html'), 'utf-8');
  const expectData1 = [ '/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js' ];
  const data2 = await fs.readFile(getFixturePath('google-com.html'), 'utf-8');
  const expectData2 = [
    '/logos/doodles/2019/zinaida-gippius-150th-birthday-6485130628562944.2-l.png',
    '/textinputassistant/tia.png',
  ];
  expect(parse(data1)).toEqual(expectData1);
  expect(parse(data2)).toEqual(expectData2);
});
