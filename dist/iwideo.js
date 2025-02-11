/* 
 * iwideo v1.1.19
 * https://github.com/meceware/iwideo 
 * 
 * Made by Mehmet Celik (https://www.meceware.com/) 
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.iwideo = factory());
})(this, (function () { 'use strict';

  // Deferred
  // thanks http://stackoverflow.com/questions/18096715/implement-deferred-object-without-using-jquery
  function Deferred() {
    this._done = [];
    this._fail = [];
  }
  Deferred.prototype = {
    execute(list, args) {
      let i = list.length;
      args = Array.prototype.slice.call(args);
      while (i--) {
        list[i].apply(null, args);
      }
    },
    resolve() {
      this.execute(this._done, arguments);
    },
    reject() {
      this.execute(this._fail, arguments);
    },
    done(callback) {
      this._done.push(callback);
    },
    fail(callback) {
      this._fail.push(callback);
    }
  };

  let YoutubeAPIadded = false;
  let loadingYoutubePlayer = false;
  const loadingYoutubeDefer = new Deferred();
  class YouTubeVW {
    constructor(global, document, id, wrapper, options, events = {}) {
      this.id = id;
      if (!this.isValid()) {
        return;
      }
      if (!YoutubeAPIadded) {
        YoutubeAPIadded = 1;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.querySelector('body').appendChild(tag);
      }
      const onReady = callback => {
        // Listen for global YT player callback
        if ((typeof YT === 'undefined' || YT.loaded === 0) && !loadingYoutubePlayer) {
          // Prevents Ready event from being called twice
          loadingYoutubePlayer = true;

          // Creates deferred so, other players know when to wait.
          global.onYouTubeIframeAPIReady = function () {
            global.onYouTubeIframeAPIReady = null;
            loadingYoutubeDefer.resolve('done');
            callback();
          };
        } else if (typeof YT === 'object' && YT.loaded === 1) {
          callback();
        } else {
          loadingYoutubeDefer.done(() => {
            callback();
          });
        }
      };
      onReady((self = this) => {
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
            origin: typeof global.location.origin !== 'undefined' ? global.location.origin : `${global.location.protocol}//${global.location.hostname}${global.location.port ? ':' + global.location.port : ''}`,
            playsinline: 1,
            rel: 0,
            start: 0,
            allowfullscreen: false,
            widgetid: 1
          },
          events: {
            onReady: e => {
              if (options.mute) {
                self.player.mute();
              }
              if (events.ready) {
                events.ready(e);
              }
            },
            onStateChange: e => {
              switch (e.data) {
                case YT.PlayerState.ENDED:
                  if (events.end) {
                    events.end(e);
                  }
                  break;
                case YT.PlayerState.PLAYING:
                  if (events.play) {
                    events.play(e);
                  }
                  break;
                case YT.PlayerState.PAUSED:
                  if (events.pause) {
                    events.pause(e);
                  }
                  break;
              }
            }
          }
        };

        // Create a temporary dom element that will be replaced by the YouTube iframe
        const toBeReplaced = document.createElement('div');
        // Append the element to the wrapper
        wrapper.appendChild(toBeReplaced);
        self.player = new YT.Player(toBeReplaced, playerOptions);
        if (events.create) {
          events.create(self.player.getIframe());
        }
      });
    }
    isValid() {
      return !!this.id;
    }
    play(start) {
      if (!this.player) {
        return;
      }
      if (typeof start !== 'undefined') {
        this.player.seekTo(start || 0);
      }
      if (YT.PlayerState.PLAYING !== this.player.getPlayerState()) {
        this.player.playVideo();
      }
    }
    pause() {
      if (!this.player) {
        return;
      }
      if (YT.PlayerState.PLAYING === this.player.getPlayerState()) {
        this.player.pauseVideo();
      }
    }
  }

  let VimeoAPIadded = 0;
  let loadingVimeoPlayer = 0;
  const loadingVimeoDefer = new Deferred();
  class VimeoVW {
    constructor(document, id, wrapper, options, events = {}) {
      this.id = id;
      if (!this.isValid()) {
        return;
      }
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
        badge: 0
      };
      let optionsStr = '';
      Object.keys(playerOptions).forEach(key => {
        if (optionsStr !== '') {
          optionsStr += '&';
        }
        optionsStr += `${key}=${encodeURIComponent(playerOptions[key])}`;
      });

      // Create the Vimeo iframe
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', `https://player.vimeo.com/video/${id}?${optionsStr}`);
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('mozallowfullscreen', '');
      iframe.setAttribute('webkitallowfullscreen', '');
      iframe.setAttribute('allowfullscreen', '');
      // Append the element to the wrapper
      wrapper.appendChild(iframe);
      if (!VimeoAPIadded) {
        VimeoAPIadded = 1;
        const tag = document.createElement('script');
        tag.src = 'https://player.vimeo.com/api/player.js';
        document.querySelector('body').appendChild(tag);
      }
      const onReady = callback => {
        // Listen for global Vimeo player callback
        if (typeof Vimeo === 'undefined' && !loadingVimeoPlayer) {
          // Prevents Ready event from being called twice
          loadingVimeoPlayer = true;

          // Creates deferred so, other players know when to wait.
          const vimeoInterval = setInterval(() => {
            if (typeof Vimeo !== 'undefined') {
              clearInterval(vimeoInterval);
              loadingVimeoDefer.resolve('done');
              callback();
            }
          }, 100);
        } else if (typeof Vimeo !== 'undefined') {
          callback();
        } else {
          loadingVimeoDefer.done(() => {
            callback();
          });
        }
      };
      onReady((self = this) => {
        self.player = new Vimeo.Player(iframe, playerOptions);
        self.player.on('play', e => {
          if (events.play) {
            events.play(e);
          }
        });
        self.player.on('pause', e => {
          if (events.pause) {
            events.pause(e);
          }
        });
        self.player.on('ended', e => {
          if (events.end) {
            events.end(e);
          }
        });
        self.player.on('loaded', e => {
          if (events.ready) {
            events.ready(e);
          }
        });
        if (events.create) {
          events.create(iframe);
        }
      });
    }
    isValid() {
      return !!this.id;
    }
    play(start) {
      const self = this;
      if (!self.player) {
        return;
      }
      if (typeof start !== 'undefined') {
        self.player.player.setCurrentTime(start || 0);
      }
      self.player.getPaused().then(paused => {
        if (paused) {
          self.player.play();
        }
      });
    }
    pause() {
      const self = this;
      if (!self.player) {
        return;
      }
      self.player.getPaused().then(paused => {
        if (!paused) {
          self.player.pause();
        }
      });
    }
  }

  class HTML5VW {
    constructor(document, id, wrapper, options, events = {}) {
      this.id = id;
      if (!this.isValid()) {
        return;
      }
      const player = document.createElement('video');
      if (options.mute) {
        player.muted = true;
      }
      player.loop = options.loop;
      player.setAttribute('playsinline', '');
      player.setAttribute('webkit-playsinline', '');
      Object.keys(id).forEach(key => {
        const source = document.createElement('source');
        source.src = id[key];
        source.type = `video/${key}`;
        player.appendChild(source);
      });
      this.player = player;
      wrapper.appendChild(player);
      if (events.create) {
        events.create(player);
      }
      player.addEventListener('play', e => {
        if (events.play) {
          events.play(e);
        }
      });
      player.addEventListener('pause', e => {
        if (events.pause) {
          events.pause(e);
        }
      });
      player.addEventListener('ended', e => {
        if (events.end) {
          events.end(e);
        }
      });
      player.addEventListener('loadedmetadata', function () {
        if (events.ready) {
          events.ready();
        }

        // autoplay
        if (options.autoplay) {
          player.play();
        }
      });
    }
    isValid() {
      return !!this.id;
    }
    play(start) {
      if (!this.player) {
        return;
      }
      if (typeof start !== 'undefined') {
        this.player.currentTime = start;
      }
      if (this.player.paused) {
        this.player.play();
      }
    }
    pause() {
      if (!this.player) {
        return;
      }
      if (!this.player.paused) {
        this.player.pause();
      }
    }
  }

  /* eslint-disable no-undefined,no-param-reassign,no-shadow */

  /**
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param {number} delay -                  A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher)
   *                                            are most useful.
   * @param {Function} callback -               A function to be executed after delay milliseconds. The `this` context and all arguments are passed through,
   *                                            as-is, to `callback` when the throttled-function is executed.
   * @param {object} [options] -              An object to configure options.
   * @param {boolean} [options.noTrailing] -   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds
   *                                            while the throttled-function is being called. If noTrailing is false or unspecified, callback will be executed
   *                                            one final time after the last throttled-function call. (After the throttled-function has not been called for
   *                                            `delay` milliseconds, the internal counter is reset).
   * @param {boolean} [options.noLeading] -   Optional, defaults to false. If noLeading is false, the first throttled-function call will execute callback
   *                                            immediately. If noLeading is true, the first the callback execution will be skipped. It should be noted that
   *                                            callback will never executed if both noLeading = true and noTrailing = true.
   * @param {boolean} [options.debounceMode] - If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is
   *                                            false (at end), schedule `callback` to execute after `delay` ms.
   *
   * @returns {Function} A new, throttled, function.
   */
  function throttle (delay, callback, options) {
    var _ref = {},
      _ref$noTrailing = _ref.noTrailing,
      noTrailing = _ref$noTrailing === undefined ? false : _ref$noTrailing,
      _ref$noLeading = _ref.noLeading,
      noLeading = _ref$noLeading === undefined ? false : _ref$noLeading,
      _ref$debounceMode = _ref.debounceMode,
      debounceMode = _ref$debounceMode === undefined ? undefined : _ref$debounceMode;
    /*
     * After wrapper has stopped being called, this timeout ensures that
     * `callback` is executed at the proper times in `throttle` and `end`
     * debounce modes.
     */
    var timeoutID;
    var cancelled = false;

    // Keep track of the last time `callback` was executed.
    var lastExec = 0;

    // Function to clear existing timeout
    function clearExistingTimeout() {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    }

    // Function to cancel next exec
    function cancel(options) {
      var _ref2 = options || {},
        _ref2$upcomingOnly = _ref2.upcomingOnly,
        upcomingOnly = _ref2$upcomingOnly === undefined ? false : _ref2$upcomingOnly;
      clearExistingTimeout();
      cancelled = !upcomingOnly;
    }

    /*
     * The `wrapper` function encapsulates all of the throttling / debouncing
     * functionality and when executed will limit the rate at which `callback`
     * is executed.
     */
    function wrapper() {
      for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
        arguments_[_key] = arguments[_key];
      }
      var self = this;
      var elapsed = Date.now() - lastExec;
      if (cancelled) {
        return;
      }

      // Execute `callback` and update the `lastExec` timestamp.
      function exec() {
        lastExec = Date.now();
        callback.apply(self, arguments_);
      }

      /*
       * If `debounceMode` is true (at begin) this is used to clear the flag
       * to allow future `callback` executions.
       */
      function clear() {
        timeoutID = undefined;
      }
      if (!noLeading && debounceMode && !timeoutID) {
        /*
         * Since `wrapper` is being called for the first time and
         * `debounceMode` is true (at begin), execute `callback`
         * and noLeading != true.
         */
        exec();
      }
      clearExistingTimeout();
      if (debounceMode === undefined && elapsed > delay) {
        if (noLeading) {
          /*
           * In throttle mode with noLeading, if `delay` time has
           * been exceeded, update `lastExec` and schedule `callback`
           * to execute after `delay` ms.
           */
          lastExec = Date.now();
          if (!noTrailing) {
            timeoutID = setTimeout(debounceMode ? clear : exec, delay);
          }
        } else {
          /*
           * In throttle mode without noLeading, if `delay` time has been exceeded, execute
           * `callback`.
           */
          exec();
        }
      } else if (noTrailing !== true) {
        /*
         * In trailing throttle mode, since `delay` time has not been
         * exceeded, schedule `callback` to execute `delay` ms after most
         * recent execution.
         *
         * If `debounceMode` is true (at begin), schedule `clear` to execute
         * after `delay` ms.
         *
         * If `debounceMode` is false (at end), schedule `callback` to
         * execute after `delay` ms.
         */
        timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
      }
    }
    wrapper.cancel = cancel;

    // Return the wrapper function.
    return wrapper;
  }

  var index = ((global, document) => {
    // If the global wrapper (window) is undefined, do nothing
    if ('undefined' === typeof global.document) {
      return;
    }

    // Default options
    const defaults = {
      wrapperClass: 'iwideo-wrapper',
      overlayClass: 'iwideo-overlay',
      src: false,
      ratio: 1.7778,
      //16:9 ratio
      autoplay: true,
      extra: false,
      loop: true,
      mute: true,
      poster: '',
      posterStyle: {
        size: 'cover',
        position: 'center center',
        repeat: 'no-repeat',
        attachment: 'scroll'
      },
      zIndex: -1,
      autoResize: true,
      isMobile: () => {
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || global.opera);
        return isMobile || global.innerWidth < 768;
      }
    };
    const forEach = (array, callback, scope) => {
      for (let i = 0; i < array.length; i++) {
        callback.call(scope, array[i]); // passes back stuff we need
      }
    };
    class iwideo {
      constructor(element, options = {}) {
        // Extend options
        Object.keys(defaults).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(options, key)) {
            options[key] = defaults[key];
          }
        });

        // Set the ratio
        if ('string' === typeof options.ratio) {
          options.ratio = '4/3' === options.ratio ? 4 / 3 : 16 / 9;
        }

        // Set options
        this.options = options;
        // Get the container
        this.container = 'string' === typeof element ? document.querySelector(element) : element;

        // Check if container exists
        if (!this.container) {
          return new Error(`Could not find the container: ${element}`);
        }
        const parse = url => {
          const undef = {
            type: false,
            id: false
          };
          if (!url) {
            return undef;
          }

          // If the type of url is object, then it should be local. Remaining code accepts only string
          if (typeof url === 'object') {
            if (Object.prototype.hasOwnProperty.call(url, 'mp4') || Object.prototype.hasOwnProperty.call(url, 'ogv') || Object.prototype.hasOwnProperty.call(url, 'ogg') || Object.prototype.hasOwnProperty.call(url, 'webm')) {
              return {
                type: 'html5',
                id: url
              };
            }
            return undef;
          }

          // parse youtube ID
          const idYoutube = (link => {
            // eslint-disable-next-line no-useless-escape
            const regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
            const match = link.match(regExp);
            return match && match[1].length === 11 ? match[1] : false;
          })(url);

          // parse vimeo ID
          const idVimeo = (link => {
            // eslint-disable-next-line no-useless-escape
            const regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            const match = link.match(regExp);
            return match && match[3] ? match[3] : false;
          })(url);

          // parse local string
          const idLocal = (link => {
            // eslint-disable-next-line no-useless-escape
            const videoFormats = link.split(/,(?=mp4\:|webm\:|ogv\:|ogg\:)/);
            const result = {};
            let ready = 0;
            videoFormats.forEach(val => {
              // eslint-disable-next-line no-useless-escape
              const match = val.match(/^(mp4|webm|ogv|ogg)\:(.*)/);
              if (match && match[1] && match[2]) {
                // eslint-disable-next-line prefer-destructuring
                result[match[1] === 'ogv' ? 'ogg' : match[1]] = match[2];
                ready = 1;
              }
            });
            return ready ? result : false;
          })(url);
          if (idYoutube) {
            return {
              type: 'youtube',
              id: idYoutube
            };
          }
          if (idVimeo) {
            return {
              type: 'vimeo',
              id: idVimeo
            };
          }
          if (idLocal) {
            return {
              type: 'html5',
              id: idLocal
            };
          }
          return undef;
        };

        // Parse the source and get video ID
        const parsed = parse(this.options.src);
        this.type = parsed.type;
        this.videoID = parsed.id;

        // Generates a wrapper that is used for holding the media
        const constructWrapper = (self = this) => {
          // Get computed style of the container
          const containerStyle = getComputedStyle(self.container, null);

          // For the absolute positioning inside works, the container should be relative
          if ('static' === containerStyle.getPropertyValue('position')) {
            self.container.style.position = 'relative';
          }

          // Create the wrapper element
          const wrapper = document.createElement('div');

          // If the container is body, set the position as fixed.
          wrapper.style.position = 'absolute';

          // Set wrapper class
          if (self.options.wrapperClass) {
            if ('function' === typeof self.options.wrapperClass) {
              wrapper.classList.add(self.options.wrapperClass.call(self));
            } else {
              wrapper.classList.add.apply(wrapper.classList, self.options.wrapperClass.split(/[ ,]+/));
            }
          }

          // Set wrapper styles
          wrapper.style.left = 0;
          wrapper.style.top = 0;
          wrapper.style.height = '100%';
          wrapper.style.width = '100%';
          wrapper.style.overflow = 'hidden';
          wrapper.style.zIndex = parseInt(self.options.zIndex, 10);
          if (self.options.poster) {
            wrapper.style.backgroundSize = self.options.posterStyle.size;
            wrapper.style.backgroundPosition = self.options.posterStyle.position;
            wrapper.style.backgroundRepeat = self.options.posterStyle.repeat;
            wrapper.style.backgroundAttachment = self.options.posterStyle.attachment;
            wrapper.style.backgroundImage = `url('${self.options.poster}')`;
          }
          self.wrapper = wrapper;
          self.container.insertBefore(wrapper, self.container.firstChild);
        };

        // Generates an overlay that is placed above the media to prevent interaction
        const constructOverlay = (self = this) => {
          const overlay = document.createElement('div');
          overlay.style.position = 'absolute';
          if (self.options.overlayClass) {
            if ('function' === typeof self.options.overlayClass) {
              overlay.classList.add(self.options.overlayClass.call(self));
            } else {
              overlay.classList.add.apply(overlay.classList, self.options.overlayClass.split(/[ ,]+/));
            }
          }
          overlay.style.left = 0;
          overlay.style.top = 0;
          overlay.style.height = '100%';
          overlay.style.width = '100%';
          self.wrapper.appendChild(overlay);
        };
        const constructPlayer = (self = this) => {
          const events = {
            ready: () => {
              self.fire('ready', self);
            },
            play: e => {
              self.el.style.opacity = '1';
              self.fire('play', self, e);
            },
            pause: e => {
              self.fire('pause', self, e);
            },
            end: e => {
              if (!self.options.loop) {
                self.el.style.opacity = '0';
              }
              self.fire('end', self, e);
            },
            create: video => {
              video.style.position = 'absolute';
              video.style.left = '50%';
              video.style.top = '50%';
              video.style.width = '100%';
              video.style.height = '100%';
              video.style.opacity = '0';
              video.style.objectFit = 'cover';
              video.style.transform = 'translateX(-50%) translateY(-50%)';
              if (self.options.extra) {
                Object.keys(self.options.extra).forEach(key => {
                  video.setAttribute(key, self.options.extra[key]);
                });
              }
              self.el = video;

              // Resize the frame
              self.resize();
              self.fire('create', self, video);
            }
          };
          if (self.type === 'youtube') {
            self.worker = new YouTubeVW(global, document, self.videoID, self.wrapper, self.options, events);
          } else if (self.type === 'html5') {
            self.worker = new HTML5VW(document, self.videoID, self.wrapper, self.options, events);
          } else if (self.type === 'vimeo') {
            self.worker = new VimeoVW(document, self.videoID, self.wrapper, self.options, events);
          }
        };

        // Add the wrapper
        constructWrapper();
        // Initialize provider
        if (this.type && !(this.options.isMobile && this.options.isMobile())) {
          constructPlayer();
        }

        // Add the overlay
        constructOverlay();

        // Add resize event
        if (this.options.autoResize) {
          global.addEventListener('resize', throttle(200, this.resize).bind(this), false);
        }

        // Resize
        this.resize();

        // Store the instance in the container
        this.container.iwideo = this;
        this.container.setAttribute('data-iwideo-initialized', true);
      }

      // Destroys and unloads the player
      destroy() {
        // We wrap this next part in try...catch in case the element is already gone for some reason
        try {
          // Remove the node
          this.container.removeChild(this.wrapper);
          // Delete worker instance
          delete this.container.iwideo.worker;
          // Delete the instance
          delete this.container.iwideo;
        } catch (e) {
          // Nothing to do when error is invoked
        }
      }

      // Resizes the player to provide the best viewing experience
      resize() {
        // If there is no element, return
        if (!this.el) {
          return;
        }
        const containerHeight = this.container.offsetHeight;
        const containerWidth = this.container.offsetWidth;
        const isPortrait = 1 < this.options.ratio && containerWidth / containerHeight < this.options.ratio || 1 > this.options.ratio && containerHeight / containerWidth < this.options.ratio;
        if (isPortrait) {
          const val = parseInt(containerHeight * this.options.ratio);
          this.el.style.height = '100%';
          this.el.style.width = val + 'px';
        } else {
          const val = parseInt(containerWidth / this.options.ratio);
          this.el.style.height = val + 'px';
          this.el.style.width = '100%';
        }
      }

      // Starts the video playback
      play() {
        if (this.worker) {
          this.worker.play();
        }
        return this;
      }

      // Pauses the video playback
      pause() {
        if (this.worker) {
          this.worker.pause();
        }
        return this;
      }

      // Hides the media and shows the poster behind it
      showPoster() {
        this.pause().el.style.opacity = '0';
      }

      // events
      on(name, callback) {
        this.userEventsList = this.userEventsList || [];

        // add new callback in events list
        (this.userEventsList[name] || (this.userEventsList[name] = [])).push(callback);
      }
      off(name, callback) {
        if (!this.userEventsList || !this.userEventsList[name]) {
          return;
        }
        if (!callback) {
          delete this.userEventsList[name];
        } else {
          this.userEventsList[name].forEach((val, key) => {
            if (val === callback) {
              this.userEventsList[name][key] = false;
            }
          });
        }
      }
      fire(name) {
        const args = [].slice.call(arguments, 1);
        if (this.userEventsList && typeof this.userEventsList[name] !== 'undefined') {
          const self = this;
          self.userEventsList[name].forEach(function (val) {
            if (val) {
              val.apply(self, args);
            }
          });
        }
      }
    }
    iwideo.destroy = () => {
      forEach(document.querySelectorAll('[data-iwideo-initialized]'), el => {
        el.iwideo.destroy();
      });
    };
    iwideo.resize = () => {
      forEach(document.querySelectorAll('[data-iwideo-initialized]'), el => {
        el.iwideo.resize();
      });
    };

    // Provide method for scanning the DOM and initializing iwideo from attribute
    iwideo.scan = () => {
      // API method for scanning the DOM and initializing vide instances from data-vide attribute
      // Scan the DOM for elements that have data-iwideo attribute and initialize new iwideo instance based on that attribute
      const scan = () => {
        forEach(document.querySelectorAll('[data-iwideo]'), el => {
          // Get the element
          // Check if the element is already instantiated
          if ('undefined' !== typeof el.iwideo) {
            // this element already has an instance
            return;
          }
          try {
            new iwideo(el, JSON.parse(decodeURIComponent(el.getAttribute('data-iwideo'))));
          } catch (e) {
            // Nothin to do when an error is invoked
          }
        });
      };
      if (document.readyState !== 'loading') {
        scan();
      } else {
        document.addEventListener('DOMContentLoaded', scan);
      }
    };
    iwideo.scan();

    // Return iwideo
    return iwideo;
  })('undefined' !== typeof window ? window : undefined, document);

  return index;

}));
