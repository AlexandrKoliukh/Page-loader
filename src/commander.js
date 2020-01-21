import commander from 'commander';
import loadPage from './index';
import { version } from '../package.json';

export default () => {
  commander
    .version(version)
    .description('Load page')
    .arguments('<pageUrl>')
    .option('-o, --output [path]', 'Output folder', process.cwd())
    .action((url, argv) => {
      const { output } = argv;
      loadPage(url, output)
        .then(() => console.log(`Page loaded to ${output}`))
        .catch((error) => {
          console.error(error.message);
          process.exit(1);
        });
    })
    .parse(process.argv);
};
