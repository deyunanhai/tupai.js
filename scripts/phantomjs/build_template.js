/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var page = require('webpage').create();
var system = require('system');
var fs = require('fs');

if (system.args.length < 4) {
    console.log('build_template url scriptBasePath classPath');
    end();
}

var url = system.args[1];
var scriptBasePath = system.args[2];
var classPath = system.args[3];
console.log('compile ' + url + ' save class ' + classPath + ' to ' + scriptBasePath);
if(!fs.exists(scriptBasePath) ) {
    console.log(scriptBasePath + ' is not exisits.');
    end();
}
if(!fs.isDirectory(scriptBasePath)) {
    console.log(scriptBasePath + ' is not a directory.');
    end();
}
//scriptBasePath = scriptBasePath.replace(/(^\s+)|((\/|\s)+$)/g, '') + '/';
//console.log(fs.workingDirectory);
scriptBasePath = scriptBasePath.replace(/\/$/,'');
var pathList = classPath.split('.');
var packagePath = '';
var packageName = '';
var className;
if(pathList.length > 1) {
    var packageList = pathList.splice(0, pathList.length-1);
    packagePath = packageList.join('/');
    packageName = packageList.join('.');
}
className = pathList[0];
var scriptFilePath = scriptBasePath + '/' + packagePath;
fs.makeTree(scriptFilePath);
scriptFilePath += '/' + className + '.js';

var templates = {};
page.onConsoleMessage = function(msg) {
    var data;
    try {
        data = JSON.parse(msg);
    } catch(e) { return; }

    if(!data.id || !data.html) {
        if(data.log) {
            console.log(data.log);
        }
        return;
    }
    console.log('    render template ' + data.id);
    templates[data.id] = data.html;
}

function writeToFile() {
    var stream = fs.open(scriptFilePath, 'w');

    //header
    stream.write('Package(\'' + packageName + '\')\n');
    stream.write('.define(\'' + className + '\', function(cp) {\n');

    stream.write('var _templates = ');
    stream.write(JSON.stringify(templates));
    stream.write(';\n');

    //footer
    stream.write('  return {\n');
    stream.write('    get : function (name) {\n');
    stream.write('      return _templates[name];\n');
    stream.write('    }');
    stream.write('  };');
    stream.write('});');
    stream.close();
}

page.onLoadFinished = function (status) {
    if (status !== 'success') {
        console.log('Unable to load the address!');
    } else {
        page.evaluate(function() {
            var removeSubTemplates = function(element) {
                var subElements = element.getElementsByTagName('*');
                var removeQueue = [];
                for(var i=0, n=subElements.length; i<n; i++) {
                    var subElement = subElements[i];
                    if(!subElement) continue;
                    var templateId = subElement.getAttribute('data-ch-template');
                    if(!templateId) {
                        continue;
                    }
                    removeQueue.push(subElement);
                }

                for(var i=0, n=removeQueue.length; i<n; i++) {
                    var elem = removeQueue[i];
                    //var templateId = elem.getAttribute('data-ch-template');
                    //console.log(JSON.stringify({log: 'remove ' + templateId}));
                    elem.parentNode.removeChild(elem);
                }
            };
            var elements = document.getElementsByTagName('*');
            for(var i=0,n=elements.length;i<n;i++) {
                var element = elements[i];
                var templateId = element.getAttribute('data-ch-template');
                if(!templateId) {
                    continue;
                }
                element.removeAttribute('data-ch-template');

                var excludeSubTemplates = true;
                var includeSubTemplatesAttr = element.getAttribute('data-ch-include-sub-templates');
                if(includeSubTemplatesAttr) {
                    element.removeAttribute('data-ch-include-sub-templates');
                    if(includeSubTemplatesAttr === 'true') {
                        excludeSubTemplates = false;
                    }
                }

                if(excludeSubTemplates) {
                    element = element.cloneNode(true);
                    removeSubTemplates(element);
                }

                var html = element.outerHTML;
                console.log(JSON.stringify({id: templateId, html: html}));
            }
        });
    }
    writeToFile();
    end();
};


function end() {
    phantom.exit();
}
page.open(url);
