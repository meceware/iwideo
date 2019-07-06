# iwideo
## No-dependencies library for displaying background videos in browsers

It supports all modern browsers. It disables the videos on mobile browsers or windows under 768px, if wanted.

## Supported Providers

* Self Hosted Videos
* Youtube
* Vimeo

## Build
Clone the repo, run
```
npm install
```
followed by
```
npm run build
```
The output minified JS file will be at the dist folder.

You can help out by reporting any issues and feature requests.

## How To Use

Include the library

```html
<script type="text/javascript" src="js/iwideo.min.js"></script>
```

The default options are

```javascript
{
  wrapperClass: 'iwideo-wrapper',
  overlayClass: 'iwideo-overlay',
  src: false,
  ratio: 1.7778, //16:9 ratio
  autoplay: true,
  extra: false,
  loop: true,
  mute: true,
  poster: '',
  zIndex: -1,
  autoResize: true,
  isMobile: () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || global.opera);
    return isMobile || ( global.innerWidth < 768 );
  },
}
```

To create background local-hosted video

```javascript
var myBackground = new iwideo( '#element-selector', {
  src: 'mp4:./local-video.mp4,webm:./local-video.webm,ogv:./local-video.ogv',
  poster: './local-poster.jpg'
});
```

To create background YouTube video

```javascript
var myBackground = new iwideo( '#element-selector', {
  src: 'https://www.youtube.com/watch?v=uVW81kp2HSo',
  poster: 'https://i3.ytimg.com/vi/uVW81kp2HSo/hqdefault.jpg'
});
```

To create background Vimeo video

```javascript
var myBackground = new iwideo( '#element-selector', {
  src: 'https://vimeo.com/76979871',
  poster: 'https://i.vimeocdn.com/video/452001751_1280x720.jpg'
});
```

You can also set data-iwideo attribute of the wrapper element, the script will automatically initialize the background videos. To use the data attribute, set data-iwideo attribute as URI encoded JSON string of the options. In React, it can be created as the following:

```javascript
var options = {
  src: 'mp4:./local-video.mp4,webm:./local-video.webm,ogv:./local-video.ogv',
  poster: './local-poster.jpg'
};

[].forEach.call( document.querySelectorAll( '.html5-video' ), function( div ) {
  div.setAttribute( 'data-iwideo', encodeURIComponent( JSON.stringify( options ) ) );
});
```

If you want to destroy the background video or all background videos initialized with `data-iwideo` data attribute, call

```javascript
// Destroy the element initialized with javascript
iwideo.destroy( '#element-selector' );
// Destroy all initialized with data-iwideo
iwideo.destroyAll();
```

If you want to scan and initialize the DOM again, call

```javascript
iwideo.scan();
```

This will initialize all elements with `data-iwideo` data attribute.

If you want to enable videos on mobile as well, set `isMobile` to false or you can add your custom function.

## License

MIT