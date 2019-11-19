install: install-deps

run:
	npx babel-node 'src/bin/page-loader.js'

build:
	rm -rf dist
	npm run build

test:
	npm test

develop-test:
	npx jest --watch

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test
