include ../common.mk

CP_FILES:=$(wildcard *.classpath)
JS_LIB_FILES=$(addprefix $(JS_PUB_DIR)/, $(CP_FILES:.classpath=-last.js))
JS_LIB_FILES_WITH_VERSION=$(addprefix $(JS_PUB_DIR)/, $(CP_FILES:.classpath=-$(JS_VERSION).js))

JS_LIB_PRODUCTION_FILES=$(addprefix $(JS_PUB_DIR)/, $(CP_FILES:.classpath=-last.min.js))
JS_LIB_PRODUCTION_FILES_WITH_VERSION=$(addprefix $(JS_PUB_DIR)/, $(CP_FILES:.classpath=-$(JS_VERSION).min.js))

all: clear $(JS_LIB_FILES) $(JS_LIB_PRODUCTION_FILES) $(JS_LIB_FILES_WITH_VERSION) $(JS_LIB_PRODUCTION_FILES_WITH_VERSION)

force: clear all

$(JS_PUB_DIR)/%-$(JS_VERSION).js: $(JS_PUB_DIR)/%-last.js
	$(CP) $(JS_PUB_DIR)/$*-last.js $@

$(JS_PUB_DIR)/%-$(JS_VERSION).min.js: $(JS_PUB_DIR)/%-last.min.js
	$(CP) $(JS_PUB_DIR)/$*-last.min.js $@

$(JS_PUB_DIR)/%-last.min.js: $(JS_PUB_DIR)/%-last.js
	$(CAT) $(JS_PUB_DIR)/$*-last.js | $(COMPRESSOR) > $@

$(JS_PUB_DIR)/%-last.js: %.classpath $(JS_PUB_DIR)
	$(CHECK) --targetClassesFile "$*.classpath" --classPath "." --isTupaiCore
	$(MERGE) --targetClassesFile "$*.classpath" --classPath "." --output "$@" --isTupaiCore --append --noLog --ignoreNotFound

$(JS_PUB_DIR):
	$(MKDIR) -p $(JS_PUB_DIR)

clear:
	$(RM) $(JS_LIB_FILES)
	$(RM) $(JS_LIB_FILES_WITH_VERSION)
	$(RM) $(JS_LIB_PRODUCTION_FILES)
	$(RM) $(JS_LIB_PRODUCTION_FILES_WITH_VERSION)
