import { getFileNameFromLink } from '../src/utils';

test('getFileNameFromLink', () => {
  const fileName = getFileNameFromLink('http://example.com/temp/rocks');
  expect(fileName).toBe('example-temp-rocks.html');
});
