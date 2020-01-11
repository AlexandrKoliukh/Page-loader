import commander from 'commander';
import loadPage from './index';
import { version } from '../package.json';

export default () => {
  commander
    .version(version)
    .description('Load page')
    .arguments('<pageUrl>')
    .option('-o, --output [path]', 'Output folder')
    .action((url, argv) => {
      const outputPath = argv.output || process.cwd();
      loadPage(url, outputPath)
        .then(() => console.log(`File loaded to ${outputPath}`))
        .catch((error) => {
          console.error(error.message);
          process.exit(1);
        });
    })
    .parse(process.argv);
};
