import { getNameFromLink } from '../src/utils';

test('getNameFromLink', () => {
  const fileName1 = getNameFromLink('http://example.com/temp/rocks');
  expect(fileName1).toBe('example-com-temp-rocks.html');
  const fileName2 = getNameFromLink('https://ru.hexlet.io/courses', 'directory');
  expect(fileName2).toBe('ru-hexlet-io-courses_files');
  const fileName3 = getNameFromLink('/assets/application.js');
  expect(fileName3).toBe('assets-application-js.js');
  const fileName4 = getNameFromLink('/assets/application.css');
  expect(fileName4).toBe('assets-application-css.css');
  const fileName5 = getNameFromLink('images/img2.jpg');
  expect(fileName5).toBe('images-img2-jpg.jpg');
});
