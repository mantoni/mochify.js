SHELL := /bin/bash

version = $(shell node -p "require('./package.json').version")

default:
	npm test

release: default
	git tag -a -m "Release ${version}" v${version}
	git push --follow-tags
	npm publish
