const gulp = require( 'gulp' );
const del = require( 'del' );
const { rollup } = require( 'rollup' );
const { babel } = require( '@rollup/plugin-babel' );
const commonjs = require( '@rollup/plugin-commonjs' );
const { nodeResolve } = require( '@rollup/plugin-node-resolve' );
const eslint = require( '@rollup/plugin-eslint' );
const { terser } = require( 'rollup-plugin-terser' );
const pckg = require( './package.json' );
const serve = require( 'rollup-plugin-serve' );

const gzipSizeFromFileSync = async ( path ) => {
  const gzipSize = await import( 'gzip-size' );
  return gzipSize.gzipSizeFromFileSync( path );
};

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
          babelHelpers: 'bundled',
        } ),
        serve( {
          contentBase: [ 'docs', 'dist' ],
          host: '0.0.0.0',
          port: 3000,
        } ),
      ],
    } ).then( function( bundle ) {
      return bundle.write( {
        name: 'iwideo',
        file: 'dist/iwideo.min.js',
        format: 'umd',
        sourcemap: true,
      } );
    } );
  };

  devBuild();

  gulp.watch( 'src/**/*.js', {interval: 1000, usePolling: true}, devBuild );
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
        babelHelpers: 'bundled',
        presets: [
          [ '@babel/env',
            {
              targets: {
                browsers: [
                  '> 1%',
                  'last 2 Chrome major versions',
                  'last 2 Firefox major versions',
                  'last 2 Edge major versions',
                  'last 2 Safari major versions',
                  'last 3 Android major versions',
                  'last 3 ChromeAndroid major versions',
                  'last 2 iOS major versions',
                ],
              },
              useBuiltIns: 'usage',
              corejs: '3',
            },
          ],
        ],
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
          babelHelpers: 'bundled',
        } ),
      ],
    } );
  } ).then( function( bundle ) {
    return bundle.write( {
      name: 'iwideo',
      file: 'dist/iwideo.js',
      format: 'umd',
      sourcemap: false,
      banner: banner,
    } );
  } ).then( () => {
    return gzipSizeFromFileSync( 'dist/iwideo.min.js' );
  } ).then( ( val ) => {
    console.log( 'gzipped file size: ' + ( Math.round( ( val / 1024 ) * 100 ) / 100 ) + 'KB' );
  } );
};

exports.dev = dev;
exports.build = build;
