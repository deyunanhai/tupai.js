/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var fs = require('fs');
var path = require('path');
var tupai = require(__dirname);

function compileConfigSync(input, output, fullClassName, options) {

    var files = fs.readdirSync(input);
    if(!files) return;


    var paths = fullClassName.split('.');
    var outputFile = path.join(output, paths.join(path.sep)) + '.js';
    var packageName = paths.slice(0, paths.length-1).join('.');
    var className = paths[paths.length-1];

    console.log('    create ' + outputFile);

    var outputDir = path.join(output, paths.slice(0, paths.length-1).join(path.sep));
    if(!fs.existsSync(outputDir)) {
        require('mkdirp').sync(outputDir);
    }

    var configObject={};
    files.forEach(function(filename) {
        if(filename.match(/.*\.json$/)) {
            var name = filename.substring(0, filename.length-5);
            var s = fs.readFileSync(path.join(input, filename));
            configObject[name] = JSON.parse(s.toString());
        }
    });

    var tempStr =
'Package(\'%s\')\n\
.define(\'%s\', function(cp) {\n\
    return ';

    fs.writeFileSync(outputFile, require('util').format(tempStr, packageName, className));
    fs.appendFileSync(outputFile, JSON.stringify(configObject, null, 4));
    fs.appendFileSync(outputFile, ';});');
}

exports.compileConfigSync = function(input, output, fullClassName, options) {
    if(!fs.existsSync(input)) {
        console.error(input + ' is not exists.');
        process.exit(1);
    }
    require('mkdirp').sync(output);
    compileConfigSync.apply(undefined, arguments);
};

