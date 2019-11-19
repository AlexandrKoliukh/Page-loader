import commander from 'commander';

export default () => {
  commander
    .version('0.0.1')
    .description('Fetch file')
    .arguments('<fileUrl>')
    .option('-o, --output [path]', 'Output file')
    .action((url, argv) => {
      console.log(url);
      console.log(argv.output);
    })
    .parse(process.argv);
};
