import Deferred from '../deferred.js';

let YoutubeAPIadded = false;
let loadingYoutubePlayer = false;
const loadingYoutubeDefer = new Deferred();

export default class YouTubeVW {
  constructor( global, document, id, wrapper, options, events = {} ) {
    this.id = id;
    if ( ! this.isValid() ) {
      return;
    }

    if ( ! YoutubeAPIadded ) {
      YoutubeAPIadded = 1;
      const tag = document.createElement( 'script' );
      tag.src = 'https://www.youtube.com/iframe_api';
      document.querySelector( 'body' ).appendChild( tag );
    }

    const onReady = callback => {
      // Listen for global YT player callback
      if ( ( typeof YT === 'undefined' || YT.loaded === 0 ) && ! loadingYoutubePlayer ) {
        // Prevents Ready event from being called twice
        loadingYoutubePlayer = true;

        // Creates deferred so, other players know when to wait.
        global.onYouTubeIframeAPIReady = function() {
          global.onYouTubeIframeAPIReady = null;
          loadingYoutubeDefer.resolve( 'done' );
          callback();
        };
      } else if ( typeof YT === 'object' && YT.loaded === 1 ) {
        callback();
      } else {
        loadingYoutubeDefer.done( () => {
          callback();
        } );
      }
    };

    onReady( ( self = this ) => {
      const playerOptions = {
        videoId: id,
        playerVars: {
          autoplay: options.autoplay ? 1 : 0,
          cc_load_policy: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: options.loop ? 1 : 0,
          playlist: id,
          modestbranding: 1,
          origin: typeof global.location.origin !== 'undefined' ? global.location.origin : `${ global.location.protocol }//${ global.location.hostname }${ ( global.location.port ? ':' + global.location.port : '' ) }`,
          playsinline: 1,
          rel: 0,
          start: 0,
          allowfullscreen: false,
          widgetid: 1,
        },
        events: {
          onReady: e => {
            if ( options.mute ) {
              self.player.mute();
            }

            if ( events[ 'ready' ] ) {
              events[ 'ready' ]( e );
            }
          },
          onStateChange: e => {
            switch ( e.data ) {
              case ( YT.PlayerState.ENDED ) :
                if ( events[ 'end' ] ) {
                  events[ 'end' ]( e );
                }
                break;

              case ( YT.PlayerState.PLAYING ) :
                if ( events[ 'play' ] ) {
                  events[ 'play' ]( e );
                }
                break;

              case ( YT.PlayerState.PAUSED ) :
                if ( events[ 'pause' ] ) {
                  events[ 'pause' ]( e );
                }
                break;
            }
          },
        },
      };

      // Create a temporary dom element that will be replaced by the YouTube iframe
      const toBeReplaced = document.createElement( 'div' );
      // Append the element to the wrapper
      wrapper.appendChild( toBeReplaced );
      self.player = new YT.Player( toBeReplaced, playerOptions );
      if ( events[ 'create' ] ) {
        events[ 'create' ]( self.player.getIframe() );
      }
    } );
  }

  isValid() {
    return ! ! this.id;
  }

  play( start ) {
    if ( ! this.player ) {
      return;
    }

    if ( typeof start !== 'undefined' ) {
      this.player.seekTo( start || 0 );
    }
    if ( YT.PlayerState.PLAYING !== this.player.getPlayerState() ) {
      this.player.playVideo();
    }
  }

  pause() {
    if ( ! this.player ) {
      return;
    }

    if ( YT.PlayerState.PLAYING === this.player.getPlayerState() ) {
      this.player.pauseVideo();
    }
  }
}
