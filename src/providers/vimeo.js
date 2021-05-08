import Deferred from '../deferred.js';

let VimeoAPIadded = 0;
let loadingVimeoPlayer = 0;
const loadingVimeoDefer = new Deferred();

export default class VimeoVW {
  constructor( document, id, wrapper, options, events = {} ) {
    this.id = id;
    if ( ! this.isValid() ) {
      return;
    }

    if ( ! VimeoAPIadded ) {
      VimeoAPIadded = 1;
      const tag = document.createElement( 'script' );
      tag.src = 'https://player.vimeo.com/api/player.js';
      document.querySelector( 'body' ).appendChild( tag );
    }

    const onReady = callback => {
      // Listen for global Vimeo player callback
      if ( typeof Vimeo === 'undefined' && ! loadingVimeoPlayer ) {
        // Prevents Ready event from being called twice
        loadingVimeoPlayer = true;

        // Creates deferred so, other players know when to wait.
        const vimeoInterval = setInterval( () => {
          if ( typeof Vimeo !== 'undefined' ) {
            clearInterval( vimeoInterval );
            loadingVimeoDefer.resolve( 'done' );
            callback();
          }
        }, 100 );
      } else if ( typeof Vimeo !== 'undefined' ) {
        callback();
      } else {
        loadingVimeoDefer.done( () => {
          callback();
        } );
      }
    };

    onReady( ( self = this ) => {
      const playerOptions = {
        autopause: 0,
        autoplay: options.autoplay ? 1 : 0,
        background: 1,
        byline: 0,
        controls: 0,
        loop: options.loop ? 1 : 0,
        muted: options.mute ? 1 : 0,
        portrait: 0,
        transparent: 1,
        title: 0,
        badge: 0,
      };

      let optionsStr = '';
      Object.keys( playerOptions ).forEach( key => {
        if ( optionsStr !== '' ) {
          optionsStr += '&';
        }
        optionsStr += `${ key } = ${ encodeURIComponent( playerOptions[ key ] ) }`;
      } );

      // Create the Vimeo iframe
      const iframe = document.createElement( 'iframe' );
      iframe.setAttribute( 'src', `https://player.vimeo.com/video/${ id }?${ optionsStr }` );
      iframe.setAttribute( 'frameborder', '0' );
      iframe.setAttribute( 'mozallowfullscreen', '' );
      iframe.setAttribute( 'webkitallowfullscreen', '' );
      iframe.setAttribute( 'allowfullscreen', '' );
      // Append the element to the wrapper
      wrapper.appendChild( iframe );

      if ( events.create ) {
        events.create( iframe );
      }

      self.player = new Vimeo.Player( iframe, playerOptions );
      self.player.on( 'play', e => {
        if ( events.play ) {
          events.play( e );
        }
      } );
      self.player.on( 'pause', e => {
        if ( events.pause ) {
          events.pause( e );
        }
      } );
      self.player.on( 'ended', e => {
        if ( events.end ) {
          events.end( e );
        }
      } );
      self.player.on( 'loaded', e => {
        if ( events.ready ) {
          events.ready( e );
        }
      } );
    } );
  }

  isValid() {
    return ! ! this.id;
  }

  play( start ) {
    const self = this;
    if ( ! self.player ) {
      return;
    }

    if ( typeof start !== 'undefined' ) {
      self.player.player.setCurrentTime( start || 0 );
    }

    self.player.getPaused().then( paused => {
      if ( paused ) {
        self.player.play();
      }
    } );
  }

  pause() {
    const self = this;
    if ( ! self.player ) {
      return;
    }

    self.player.getPaused().then( paused => {
      if ( ! paused ) {
        self.player.pause();
      }
    } );
  }
}
