module.exports = function ( grunt ) {

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    /**
     * This is the configuration object Grunt uses to give each plugin its instructions.
     */
    var taskConfig = {

        /**
         * LESS compilation and uglification automatically.
         * Only our `app.less` file is included in compilation; all other files
         * must be imported from this file.
         */
        less: {
            build: {
                src: [ 'app/less/app.less' ],
                dest: 'app/css/app.css',
                options: {
                    compile: true,
                    compress: false,
                    noUnderscores: false,
                    noIDs: false,
                    zeroUnits: false
                }
            }
        },

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `app/`.
         */
        jshint: {
            src: [
                'app/**/*.js',
                '!app/vendor/**/*.js'
            ],
            test: [
                'e2e-tests/**/*.js'
            ],
            options: {
                globalstrict: true,
                strict: false,
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {
                    'angular': false,
                    'jquery': false,
                    'jasmine': false,
                    'describe': false,
                    'it': false,
                    'beforeEach': false,
                    'afterEach': false,
                    'module': false,
                    'expect': false,
                    'inject': false,
                    'browser': false,
                    'element': false,
                    'by': false,
                    'console': false,
                    '_': false
                }
            }
        },

        concat: {
            utils: {
                src: ['app/typescript/components/utils/*.ts'],
                dest: 'app/typescript/components/utils.ts',
                options: {
                    banner: grunt.file.read('app/typescript/components/utils/utils.ts.prefix'),
                    footer: grunt.file.read('app/typescript/components/utils/utils.ts.suffix'),
                    separator: '\n\n',
                    process: function(src, filepath) {
                        return '// ' + filepath + '\n' + src + '\n// ----\n';
                    }
                }
            }
        },

        typescript: {
            base: {
                src: ['app/typescript/components/*.ts'],
                dest: 'app/js/',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'app/typescript/',
                    sourceMap: true,
                    declaration: true
                }
            },
            distdebug: {
                src: ['app/typescript/components/*.ts'],
                dest: 'dist/ng-d3-chart-debug.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'app/typescript/',
                    sourceMap: true,
                    declaration: true
                }
            },
            dist: {
                src: ['app/typescript/components/*.ts'],
                dest: 'dist/ng-d3-chart.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'app/typescript/',
                    sourceMap: true,
                    declaration: true,
                    removeComments: true
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    mangle: false,
                    sourceMap: true
                },
                files: {
                    'dist/ng-d3-chart.min.js': ['dist/ng-d3-chart.js']
                }
            }
        },

        /**
         * Connect is a http server provided by grunt.
         * server - http server started on watch
         * serverstandalone - http server stand-alone
         * testserver - http server used for e2e testing
         */
        connect: {
            options: {
                port: 8000,
                base: 'app'
            },
            server: {
                options: {
                    keepalive: false
                }
            },
            serverstandalone: {
                options: {
                    keepalive: true
                }
            },
            testserver: {
                options: {
                    port: 8100,
                    keepalive: false
                }
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                port: 9101,
                background: true
            },
            continuous: {
                configFile: 'karma.conf.js',
                singleRun: true
            },
            debug: {
                configFile: 'karma.conf.js',
                port: 9101,
                background: false,
                singleRun: false
            }
        },

        /**
         * Protractor configuration
         */
        protractor: {
            options: {
                configFile: "node_modules/grunt-protractor-runner/node_modules/protractor/referenceConf.js", // Default config file
                keepAlive: true, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {
                    // Arguments passed to the command
                }
            },
            e2e: {
                options: {
                    configFile: "e2e-tests/protractor.conf.js", // Target-specific config file
                    args: {
                        baseUrl: 'http://localhost:8100'
                    }
                }
            },
            e2edebug: {
                options: {
                    configFile: "e2e-tests/protractor.conf.js", // Target-specific config file
                    args: {
                        baseUrl: 'http://localhost:8100'
                    },
                    debug: true
                }
            }
        },

        /**
         * Watcher configuration: This task watches our file changes and trigger a task accordingly.
         * 'src': Lints changed files and re-executes unit testing.
         * 'less': Recompiles less sources.
         */
        watch: {
            options: {
                atBegin: true
            },
            src: {
                files: ['app/**/*.js', '!app/js/components/**/*.js'],
                tasks: []//'karma:continuous'
                //tasks: ['jshint', 'karma:continuous']
            },
            srcts: {
                files: 'app/typescript/**/*.ts',
                tasks: ['concat', 'typescript:base']//, 'karma:continuous'
            },
            less: {
                files: 'app/less/**/*.less',
                tasks: ['less']
            }
        }

    };

    grunt.initConfig( grunt.util._.extend( taskConfig ) );

    /**
     * The default task is to build and compile.
     */
    grunt.registerTask( 'default', [ 'build' ] );

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask( 'build', [
        'typescript', 'less', 'karma:continuous'
        //'typescript', 'jshint', 'less', 'karma:continuous'
    ]);

    grunt.registerTask( 'dev', [ 'connect:server', 'watch' ] );

    grunt.registerTask( 'test:unit', [
        'build'
    ]);

    grunt.registerTask( 'test:unitdebug', [
        'less', 'karma:debug'
        //'jshint', 'less', 'karma:debug'
    ]);

    grunt.registerTask( 'test:e2e', [
        'build', 'connect:testserver', 'protractor:e2e'
    ]);

    grunt.registerTask( 'test:e2edebug', [
        'build', 'connect:testserver', 'protractor:e2edebug'
    ]);

    grunt.registerTask( 'dist', [
        'typescript:distdebug', 'typescript:dist', 'uglify:dist'
    ]);
};