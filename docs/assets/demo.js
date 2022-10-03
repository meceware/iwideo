( function() {

  'use strict';

  var htmlSource = 'mp4:https://github.com/mediaelement/mediaelement-files/blob/master/echo-hereweare.mp4?raw=true,webm:https://github.com/mediaelement/mediaelement-files/blob/master/echo-hereweare.webm?raw=true,ogv:https://github.com/mediaelement/mediaelement-files/blob/master/echo-hereweare.ogv?raw=true';

  var poster = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg';

  // The hero-banner background video at the top
  var js_cover = new iwideo( '.js-cover', {
    src: htmlSource,
    poster: poster,
    overlayClass: 'cover__overlay',
    isMobile: false,
  });

  // Simple self hosted background video
  /* var demo1 = new iwideo( '#demo-1', {
    src: htmlSource,
    poster: poster
  }); */

  // Youtube background video
  var demo2 = new iwideo( '#demo-2', {
    src: 'https://www.youtube.com/watch?v=uVW81kp2HSo',
    poster: 'https://i3.ytimg.com/vi/uVW81kp2HSo/hqdefault.jpg',
    extra: { 'data-keepplaying': true }
  });

  // Vimeo background video
  var demoVimeo = new iwideo( '#demo-vimeo', {
    src: 'https://vimeo.com/76979871',
    poster: 'https://i.vimeocdn.com/video/452001751_1280x720.jpg',
    extra: { 'data-keepplaying': true }
  });

  // non-full-width elements background video
  var demo3 = new iwideo( '#demo-3', {
    src: htmlSource,
    poster: poster
  });


  // Play link
  document.querySelector( '.js-play' )
    .addEventListener( 'click', function( e ) {
      e.preventDefault();
      demo3.play();

      // Or
      // document.querySelector( '#demo-3' ).iwideo.play();
    }, false );

  // Pause link
  document.querySelector( '.js-pause' )
    .addEventListener( 'click', function( e ) {
      e.preventDefault();
      demo3.pause();

      // Or
      // document.querySelector( '#demo-3' ).iwideo.pause();
    }, false );

  // Pause and show poster link
  document.querySelector( '.js-show-poster' )
    .addEventListener( 'click', function( e ) {
      e.preventDefault();
      demo3.showPoster();
    }, false );
})();
