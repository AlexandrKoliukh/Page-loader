import { getNameFromLink } from '../src/utils';

test('getNameFromLink', () => {
  const fileName1 = getNameFromLink('http://example.com/temp/rocks', 'html');
  expect(fileName1).toBe('example-com-temp-rocks.html');
  const fileName2 = getNameFromLink('https://ru.hexlet.io/courses', 'directory');
  expect(fileName2).toBe('ru-hexlet-io-courses_files');
  const fileName3 = getNameFromLink('https://localhost', 'css');
  expect(fileName3).toBe('localhost.css');
});
