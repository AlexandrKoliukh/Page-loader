import commander from 'commander';
import loadPage from './index';

export default () => {
  commander
    .version('0.0.1')
    .description('Load file')
    .arguments('<fileUrl>')
    .option('-o, --output [path]', 'Output file')
    .action((url, argv) => {
      const output = argv.output || process.cwd();
      loadPage(url, output).then(() => console.log(`File loaded to ${output}`));
    })
    .parse(process.argv);
};
