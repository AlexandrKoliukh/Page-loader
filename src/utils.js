import _url from 'url';
import _path from 'path';

export const getKebabCasedUrl = (url) => {
  const { host, path } = _url.parse(url);
  const name = `${host || ''}${path}`.replace(/[^a-z1-9]/g, '-');
  return name.split('-').filter(i => i).join('-');
};

export const getNameFromLink = (url, type = 'file') => {
  const urlInKebabCase = getKebabCasedUrl(url);

  switch (type) {
    case 'file': {
      const ext = _path.extname(url) || '.html';
      return `${urlInKebabCase}${ext}`;
    }
    case 'directory': return `${urlInKebabCase}_files`;
    default: return 'none';
  }
};

export const getHtmlFileName = (url) => {
  const urlInKebabCase = getKebabCasedUrl(url);
  return `${urlInKebabCase}.html`;
};
