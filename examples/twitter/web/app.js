Package()
.use('tupai.Application')
.use('Config')
.run(function(cp) {

    var app = new cp.Application({
        window: {
            routes: cp.Config['routes']
        },
        cacheManager: cp.Config['cache_manager'],
        apiManagers: cp.Config['api_managers'],
        apiManager: cp.Config['api_manager']
    });

    app.show('/root/timeline');
});
