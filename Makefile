
all: js_libs js doc

js:
	make -C src

js_libs:
	make -C libs

doc:
	jsduck src --output docs --title '<a href="/">tupai.js</a>' --eg-iframe=tp-iframe.html
	cp -v releases/web/tupai-last.min.js docs/
	cp -v testData.json docs/

