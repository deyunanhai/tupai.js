/**
 * @author <a href='bocelli.hu@gmail.com'>bocelli.hu</a>
 * @since tupai.js 0.1
 */
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var mkdirp = require('mkdirp').sync;
var tupai = require(__dirname);

var templatesDir = path.join(__dirname, '..', '..', 'templates');

var parseOptions = function(type, name, options) {
    if(!tupai.isTupaiProjectDir()) {
        console.error('current dir is not a tupai project dir.');
        return undefined;
    }

    var ret = {};

    var tupaiConfig = tupai.getConfig();
    var packagePrefix = tupaiConfig.package ? tupaiConfig.package+'.' : '';
    var suffix = '';
    switch(type) {
        case 'controller':
            suffix = 'ViewController';
            ret.ext = '.js';
            break;
        case 'view':
            suffix = '';
            ret.ext = '.js';
            break;
        case 'template':
            suffix = '';
            ret.ext = '.html';
            break;
        default:
            throw new Error('unknow type ' + type);
    }

    var className;
    if(name.indexOf('.') > 0) {
        ret.fullClassName = name;
        ret.className = ret.fullClassName.split('.').pop();
    } else {
        ret.className = name;
        ret.className = ret.className[0].toUpperCase() + ret.className.substring(1) + suffix;
        ret.fullClassName = packagePrefix + ret.className;
    }

    var srcName = options.templateType || 'default';
    ret.templateFile = path.join(templatesDir, type, srcName + ret.ext);
    if(!fs.existsSync(ret.templateFile)) {
        console.log('unknow type(' + type + ') or template('+ options.templateType + ')');
        return undefined;
    }

    var htmlTemplate = ret.htmlTemplate = {};
    htmlTemplate.fullClassName = options.templateClass || (packagePrefix + 'Templates');

    var classTokens = htmlTemplate.fullClassName.split('.');
    htmlTemplate.tarFile = path.join(tupaiConfig.templates, classTokens.join(path.sep)+'.html');
    htmlTemplate.className = classTokens.pop();

    //console.log(ret);
    return ret;
}

var generateController = function(name, options) {
    options = options || {};
    var config = parseOptions('controller', name, options);
    if(!config) return;
    var templateName = config.fullClassName + '.content';
    createCode(config.fullClassName, config.templateFile, {
        templateFullClassName: config.htmlTemplate.fullClassName,
        templateClassName: config.htmlTemplate.className,
        templateName: templateName
    });
    // create html template with same template name
    var templateSrcName = options.templateType || 'default';
    var templateSrcFile = path.join(templatesDir, 'template', templateSrcName+'.html');
    createHtmlTemplate(config.htmlTemplate.tarFile, templateSrcFile, templateName);

    // add routes
    addRoutes(config.fullClassName, name, options.title);
};

var addCache = function(name) {
    var cacheManagerFile = path.join(tupai.getConfig().configs, 'cache_manager.json');
    console.log('    modify ' + cacheManagerFile + ' add ' + name);
    var cacheManager;
    if(fs.existsSync(cacheManagerFile)) {
        var jsonStr = fs.readFileSync(cacheManagerFile);
        cacheManager = JSON.parse(jsonStr);
    } else {
        cacheManager = {};
    }
    cacheManager[name] = {
        config: {
            memCache: {},
            localStorage: false
        }
    };
    fs.writeFileSync(cacheManagerFile, JSON.stringify(cacheManager, null, 4));
};

var addApi = function(name) {
    var apiManagerFile = path.join(tupai.getConfig().configs, 'api_manager.json');
    console.log('    modify ' + apiManagerFile + ' add ' + name);
    var apiManager;
    if(fs.existsSync(apiManagerFile)) {
        var jsonStr = fs.readFileSync(apiManagerFile);
        apiManager = JSON.parse(jsonStr);
    } else {
        apiManager = {};
    }
    var apiParameterMap = apiManager['apiParameterMap'];
    if(!apiParameterMap) {
        apiParameterMap = apiManager['apiParameterMap'] = {};
    }
    apiParameterMap[name] = {
        fetch: {
            method: 'GET',
            url: '/' + name + '/fetch'
        }
    };
    fs.writeFileSync(apiManagerFile, JSON.stringify(apiManager, null, 4));
};

var generateEndpoint = function(name, options) {
    addCache(name);
    addApi(name);
};

var generateView = function(name, options) {
    options = options || {};
    var config = parseOptions('view', name, options);
    if(!config) return;
    createCode(config.fullClassName, config.templateFile);
};

var generateTemplate = function(name, options) {
    options = options || {};
    var config = parseOptions('template', name, options);
    if(!config) return;
    createHtmlTemplate(config.htmlTemplate.tarFile, config.templateFile, name);
};

exports.generators = {
    controller: generateController,
    view: generateView,
    endpoint: generateEndpoint,
    template: generateTemplate
};

var createCode = function(fullClassName, templateFile, parameter) {
    var paths = fullClassName.split('.');
    parameter = parameter || {};
    parameter.className = paths[paths.length-1];
    parameter.packageName = paths.slice(0, paths.length-1).join('.');

    var file = path.join(tupai.getConfig().sources, paths.join(path.sep)) + '.js';
    copyTemplateFile(templateFile, file, parameter);
};

