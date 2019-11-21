import url from 'url';

const typeMapping = {
  directory: name => `${name}_files`,
  html: name => `${name}.html`,
  css: name => `${name}.css`,
  js: name => `${name}.js`,
};

export const getNameFromLink = (link, type) => {
  const { host, path } = url.parse(link);
  const name = `${host}${path}`.replace(/[^a-zA-Z1-9]/g, '-');
  const normalizedName = name.split('-').filter(i => i).join('-');

  return typeMapping[type](normalizedName);
};
