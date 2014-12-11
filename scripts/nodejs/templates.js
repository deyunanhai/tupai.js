/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var fs = require('fs');
var path = require('path');
var tupai = require(__dirname);
var temp = require('temp');

function compileTemplate(url, output, packageName, options) {

    var data = fs.readFileSync(url);
    console.log('      ' + url);

    var needMinify = true;
    if(options && options.minify === false) {
        needMinify = false;
    }

    function compile(url, end) {
        var pargs = [
            path.join(tupai.baseDir, 'scripts', 'phantomjs', 'build_template.js'),
            url,
            output,
            packageName
        ];
        tupai.execute(tupai.getBinPath('phantomjs'), pargs, {
            onStdoutData: options.onStdoutData,
            onStderrData: options.onStderrData,
            end: function(code) {
                end && end(code, url);
            }
        });
    }

    if(needMinify) {
        var html = require('html-minifier').minify(data.toString(), {
            removeComments: true,
            collapseWhitespace: true,
            useShortDoctype: true
        });

        temp.open({suffix: '.html'}, function(err, info) {
            if(err) {
                console.log('an error occured:', err);
                return;
            }
            fs.writeSync(info.fd, html);
            fs.close(info.fd, function(err) {
                if(err) {
                    console.log('an error occured:', err);
                    return;
                }
                var tempUrl = info.path;
                compile(tempUrl, function(code) {
                    fs.unlink(tempUrl);
                    options && options.end && options.end(code, url);
                });
            });
        });

    } else {
        compile(url, (options && options.end));
    }

}

function compileTemplates(input, output, packageName, options) {

    var files = fs.readdirSync(input);
    if(!files) return;

    options = options || {};

    var processFile = function() {
        var file = files.shift();
        //console.log('process ' + file);
        if(!file) {
            options.end && options.end(0);
            return;
        }
        if(file.match(/^[a-zA-Z].*$/)) {
            var p = path.join(input, file);
            var stat = fs.statSync(p);

            //console.log(file);
            var op = {
                minify: options.minify,
                onStdoutData: options.onStdoutData,
                onStderrData: options.onStderrData,
                end: function(code, url) {
                    if(code != 0) {
                        options.end && options.end(0);
                        return;
                    }
                    processFile();
                }
            };
            if(stat.isDirectory()) {
                var newPackageName = (packageName?(packageName+'.'+file):file);
                compileTemplates(p, output, newPackageName, op);
            } else if(stat.isFile() && file.match(/\.html$/)) {
                var name = file.replace(/\.html$/, '');
                var newPackageName = (packageName?(packageName+'.'+name):name);
                compileTemplate(p, output, newPackageName, op);
            } else {
                processFile();
            }
        } else {
            processFile();
        }
    };

    processFile();
}

exports.compileTemplate = function(input, output, packageName, options) {
    require('mkdirp').sync(output);
    compileTemplate.apply(undefined, arguments);
};
exports.compileTemplates = function(input, output, packageName, options) {
    if(!fs.existsSync(input)) {
        console.error(input + ' is not exists.');
        process.exit(1);
    }
    require('mkdirp').sync(output);
    compileTemplates.apply(undefined, arguments);
};