var createHtmlTemplate = function(targetFile, templateFile, name) {

    var inputFile;
    if(!fs.existsSync(targetFile)) {
        console.log('    create ' + targetFile + ' add template ' + name);
        var dir = path.normalize(path.join(targetFile, '..'));
        mkdirp(dir);
        inputFile = path.join(templatesDir, 'HtmlTemplate.html');
    } else {
        //if(fs.existsSync())
       console.log('    modify ' + targetFile + ' add template ' + name);
       inputFile = targetFile;
    }
    var content = fs.readFileSync(inputFile).toString();
    var templateContent = fs.readFileSync(templateFile).toString();
    templateContent = ejs.render(templateContent, {
        templateName: name
    });
    templateContent += '\n<!-- __templates_body__ -->';
    content = content.replace(/<!--\s*__templates_body__\s*-->/, templateContent);

    fs.writeFileSync(targetFile, content);
}

var addRoutes = function(fullClassName, name, title) {
    var routesFile = path.join(tupai.getConfig().configs, 'routes.json');
    console.log('    modify ' + routesFile + ' add ' + fullClassName);
    var routes;
    if(fs.existsSync(routesFile)) {
        var jsonStr = fs.readFileSync(routesFile);
        routes = JSON.parse(jsonStr);
    } else {
        routes = {};
    }
    if(title) {
        routes['/' + name] = {
            title: title,
            classzz: fullClassName
        };
    } else {
        routes['/' + name] = fullClassName;
    }
    fs.writeFileSync(routesFile, JSON.stringify(routes, null, 4));
}

var copyTemplateFile = function(input, output, parameter) {

    //console.log('copy template file: ' + input + " to " + output);
    console.log('    create ' + output);
    var fileContent = fs.readFileSync(input);
    var ret = ejs.render(fileContent.toString(), parameter);

    // make sure parent floder is created
    var paths = output.split(path.sep);
    var outputDir = paths.slice(0, paths.length-1).join(path.sep);
    if(!fs.existsSync(outputDir)) {
        mkdirp(outputDir);
    }

    if(fs.existsSync(output)) {
        throw new Error(output + ' is already exists.');
    }
    fs.writeFileSync(output, ret);
}

var copyTemplateDir = function(input, output, parameter) {

    //console.log('copy template dir: ' + input + " to " + output);
    console.log('    create ' + output);
    var files = fs.readdirSync(input);
    files.forEach(function(filename) {
        if(filename.match(/^\./) && filename !== '.gitignore') return;

        var p = path.join(input, filename);
        var outputP = path.join(output, filename);
        var stat = fs.statSync(p);
        if(stat.isDirectory()) {
            if(!fs.existsSync(outputP)) {
                fs.mkdirSync(outputP);
            }
            copyTemplateDir(p, outputP, parameter);
        } else if(stat.isFile()) {
            copyTemplateFile(p, outputP, parameter);
        }
    });
}

/*
<%=project.name%>
<%=project.package%>  demo
<%=project.version%>
<%=project.description%>
<%=project.author%>
<%=server.port%>
<%=tupai.name%>
<%=tupai.version%>
*/
exports.createProject = function(projectName, options) {
    var template = options.template || 'default';
    var templateDir = path.join(templatesDir, 'project', template);
    if(!fs.existsSync(templateDir)) {
        console.log('unknow template('+ template + ')');
        return false;
    }
    if(fs.existsSync(projectName)) {
        console.error(projectName + ' is already exists.');
        return false;
    }
    fs.mkdirSync(projectName);

    var parameter = {
        project: {
            name: projectName,
            package: options.package || projectName,
            version: '0.0.1',
            description: '',
            author: ''
        },
        server: {
            port: 9800
        },
        tupai: {
            name: 'tupai',
            version: 'last'
        }
    };
    copyTemplateDir(templateDir, projectName, parameter);

    // copy tupai js to web/js
    var libsDir = path.join(projectName, 'web', 'js');
    var libFileName = parameter.tupai.name + '-' +
        parameter.tupai.version + '.min.js';
    var libFile = path.join(
        tupai.baseDir,
        'releases',
        'web',
        libFileName
    );

    var inStream = fs.createReadStream(libFile);
    var outStream = fs.createWriteStream(path.join(libsDir, 'tupai.min.js'));
    inStream.pipe(outStream);
    /*
    inStream.on('close', function() {
    });
    */

    // generate RootViewController
    process.chdir(projectName);
    // reset the config obejct
    tupai.resetConfig();
    generateController('root');

    // generate ResponseDelegate
    var packageName = tupai.getConfig().package;
    createCode(
        packageName+'.ResponseDelegate',
        path.join(templatesDir, 'delegate', 'ResponseDelegate.js')
    );

    console.log('\nyou can start a server by follow command: ');
    console.log('cd ' + projectName + '; tupaijs server');
    console.log('\n enjoy!');
};
