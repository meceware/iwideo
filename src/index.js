import YouTubeVW from './providers/youtube';
import VimeoVW from './providers/vimeo';
import HTML5VW from './providers/html5';
import { throttle } from 'throttle-debounce';

export default ( ( global, document ) => {
  // If the global wrapper (window) is undefined, do nothing
  if ( 'undefined' === typeof global.document ) {
    return;
  }

  // Default options
  const defaults = {
    wrapperClass: 'iwideo-wrapper',
    overlayClass: 'iwideo-overlay',
    src: false,
    ratio: 1.7778, //16:9 ratio
    autoplay: true,
    extra: false,
    loop: true,
    mute: true,
    poster: '',
    posterStyle: { size: 'cover', position: 'center center', repeat: 'no-repeat', attachment: 'scroll' },
    zIndex: -1,
    autoResize: true,
    isMobile: () => {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || global.opera);
      return isMobile || ( global.innerWidth < 768 );
    },
  };

  const forEach = ( array, callback, scope ) => {
    for ( let i = 0; i < array.length; i++ ) {
      callback.call( scope, array[i] ); // passes back stuff we need
    }
  };

  class iwideo {
    constructor( element, options = {} ) {
      // Extend options
      Object.keys( defaults ).forEach( ( key ) => {
        if ( ! Object.prototype.hasOwnProperty.call( options, key) ) {
          options[ key ] = defaults[ key ];
        }
      });

      // Set the ratio
      if ( 'string' === typeof options.ratio ) {
        options.ratio = '4/3' === options.ratio ? 4/3 : 16/9;
      }

      // Set options
      this.options = options;
      // Get the container
      this.container = ( 'string' === typeof element ) ? document.querySelector( element ) : element;

      // Check if container exists
      if ( ! this.container ) {
        return new Error( `Could not find the container: ${element}` );
      }

      const parse = ( url ) => {
        const undef = { type: false, id: false };
        if ( !url ) {
          return undef;
        }

        // If the type of url is object, then it should be local. Remaining code accepts only string
        if ( typeof url === 'object' ) {
          if ( Object.prototype.hasOwnProperty.call( url, 'mp4' ) || Object.prototype.hasOwnProperty.call( url, 'ogv' ) || Object.prototype.hasOwnProperty.call( url, 'ogg' ) || Object.prototype.hasOwnProperty.call( url, 'webm' ) ) {
            return { type: 'html5', id: url };
          }

          return undef;
        }

        // parse youtube ID
        const idYoutube = ( ( url ) => {
          // eslint-disable-next-line no-useless-escape
          const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
          const match = url.match( regExp );
          return match && match[ 1 ].length === 11 ? match[ 1 ] : false;
        } )( url );

        // parse vimeo ID
        const idVimeo = ( ( url ) => {
          // eslint-disable-next-line no-useless-escape
          const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
          const match = url.match( regExp );
          return match && match[ 3 ] ? match[ 3 ] : false;
        } )( url );

        // parse local string
        const idLocal = ( ( url ) => {
          // eslint-disable-next-line no-useless-escape
          const videoFormats = url.split( /,(?=mp4\:|webm\:|ogv\:|ogg\:)/ );
          const result = {};
          let ready = 0;
          videoFormats.forEach( ( val ) => {
            // eslint-disable-next-line no-useless-escape
            const match = val.match( /^(mp4|webm|ogv|ogg)\:(.*)/ );
            if ( match && match[ 1 ] && match[ 2 ] ) {
              // eslint-disable-next-line prefer-destructuring
              result[ match[ 1 ] === 'ogv' ? 'ogg' : match[ 1 ] ] = match[ 2 ];
              ready = 1;
            }
          } );
          return ready ? result : false;
        } )( url );

        if ( idYoutube ) {
          return { type: 'youtube', id: idYoutube };
        }

        if ( idVimeo ) {
          return { type: 'vimeo', id: idVimeo };
        }

        if ( idLocal ) {
          return { type: 'html5', id: idLocal };
        }

        return undef;
      };

      // Parse the source and get video ID
      const parsed = parse( this.options.src );
      this.type = parsed.type;
      this.videoID = parsed.id;

      // Generates a wrapper that is used for holding the media
      const constructWrapper = ( self = this ) => {
        // Get computed style of the container
        const containerStyle = getComputedStyle( self.container, null );

        // For the absolute positioning inside works, the container should be relative
        if ( 'static' === containerStyle.getPropertyValue( 'position' ) ) {
          self.container.style.position = 'relative';
        }

        // Create the wrapper element
        const wrapper = document.createElement( 'div' );

        // If the container is body, set the position as fixed.
        wrapper.style.position = 'absolute';

        // Set wrapper class
        if ( self.options.wrapperClass ) {
          if ( 'function' === typeof self.options.wrapperClass ) {
            wrapper.classList.add( self.options.wrapperClass.call( self ) );
          } else {
            wrapper.classList.add( self.options.wrapperClass );
          }
        }

        // Set wrapper styles
        wrapper.style.left = 0;
        wrapper.style.top = 0;
        wrapper.style.height = '100%';
        wrapper.style.width = '100%';
        wrapper.style.overflow = 'hidden';
        wrapper.style.zIndex = parseInt( self.options.zIndex, 10 );

        if ( self.options.poster ) {
          wrapper.style.backgroundSize = self.options.posterStyle.size;
          wrapper.style.backgroundPosition = self.options.posterStyle.position;
          wrapper.style.backgroundRepeat = self.options.posterStyle.repeat;
          wrapper.style.backgroundAttachment = self.options.posterStyle.attachment;
          wrapper.style.backgroundImage = `url('${self.options.poster}')`;
        }

        self.wrapper = wrapper;
        self.container.insertBefore( wrapper, self.container.firstChild );
      };

      // Generates an overlay that is placed above the media to prevent interaction
      const constructOverlay = ( self = this ) => {
        const overlay = document.createElement( 'div' );
        overlay.style.position = 'absolute';
        if ( self.options.overlayClass ) {
          if ( 'function' === typeof self.options.overlayClass ) {
            overlay.classList.add( self.options.overlayClass.call( self ) );
          } else {
            overlay.classList.add( self.options.overlayClass );
          }
        }

        overlay.style.left = 0;
        overlay.style.top = 0;
        overlay.style.height = '100%';
        overlay.style.width = '100%';

        self.wrapper.appendChild( overlay );
      };

      const constructPlayer = ( self = this ) => {
        const events = {
          'ready': () => {
            self.fire( 'ready', self );
          },
          'play': ( e ) => {
            self.el.style.opacity = '1';
            self.fire( 'play', self, e );
          },
          'pause': ( e ) => {
            self.fire( 'pause', self, e );
          },
          'end': ( e ) => {
            if ( !self.options.loop ) {
              self.el.style.opacity = '0';
            }
            self.fire( 'end', self, e );
          },
          'create': ( video ) => {
            video.style.position = 'absolute';
            video.style.left = '50%';
            video.style.top = '50%';
            video.style.transform = 'translate(-50%, -50%)';
            video.style.webkitTransform = 'translate(-50%, -50%)';
            video.style.msTransform = 'translate(-50%, -50%)';
            video.style.oTransform = 'translate(-50%, -50%)';
            video.style.mozTransform = 'translate(-50%, -50%)';
            video.style.minWidth = '100%';
            video.style.minHeight = '100%';
            video.style.opacity = '0';

            self.options.extra && Object.keys( self.options.extra ).forEach( ( key ) => {
              video.setAttribute( key, self.options.extra[ key ] );
            });

            self.el = video;

            // Resize the frame
            self.resize();

            self.fire( 'create', self, video );
          },
        };

        if ( self.type === 'youtube' ) {
          self.worker = new YouTubeVW( global, document, self.videoID, self.wrapper, self.options, events );
        } else if ( self.type === 'html5' ) {
          self.worker = new HTML5VW( document, self.videoID, self.wrapper, self.options, events );
        } else if ( self.type === 'vimeo' ) {
          self.worker = new VimeoVW( document, self.videoID, self.wrapper, self.options, events );
        }
      };

      // Add the wrapper
      constructWrapper();
      // Initialize provider
      if ( this.type && ! ( this.options.isMobile && this.options.isMobile() ) ) {
        constructPlayer();
      }

      // Add the overlay
      constructOverlay();

      // Add resize event
      if ( this.options.autoResize ) {
        global.addEventListener(
          'resize',
          throttle( 200, this.resize ).bind( this ),
          false
        );
      }

      // Resize
      this.resize();

      // Store the instance in the container
      this.container.iwideo = this;
      this.container.setAttribute( 'data-iwideo-initialized', true );
    }

    // Destroys and unloads the player
    destroy() {
      // We wrap this next part in try...catch in case the element is already gone for some reason
      try {
        // Remove the node
        this.container.removeChild( this.wrapper );
        // Delete worker instance
        delete this.container.iwideo.worker;
        // Delete the instance
        delete this.container.iwideo;
      } catch ( e ) {
        // Nothing to do when error is invoked
      }
    }

    // Resizes the player to provide the best viewing experience
    resize() {
      // If there is no element, return
      if ( ! this.el ) {
        return;
      }

      const containerHeight = this.container.offsetHeight;
      const containerWidth = this.container.offsetWidth;

      const isPortrait = ( ( 1 < this.options.ratio && ( containerWidth / containerHeight ) < this.options.ratio ) ||
                          ( 1 > this.options.ratio && ( containerHeight / containerWidth ) < this.options.ratio ) );

      if ( isPortrait ) {
        this.el.style.maxHeight = '100%';
        this.el.style.maxWidth = 'none';

        this.el.style.height = '';
        this.el.style.width = ( this.el.offsetHeight * this.options.ratio ) + 200 + 'px';
      } else {
        this.el.style.maxHeight = 'none';
        this.el.style.maxWidth = '100%';

        this.el.style.height = this.el.offsetWidth / this.options.ratio + 'px';
        this.el.style.width = '';

        if ( this.el.offsetHeight < this.wrapper.offsetHeight + 140 ) {
          this.el.style.height = ( this.el.offsetWidth / this.options.ratio ) + 140 + 'px';
        }
      }
    }

    // Starts the video playback
    play() {
      this.worker && this.worker.play();
      return this;
    }

    // Pauses the video playback
    pause() {
      this.worker && this.worker.pause();
      return this;
    }

    // Hides the media and shows the poster behind it
    showPoster() {
      this.pause().el.style.opacity = '0';
    }

    // events
    on( name, callback ) {
      this.userEventsList = this.userEventsList || [];

      // add new callback in events list
      ( this.userEventsList[name] || ( this.userEventsList[name] = [] ) ).push( callback );
    }

    off( name, callback ) {
      if ( ! this.userEventsList || ! this.userEventsList[name] ) {
        return;
      }

      if ( ! callback ) {
        delete this.userEventsList[name];
      } else {
        this.userEventsList[name].forEach( (val, key) => {
          if (val === callback) {
            this.userEventsList[name][key] = false;
          }
        } );
      }
    }

    fire( name ) {
      const args = [].slice.call( arguments, 1 );
      if ( this.userEventsList && typeof this.userEventsList[name] !== 'undefined' ) {
        const self = this;
        self.userEventsList[name].forEach( function(val) {
          val && val.apply(self, args);
        } );
      }
    }
  }

  iwideo.destroy = () => {
    forEach( document.querySelectorAll( '[data-iwideo-initialized]' ), el => {
      el.iwideo.destroy();
    });
  };

  iwideo.resize = () => {
    forEach( document.querySelectorAll( '[data-iwideo-initialized]' ), el => {
      el.iwideo.resize();
    });
  };

  // Provide method for scanning the DOM and initializing iwideo from attribute
  iwideo.scan = () => {
    // API method for scanning the DOM and initializing vide instances from data-vide attribute
    // Scan the DOM for elements that have data-iwideo attribute and initialize new iwideo instance based on that attribute
    const scan = () => {
      forEach( document.querySelectorAll( '[data-iwideo]' ), el => {
        // Get the element
        // Check if the element is already instantiated
        if ( 'undefined' !== typeof el.iwideo ) {
          // this element already has an instance
          return;
        }

        try {
          new iwideo( el, JSON.parse( decodeURIComponent( el.getAttribute( 'data-iwideo' ) ) ) );
        } catch ( e ) {
          // Nothin to do when an error is invoked
        }
      } );
    };

    if ( document.readyState != 'loading' ) {
      scan();
    } else {
      document.addEventListener( 'DOMContentLoaded', scan );
    }
  };

  iwideo.scan();

  // Return iwideo
  return iwideo;
})( 'undefined' !== typeof window ? window : undefined, document );
