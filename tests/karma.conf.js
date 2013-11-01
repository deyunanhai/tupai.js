// Karma configuration
// Generated on Tue May 28 2013 15:03:04 GMT+0900 (JST)


// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
files = [
  QUNIT,
  QUNIT_ADAPTER,
  'libs/package.js',
  'src/tupai/util/HashUtil.js',
  'src/tupai/animation/Transition.js',
  'src/tupai/TransitManager.js',
  'src/tupai/PushStateTransitManager.js',
  'src/tupai/ui/ViewEvents.js',
  'src/tupai/util/CommonUtil.js',
  'src/tupai/events/Events.js',
  'src/tupai/net/HttpRequest.js',
  'src/tupai/util/HttpUtil.js',
  'src/tupai/util/MemCache.js',
  'src/tupai/model/DataSet.js',
  'src/tupai/model/caches/HashCacheDataSet.js',
  'src/tupai/model/caches/HashCache.js',
  'src/tupai/util/LinkedList.js',
  'src/tupai/util/UserAgent.js',
  'src/tupai/model/caches/QueueCacheDataSet.js',
  'src/tupai/model/caches/QueueCache.js',
  'src/tupai/net/HttpClient.js',
  'src/tupai/net/JsonPClient.js',
  'src/tupai/model/ApiManager.js',
  'src/tupai/model/CacheManager.js',
  'src/tupai/ui/TemplateEngine.js',
  'src/tupai/ui/View.js',
  'src/tupai/Window.js',
  'src/tupai/Application.js',
  'src/tupai/ViewController.js',
  'src/tupai/animation/TransitAnimation.js',
  'src/tupai/ui/Templates.js',
  'src/tupai/ui/TableView.js',
  'src/tupai/ui/TemplateView.js',
  {pattern: 'tests/src/**/*.js', included: true}
];


// list of files to exclude
exclude = [
  '**/Makefile'
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];

proxies =  {
    '/static': 'http://localhost:9877',
};


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
