install: install-deps

run:
	npx babel-node 'src/bin' 10

build:
	rm -rf dist
	npm run build

test:
	npm test

lint:
	npx eslint .

publish:
	npm publish --dry-run

.PHONY: test
