import url from 'url';
import fs from 'fs';
import Path from 'path';

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

  const a = typeMapping[type](normalizedName);
  return a;
};

export const deleteFolderRecursive = (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
