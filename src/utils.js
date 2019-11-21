import url from 'url';
import _path from 'path';

const getKebabCasedUrl = (uri) => {
  const { host, path } = url.parse(uri);
  const name = `${host || ''}${path}`.replace(/[^a-z1-9]/g, '-');
  return name.split('-').filter(i => i).join('-');
};

export const getNameFromLink = (uri, type = 'file') => {
  const uriInKebabCase = getKebabCasedUrl(uri);

  switch (type) {
    case 'file': {
      const ext = _path.extname(uri) || '.html';
      return `${uriInKebabCase}${ext}`;
    }
    case 'directory': return `${uriInKebabCase}_files`;
    default: return 'none';
  }
};
