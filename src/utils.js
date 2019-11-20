import url from 'url';
import fs from 'fs';
import Path from 'path';

export const getFileNameFromLink = (link) => {
  const { host: hostWitchDomainSpace, path } = url.parse(link);
  const host = hostWitchDomainSpace.split('.')[0];
  const fileName = `${host}${path}`.replace(/[^a-zA-Z1-9]/g, '-');
  const normalizedFileName = fileName.split('-').filter(i => i).join('-');

  return `${normalizedFileName}.html`;
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
