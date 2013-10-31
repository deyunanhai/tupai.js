module.exports = function(grunt) {
  //グラントタスクの設定
  grunt.initConfig({
    //sassの設定
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'dist/css/customize.css': 'scss/customize.scss'
        }
      }
    },
    concat: {
      dist: {
        src: ['dist/css/customize.css'],
        dest: 'dist/css/doc.css'
      }
    },
    //watchの設定
    watch: {
      dev: {
        files: ['scss/customize.scss'],
        tasks: ['sass', 'concat', 'cssmin']
      }
    },
    cssmin: {
      combine: {
        files: {
          'dist/css/doc.min.css': ['dist/css/doc.css']
        }
      }
    }
  });
  grunt.registerTask('default', ['sass', 'concat', 'cssmin']);

  //プラグインの読み込み
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
};
