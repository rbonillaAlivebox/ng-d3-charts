module.exports = function(config){
    config.set({
        basePath : './',
        exclude: [],
        files: [
            'app/vendor/angular/angular.js',
            'app/vendor/angular-mocks/angular-mocks.js',
            'app/vendor/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/vendor/angular-ui-router/release/angular-ui-router.js',
            'app/vendor/log4javascript/log4javascript.js',
            'app/vendor/d3/d3.js',
            'app/js/components/**/*.js',
            'app/js/view*/**/*.js'
        ],
        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['PhantomJS'],

        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    });
};
