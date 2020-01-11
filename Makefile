install: install-deps

run:
	npx babel-node 'src/bin/page-loader.js'

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm test -- --coverage

develop-test:
	DEBUG=page-loader npx jest --watch

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test
