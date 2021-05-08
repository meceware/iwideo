export default class HTML5VW {
  constructor( document, id, wrapper, options, events = {} ) {
    this.id = id;
    if ( ! this.isValid() ) {
      return;
    }

    const player = document.createElement( 'video' );
    if ( options.mute ) {
      player.muted = true;
    }
    player.loop = options.loop;
    player.setAttribute( 'playsinline', '' );
    player.setAttribute( 'webkit-playsinline', '' );

    Object.keys( id ).forEach( key => {
      const source = document.createElement( 'source' );
      source.src = id[ key ];
      source.type = `video/${ key }`;
      player.appendChild( source );
    } );

    this.player = player;

    wrapper.appendChild( player );

    if ( events.create ) {
      events.create( player );
    }

    player.addEventListener( 'play', e => {
      if ( events.play ) {
        events.play( e );
      }
    } );
    player.addEventListener( 'pause', e => {
      if ( events.pause ) {
        event.pause( e );
      }
    } );
    player.addEventListener( 'ended', e => {
      if ( events.end ) {
        events.end( e );
      }
    } );

    player.addEventListener( 'loadedmetadata', function() {
      if ( events.ready ) {
        events.ready();
      }

      // autoplay
      if ( options.autoplay ) {
        player.play();
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
      this.player.currentTime = start;
    }
    if ( this.player.paused ) {
      this.player.play();
    }
  }

  pause() {
    if ( ! this.player ) {
      return;
    }

    if ( ! this.player.paused ) {
      this.player.pause();
    }
  }
}
