/* 
 * iwideo v1.1.1
 * https://github.com/meceware/iwideo 
 * 
 * Made by Mehmet Celik (https://www.meceware.com/) 
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.iwideo = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  // Deferred
  // thanks http://stackoverflow.com/questions/18096715/implement-deferred-object-without-using-jquery
  function Deferred() {
    this._done = [];
    this._fail = [];
  }

  Deferred.prototype = {
    execute: function execute(list, args) {
      var i = list.length;
      args = Array.prototype.slice.call(args);

      while (i--) {
        list[i].apply(null, args);
      }
    },
    resolve: function resolve() {
      this.execute(this._done, arguments);
    },
    reject: function reject() {
      this.execute(this._fail, arguments);
    },
    done: function done(callback) {
      this._done.push(callback);
    },
    fail: function fail(callback) {
      this._fail.push(callback);
    }
  };

  var YoutubeAPIadded = false;
  var loadingYoutubePlayer = false;
  var loadingYoutubeDefer = new Deferred();

  var YouTubeVW =
  /*#__PURE__*/
  function () {
    function YouTubeVW(global, document, id, wrapper, options) {
      var _this = this;

      var events = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

      _classCallCheck(this, YouTubeVW);

      this.id = id;

      if (!this.isValid()) {
        return;
      }

      if (!YoutubeAPIadded) {
        YoutubeAPIadded = 1;
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.querySelector('body').appendChild(tag);
      }

      var onReady = function onReady(callback) {
        // Listen for global YT player callback
        if ((typeof YT === 'undefined' || YT.loaded === 0) && !loadingYoutubePlayer) {
          // Prevents Ready event from being called twice
          loadingYoutubePlayer = true; // Creates deferred so, other players know when to wait.

          global.onYouTubeIframeAPIReady = function () {
            global.onYouTubeIframeAPIReady = null;
            loadingYoutubeDefer.resolve('done');
            callback();
          };
        } else if ((typeof YT === "undefined" ? "undefined" : _typeof(YT)) === 'object' && YT.loaded === 1) {
          callback();
        } else {
          loadingYoutubeDefer.done(function () {
            callback();
          });
        }
      };

      onReady(function () {
        var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
        var playerOptions = {
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
            origin: typeof global.location.origin !== 'undefined' ? global.location.origin : "".concat(global.location.protocol, "//").concat(global.location.hostname).concat(global.location.port ? ':' + global.location.port : ''),
            playsinline: 1,
            rel: 0,
            start: 0,
            allowfullscreen: false,
            widgetid: 1
          },
          events: {
            'onReady': function onReady(e) {
              if (options.mute) {
                self.player.mute();
              }

              events['ready'] && events['ready'](e);
            },
            'onStateChange': function onStateChange(e) {
              switch (e.data) {
                case YT.PlayerState.ENDED:
                  events['end'] && events['end'](e);
                  break;

                case YT.PlayerState.PLAYING:
                  events['play'] && events['play'](e);
                  break;

                case YT.PlayerState.PAUSED:
                  events['pause'] && events['pause'](e);
                  break;
              }
            }
          }
        }; // Create a temporary dom element that will be replaced by the YouTube iframe

        var toBeReplaced = document.createElement('div'); // Append the element to the wrapper

        wrapper.appendChild(toBeReplaced);
        self.player = new YT.Player(toBeReplaced, playerOptions);
        events['create'] && events['create'](self.player.getIframe());
      });
    }

    _createClass(YouTubeVW, [{
      key: "isValid",
      value: function isValid() {
        return !!this.id;
      }
    }, {
      key: "play",
      value: function play(start) {
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
    }, {
      key: "pause",
      value: function pause() {
        if (!this.player) {
          return;
        }

        if (YT.PlayerState.PLAYING === this.player.getPlayerState()) {
          this.player.pauseVideo();
        }
      }
    }]);

    return YouTubeVW;
  }();

  var VimeoAPIadded = 0;
  var loadingVimeoPlayer = 0;
  var loadingVimeoDefer = new Deferred();

  var VimeoVW =
  /*#__PURE__*/
  function () {
    function VimeoVW(document, id, wrapper, options) {
      var _this = this;

      var events = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      _classCallCheck(this, VimeoVW);

      this.id = id;

      if (!this.isValid()) {
        return;
      }

      if (!VimeoAPIadded) {
        VimeoAPIadded = 1;
        var tag = document.createElement('script');
        tag.src = 'https://player.vimeo.com/api/player.js';
        document.querySelector('body').appendChild(tag);
      }

      var onReady = function onReady(callback) {
        // Listen for global Vimeo player callback
        if (typeof Vimeo === 'undefined' && !loadingVimeoPlayer) {
          // Prevents Ready event from being called twice
          loadingVimeoPlayer = true; // Creates deferred so, other players know when to wait.

          var vimeoInterval = setInterval(function () {
            if (typeof Vimeo !== 'undefined') {
              clearInterval(vimeoInterval);
              loadingVimeoDefer.resolve('done');
              callback();
            }
          }, 100);
        } else if (typeof Vimeo !== 'undefined') {
          callback();
        } else {
          loadingVimeoDefer.done(function () {
            callback();
          });
        }
      };

      onReady(function () {
        var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
        var playerOptions = {
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
        var optionsStr = '';
        Object.keys(playerOptions).forEach(function (key) {
          if (optionsStr !== '') {
            optionsStr += '&';
          }

          optionsStr += "".concat(key, "=").concat(encodeURIComponent(playerOptions[key]));
        }); // Create the Vimeo iframe

        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', "https://player.vimeo.com/video/".concat(id, "?").concat(optionsStr));
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('mozallowfullscreen', '');
        iframe.setAttribute('webkitallowfullscreen', '');
        iframe.setAttribute('allowfullscreen', ''); // Append the element to the wrapper

        wrapper.appendChild(iframe);
        events['create'] && events['create'](iframe);
        self.player = new Vimeo.Player(iframe, playerOptions);
        self.player.on('play', function (e) {
          events['play'] && events['play'](e);
        });
        self.player.on('pause', function (e) {
          events['pause'] && events['pause'](e);
        });
        self.player.on('ended', function (e) {
          events['end'] && events['end'](e);
        });
        self.player.on('loaded', function (e) {
          events['ready'] && events['ready'](e);
        });
      });
    }

    _createClass(VimeoVW, [{
      key: "isValid",
      value: function isValid() {
        return !!this.id;
      }
    }, {
      key: "play",
      value: function play(start) {
        var self = this;

        if (!self.player) {
          return;
        }

        if (typeof start !== 'undefined') {
          self.player.player.setCurrentTime(start || 0);
        }

        self.player.getPaused().then(function (paused) {
          if (paused) {
            self.player.play();
          }
        });
      }
    }, {
      key: "pause",
      value: function pause() {
        var self = this;

        if (!self.player) {
          return;
        }

        self.player.getPaused().then(function (paused) {
          if (!paused) {
            self.player.pause();
          }
        });
      }
    }]);

    return VimeoVW;
  }();

  var HTML5VW =
  /*#__PURE__*/
  function () {
    function HTML5VW(document, id, wrapper, options) {
      var events = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      _classCallCheck(this, HTML5VW);

      this.id = id;

      if (!this.isValid()) {
        return;
      }

      var player = document.createElement('video');

      if (options.mute) {
        player.muted = true;
      }

      player.loop = options.loop;
      player.setAttribute('playsinline', '');
      player.setAttribute('webkit-playsinline', '');
      Object.keys(id).forEach(function (key) {
        var source = document.createElement('source');
        source.src = id[key];
        source.type = "video/".concat(key);
        player.appendChild(source);
      });
      this.player = player;
      wrapper.appendChild(player);
      events['create'] && events['create'](player);
      player.addEventListener('play', function (e) {
        events['play'] && events['play'](e);
      });
      player.addEventListener('pause', function (e) {
        events['pause'] && events['pause'](e);
      });
      player.addEventListener('ended', function (e) {
        events['end'] && events['end'](e);
      });
      player.addEventListener('loadedmetadata', function () {
        events['ready'] && events['ready'](); // TODO
        // autoplay

        if (options.autoplay) {
          player.play();
        }
      });
    }

    _createClass(HTML5VW, [{
      key: "isValid",
      value: function isValid() {
        return !!this.id;
      }
    }, {
      key: "play",
      value: function play(start) {
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
    }, {
      key: "pause",
      value: function pause() {
        if (!this.player) {
          return;
        }

        if (!this.player.paused) {
          this.player.pause();
        }
      }
    }]);

    return HTML5VW;
  }();

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var index_cjs = createCommonjsModule(function (module, exports) {

  Object.defineProperty(exports, '__esModule', { value: true });

  /* eslint-disable no-undefined,no-param-reassign,no-shadow */

  /**
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
   *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
   *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
   *                                    the internal counter is reset)
   * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                    to `callback` when the throttled-function is executed.
   * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
   *                                    schedule `callback` to execute after `delay` ms.
   *
   * @return {Function}  A new, throttled, function.
   */
  function throttle (delay, noTrailing, callback, debounceMode) {
    /*
     * After wrapper has stopped being called, this timeout ensures that
     * `callback` is executed at the proper times in `throttle` and `end`
     * debounce modes.
     */
    var timeoutID;
    var cancelled = false; // Keep track of the last time `callback` was executed.

    var lastExec = 0; // Function to clear existing timeout

    function clearExistingTimeout() {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    } // Function to cancel next exec


    function cancel() {
      clearExistingTimeout();
      cancelled = true;
    } // `noTrailing` defaults to falsy.


    if (typeof noTrailing !== 'boolean') {
      debounceMode = callback;
      callback = noTrailing;
      noTrailing = undefined;
    }
    /*
     * The `wrapper` function encapsulates all of the throttling / debouncing
     * functionality and when executed will limit the rate at which `callback`
     * is executed.
     */


    function wrapper() {
      var self = this;
      var elapsed = Date.now() - lastExec;
      var args = arguments;

      if (cancelled) {
        return;
      } // Execute `callback` and update the `lastExec` timestamp.


      function exec() {
        lastExec = Date.now();
        callback.apply(self, args);
      }
      /*
       * If `debounceMode` is true (at begin) this is used to clear the flag
       * to allow future `callback` executions.
       */


      function clear() {
        timeoutID = undefined;
      }

      if (debounceMode && !timeoutID) {
        /*
         * Since `wrapper` is being called for the first time and
         * `debounceMode` is true (at begin), execute `callback`.
         */
        exec();
      }

      clearExistingTimeout();

      if (debounceMode === undefined && elapsed > delay) {
        /*
         * In throttle mode, if `delay` time has been exceeded, execute
         * `callback`.
         */
        exec();
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

    wrapper.cancel = cancel; // Return the wrapper function.

    return wrapper;
  }

  /* eslint-disable no-undefined */
  /**
   * Debounce execution of a function. Debouncing, unlike throttling,
   * guarantees that a function is only executed a single time, either at the
   * very beginning of a series of calls, or at the very end.
   *
   * @param  {Number}   delay         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}  [atBegin]     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
   *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
   *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   * @param  {Function} callback      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                  to `callback` when the debounced-function is executed.
   *
   * @return {Function} A new, debounced function.
   */

  function debounce (delay, atBegin, callback) {
    return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
  }

  exports.throttle = throttle;
  exports.debounce = debounce;
  });

  unwrapExports(index_cjs);
  var index_cjs_1 = index_cjs.throttle;
  var index_cjs_2 = index_cjs.debounce;

  var index = (function (global, document) {
    // If the global wrapper (window) is undefined, do nothing
    if ('undefined' === typeof global.document) {
      return;
    } // Default options


    var defaults = {
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
      isMobile: function isMobile() {
        var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || global.opera);
        return isMobile || global.innerWidth < 768;
      }
    };

    var forEach = function forEach(array, callback, scope) {
      for (var i = 0; i < array.length; i++) {
        callback.call(scope, array[i]); // passes back stuff we need
      }
    };

    var iwideo =
    /*#__PURE__*/
    function () {
      function iwideo(element) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, iwideo);

        // Extend options
        Object.keys(defaults).forEach(function (key) {
          if (!Object.prototype.hasOwnProperty.call(options, key)) {
            options[key] = defaults[key];
          }
        }); // Set the ratio

        if ('string' === typeof options.ratio) {
          options.ratio = '4/3' === options.ratio ? 4 / 3 : 16 / 9;
        } // Set options


        this.options = options; // Get the container

        this.container = 'string' === typeof element ? document.querySelector(element) : element; // Check if container exists

        if (!this.container) {
          return new Error("Could not find the container: ".concat(element));
        }

        var parse = function parse(url) {
          var undef = {
            type: false,
            id: false
          };

          if (!url) {
            return undef;
          } // If the type of url is object, then it should be local. Remaining code accepts only string


          if (_typeof(url) === 'object') {
            if (Object.prototype.hasOwnProperty.call(url, 'mp4') || Object.prototype.hasOwnProperty.call(url, 'ogv') || Object.prototype.hasOwnProperty.call(url, 'ogg') || Object.prototype.hasOwnProperty.call(url, 'webm')) {
              return {
                type: 'html5',
                id: url
              };
            }

            return undef;
          } // parse youtube ID


          var idYoutube = function (url) {
            // eslint-disable-next-line no-useless-escape
            var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
            var match = url.match(regExp);
            return match && match[1].length === 11 ? match[1] : false;
          }(url); // parse vimeo ID


          var idVimeo = function (url) {
            // eslint-disable-next-line no-useless-escape
            var regExp = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
            var match = url.match(regExp);
            return match && match[3] ? match[3] : false;
          }(url); // parse local string


          var idLocal = function (url) {
            // eslint-disable-next-line no-useless-escape
            var videoFormats = url.split(/,(?=mp4\:|webm\:|ogv\:|ogg\:)/);
            var result = {};
            var ready = 0;
            videoFormats.forEach(function (val) {
              // eslint-disable-next-line no-useless-escape
              var match = val.match(/^(mp4|webm|ogv|ogg)\:(.*)/);

              if (match && match[1] && match[2]) {
                // eslint-disable-next-line prefer-destructuring
                result[match[1] === 'ogv' ? 'ogg' : match[1]] = match[2];
                ready = 1;
              }
            });
            return ready ? result : false;
          }(url);

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
        }; // Parse the source and get video ID


        var parsed = parse(this.options.src);
        this.type = parsed.type;
        this.videoID = parsed.id; // Generates a wrapper that is used for holding the media

        var constructWrapper = function constructWrapper() {
          var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
          // Get computed style of the container
          var containerStyle = getComputedStyle(self.container, null); // For the absolute positioning inside works, the container should be relative

          if ('static' === containerStyle.getPropertyValue('position')) {
            self.container.style.position = 'relative';
          } // Create the wrapper element


          var wrapper = document.createElement('div'); // If the container is body, set the position as fixed.

          wrapper.style.position = 'absolute'; // Set wrapper class

          if (self.options.wrapperClass) {
            if ('function' === typeof self.options.wrapperClass) {
              wrapper.classList.add(self.options.wrapperClass.call(self));
            } else {
              wrapper.classList.add(self.options.wrapperClass);
            }
          } // Set wrapper styles


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
            wrapper.style.backgroundImage = "url('".concat(self.options.poster, "')");
          }

          self.wrapper = wrapper;
          self.container.insertBefore(wrapper, self.container.firstChild);
        }; // Generates an overlay that is placed above the media to prevent interaction


        var constructOverlay = function constructOverlay() {
          var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
          var overlay = document.createElement('div');
          overlay.style.position = 'absolute';

          if (self.options.overlayClass) {
            if ('function' === typeof self.options.overlayClass) {
              overlay.classList.add(self.options.overlayClass.call(self));
            } else {
              overlay.classList.add(self.options.overlayClass);
            }
          }

          overlay.style.left = 0;
          overlay.style.top = 0;
          overlay.style.height = '100%';
          overlay.style.width = '100%';
          self.wrapper.appendChild(overlay);
        };

        var constructPlayer = function constructPlayer() {
          var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this;
          var events = {
            'ready': function ready() {
              self.fire('ready', self);
            },
            'play': function play(e) {
              self.el.style.opacity = '1';
              self.fire('play', self, e);
            },
            'pause': function pause(e) {
              self.fire('pause', self, e);
            },
            'end': function end(e) {
              if (!self.options.loop) {
                self.el.style.opacity = '0';
              }

              self.fire('end', self, e);
            },
            'create': function create(video) {
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
              self.options.extra && Object.keys(self.options.extra).forEach(function (key) {
                video.setAttribute(key, self.options.extra[key]);
              });
              self.el = video; // Resize the frame

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
        }; // Add the wrapper


        constructWrapper(); // Initialize provider

        if (this.type && !(this.options.isMobile && this.options.isMobile())) {
          constructPlayer();
        } // Add the overlay


        constructOverlay(); // Add resize event

        if (this.options.autoResize) {
          global.addEventListener('resize', index_cjs_1(200, this.resize).bind(this), false);
        } // Resize


        this.resize(); // Store the instance in the container

        this.container.iwideo = this;
        this.container.setAttribute('data-iwideo-initialized', true);
      } // Destroys and unloads the player


      _createClass(iwideo, [{
        key: "destroy",
        value: function destroy() {
          // We wrap this next part in try...catch in case the element is already gone for some reason
          try {
            // Remove the node
            this.container.removeChild(this.wrapper); // Delete worker instance

            delete this.container.iwideo.worker; // Delete the instance

            delete this.container.iwideo;
          } catch (e) {// Nothing to do when error is invoked
          }
        } // Resizes the player to provide the best viewing experience

      }, {
        key: "resize",
        value: function resize() {
          // If there is no element, return
          if (!this.el) {
            return;
          }

          var containerHeight = this.container.offsetHeight;
          var containerWidth = this.container.offsetWidth;
          var isPortrait = 1 < this.options.ratio && containerWidth / containerHeight < this.options.ratio || 1 > this.options.ratio && containerHeight / containerWidth < this.options.ratio;

          if (isPortrait) {
            this.el.style.maxHeight = '100%';
            this.el.style.maxWidth = 'none';
            this.el.style.height = '';
            this.el.style.width = this.el.offsetHeight * this.options.ratio + 200 + 'px';
          } else {
            this.el.style.maxHeight = 'none';
            this.el.style.maxWidth = '100%';
            this.el.style.height = this.el.offsetWidth / this.options.ratio + 'px';
            this.el.style.width = '';

            if (this.el.offsetHeight < this.wrapper.offsetHeight + 140) {
              this.el.style.height = this.el.offsetWidth / this.options.ratio + 140 + 'px';
            }
          }
        } // Starts the video playback

      }, {
        key: "play",
        value: function play() {
          this.worker && this.worker.play();
          return this;
        } // Pauses the video playback

      }, {
        key: "pause",
        value: function pause() {
          this.worker && this.worker.pause();
          return this;
        } // Hides the media and shows the poster behind it

      }, {
        key: "showPoster",
        value: function showPoster() {
          this.pause().el.style.opacity = '0';
        } // events

      }, {
        key: "on",
        value: function on(name, callback) {
          this.userEventsList = this.userEventsList || []; // add new callback in events list

          (this.userEventsList[name] || (this.userEventsList[name] = [])).push(callback);
        }
      }, {
        key: "off",
        value: function off(name, callback) {
          var _this2 = this;

          if (!this.userEventsList || !this.userEventsList[name]) {
            return;
          }

          if (!callback) {
            delete this.userEventsList[name];
          } else {
            this.userEventsList[name].forEach(function (val, key) {
              if (val === callback) {
                _this2.userEventsList[name][key] = false;
              }
            });
          }
        }
      }, {
        key: "fire",
        value: function fire(name) {
          var args = [].slice.call(arguments, 1);

          if (this.userEventsList && typeof this.userEventsList[name] !== 'undefined') {
            var self = this;
            self.userEventsList[name].forEach(function (val) {
              val && val.apply(self, args);
            });
          }
        }
      }]);

      return iwideo;
    }();

    iwideo.destroy = function () {
      forEach(document.querySelectorAll('[data-iwideo-initialized]'), function (el) {
        el.iwideo.destroy();
      });
    };

    iwideo.resize = function () {
      forEach(document.querySelectorAll('[data-iwideo-initialized]'), function (el) {
        el.iwideo.resize();
      });
    }; // Provide method for scanning the DOM and initializing iwideo from attribute


    iwideo.scan = function () {
      // API method for scanning the DOM and initializing vide instances from data-vide attribute
      // Scan the DOM for elements that have data-iwideo attribute and initialize new iwideo instance based on that attribute
      var scan = function scan() {
        forEach(document.querySelectorAll('[data-iwideo]'), function (el) {
          // Get the element
          // Check if the element is already instantiated
          if ('undefined' !== typeof el.iwideo) {
            // this element already has an instance
            return;
          }

          try {
            new iwideo(el, JSON.parse(decodeURIComponent(el.getAttribute('data-iwideo'))));
          } catch (e) {// Nothin to do when an error is invoked
          }
        });
      };

      if (document.readyState != 'loading') {
        scan();
      } else {
        document.addEventListener('DOMContentLoaded', scan);
      }
    };

    iwideo.scan(); // Return iwideo

    return iwideo;
  })('undefined' !== typeof window ? window : undefined, document);

  return index;

}));
