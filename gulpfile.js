const gulp = require( 'gulp' );
const del = require( 'del' );
const { rollup } = require( 'rollup' );
const { babel } = require( '@rollup/plugin-babel' );
const commonjs = require( '@rollup/plugin-commonjs' );
const { nodeResolve } = require( '@rollup/plugin-node-resolve' );
const eslint = require( '@rollup/plugin-eslint' );
const { terser } = require( 'rollup-plugin-terser' );
const pckg = require( './package.json' );
const gzipSize = require( 'gzip-size' );
const serve = require( 'rollup-plugin-serve' );

const dev = () => {
  const devBuild = () => {
    return rollup( {
      input: 'src/index.js',
      plugins: [
        eslint(),
        nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
        commonjs(),
        babel( {
          exclude: 'node_modules/**',
        } ),
        serve( {
          contentBase: [ 'docs', 'dist' ],
          host: 'localhost',
          port: 10001,
        } ),
      ],
    } ).then( function( bundle ) {
      return bundle.write( {
        name: 'iwideo',
        file: 'dist/iwideo.min.js',
        format: 'umd',
        moduleName: 'iwideo',
        sourcemap: true,
      } );
    } );
  };

  devBuild();

  gulp.watch( 'src/**/*.js', devBuild );
};

const build = () => {
  // Remove dist folder content
  del( [
    'dist/**/*',
  ] );

  const banner =
    '/* \n' +
    ' * iwideo v' + pckg.version + '\n' +
    ' * https://github.com/meceware/iwideo \n' +
    ' * \n' +
    ' * Made by Mehmet Celik (https://www.meceware.com/) \n' +
    ' */';

  return rollup( {
    input: 'src/index.js',
    plugins: [
      eslint(),
      nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
      commonjs(),
      babel( {
        exclude: 'node_modules/**',
      } ),
      terser( {
        output: {
          comments: function( node, comment ) {
            if ( 'comment2' === comment.type ) {
              return /Made by Mehmet Celik/.test( comment.value );
            }
          },
        },
      } ),
    ],
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'iwideo',
      file: 'dist/iwideo.min.js',
      format: 'umd',
      moduleName: 'iwideo',
      sourcemap: false,
      banner: banner,
    } );
  } ).then( function() {
    return rollup( {
      input: 'src/index.js',
      plugins: [
        eslint(),
        nodeResolve( { mainFields: [ 'jsnext:module', 'jsnext:main' ] } ),
        commonjs(),
        babel( {
          exclude: 'node_modules/**',
        } ),
      ],
    } );
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'iwideo',
      file: 'dist/iwideo.js',
      format: 'umd',
      moduleName: 'iwideo',
      sourcemap: false,
      banner: banner,
    } );
  } ).then( () => {
    console.log( 'gzipped file size: ' + ( Math.round( ( gzipSize.fileSync( 'dist/iwideo.min.js' ) / 1024 ) * 100 ) / 100 ) + 'KB' );
  } );
};

exports.dev = dev;
exports.build = build;
