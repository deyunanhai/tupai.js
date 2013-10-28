include ../common.mk
JS_NAME=tupai

JS_PRODUCTION=$(JS_PUB_DIR)/$(JS_NAME)-last.min.js
JS_ORIGIN=$(JS_PUB_DIR)/$(JS_NAME)-last.js

JS_ORIGIN_WITH_VERSION=$(JS_PUB_DIR)/$(JS_NAME)-$(JS_VERSION).js
JS_PRODUCTION_WITH_VERSION=$(JS_PUB_DIR)/$(JS_NAME)-$(JS_VERSION).min.js
WEB_JS_EXTRA_FILES= \
	../libs/package.js

all: clear $(JS_ORIGIN_WITH_VERSION) $(JS_PRODUCTION_WITH_VERSION)

force: clear all

$(JS_ORIGIN_WITH_VERSION): $(JS_ORIGIN)
	$(CP) $(JS_ORIGIN) $@

$(JS_PRODUCTION_WITH_VERSION): $(JS_PRODUCTION)
	$(CP) $(JS_PRODUCTION) $@

$(JS_PRODUCTION): $(JS_ORIGIN)
	$(CAT) $(JS_ORIGIN) | $(COMPRESSOR) > $@

$(JS_ORIGIN): check $(JS_PUB_DIR)
	$(CAT) $(WEB_JS_EXTRA_FILES) > $@
	$(MERGE) --classPath "." --output "$@" --append --noLog --isTupaiCore

check:
	$(CHECK) --classPath "." --isTupaiCore

$(JS_PUB_DIR):
	$(MKDIR) -p $(JS_PUB_DIR)

clear:
	$(RM) $(JS_ORIGIN)
	$(RM) $(JS_ORIGIN_WITH_VERSION)
	$(RM) $(JS_PRODUCTION)
	$(RM) $(JS_PRODUCTION_WITH_VERSION)
