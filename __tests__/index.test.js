import { promises as fs } from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';
import nock from 'nock';
import rimraf from 'rimraf';
import httpAdapter from 'axios/lib/adapters/http';
import { getNameFromLink } from '../src/utils';
import loadPage, { loadResources } from '../src';
import parse from '../src/parser';
import { noop } from 'lodash';

nock.disableNetConnect();
axios.defaults.adapter = httpAdapter;

const getFixturePath = fileName => path.join(__dirname, '..', '__fixtures__', fileName);


describe('Async', () => {
  const hostname = 'hexlet';
  const pathname = '/courses';
  const testLink = `https://${path.join(hostname, pathname)}`;
  const resultFileName = getNameFromLink(testLink);
  const hostRegExp = new RegExp(hostname);

  let resultDirPath;
  let nockBody;

  beforeEach(async () => {
    resultDirPath = await fs.mkdtemp(path.join(os.tmpdir(), '/'));
    nockBody = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  });
  afterEach(async () => {
    await rimraf(resultDirPath, noop);
  });

  test('pageLoad safe data', async () => {
    const scope = nock(hostRegExp).get(pathname).reply(200, nockBody);
    const completedPath = path.join(resultDirPath, resultFileName);
    await loadPage(testLink, resultDirPath);
    const loadedData = await fs.readFile(completedPath, 'utf-8');
    scope.done();
    expect(loadedData).toBe(nockBody);
  });

  // test('res', async () => {
  //   const scope = nock(/.*/)
  //     .get(/.*/)
  //     .reply(200, nockBody);
  //
  //
  // });
});

describe('Sync', () => {
  test('parse', async () => {
    const data1 = await fs.readFile(getFixturePath('test.html'), 'utf-8');
    const expectData1 = [
      'images/img1.jpg',
      'images/img2.jpg',
      './assets/application.js'
    ];
    expect(parse(data1)).toEqual(expectData1);
  });
});
