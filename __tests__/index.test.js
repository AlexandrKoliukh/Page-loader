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
  const hostRegExp = new RegExp(hostname);

  let pathToTempDir;

  beforeAll(async () => {
    pathToTempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'));
  });
  afterAll(async () => {
    await rimraf(pathToTempDir, noop);
  });

  // test('pageLoad safe html', async () => {
  //   const nockBody = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  //   const expectData = await fs.readFile(getFixturePath('testWithChangedLinks.html'), 'utf-8');
  //
  //   const resultFileName = getNameFromLink(testLink);
  //   const scope = nock(hostRegExp).get(pathname).reply(200, nockBody);
  //   const completedPath = path.join(pathToTempDir, resultFileName);
  //   await loadPage(testLink, pathToTempDir);
  //   const loadedData = await fs.readFile(completedPath, 'utf-8');
  //   scope.done();
  //   expect(loadedData + '\n').toBe(expectData);
  // });

  test('res', async () => {
    const page = await fs.readFile(getFixturePath('test.html'), 'utf-8');
    const applicationJsData = await fs.readFile(getFixturePath('assets/application.js'), 'utf-8');
    const indexCssData = await fs.readFile(getFixturePath('css/index.css'), 'utf-8');
    const imgData = await fs.readFile(getFixturePath('images/img.png'), 'utf-8');

    const scope = nock(/localhost/)
      .get(/application.js/).reply(200, applicationJsData)
      .get(/index.css/).reply(200, indexCssData)
      .get(/img.png/).reply(200, imgData);

    const resultDirName = getNameFromLink(testLink, 'directory');
    await Promise.all(loadResources(testLink, pathToTempDir, page));

    const completedPathToJs = path.join(pathToTempDir, resultDirName, getNameFromLink('assets/application.js'));
    const completedPathToCss = path.join(pathToTempDir, resultDirName, getNameFromLink('css/index.css'));
    const completedPathToImg = path.join(pathToTempDir, resultDirName, getNameFromLink('images/img.png'));
    const loadedDataJs = await fs.readFile(completedPathToJs, 'utf-8');
    const loadedDataCss = await fs.readFile(completedPathToCss, 'utf-8');
    const loadedDataImg = await fs.readFile(completedPathToImg, 'utf-8');

    scope.done();
    expect(loadedDataJs).toBe(applicationJsData);
    expect(loadedDataCss).toBe(indexCssData);
    expect(loadedDataImg).toBe(imgData);
  });
});

describe('Sync', () => {
  test('parse', async () => {
    const data1 = await fs.readFile(getFixturePath('test.html'), 'utf-8');
    const expectData1 = [
      'css/index.css',
      'images/img.png',
      'assets/application.js',
    ];
    expect(parse(data1)).toEqual(expectData1);
  });
});
