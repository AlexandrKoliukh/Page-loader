import { keys } from 'lodash';
import url from 'url';
import cheerio from 'cheerio';

const tagsMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const parse = (page) => {
  const links = [];
  const $ = cheerio.load(page);
  keys(tagsMapping).forEach((el) => {
    $(el).each((i, e) => {
      const a = $(e).attr(tagsMapping[el]);
      if (a) links.push(a);
    });
  });
  const relativeLinks = links.filter((i) => {
    const { host } = url.parse(i);
    return !host;
  });

  return relativeLinks;
};

export default parse;
