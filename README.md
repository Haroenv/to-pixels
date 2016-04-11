# new Pixel('art');

```js
var pixelass = new Pixel('ass');
```

![pixelASS.png](https://raw.githubusercontent.com/pixelass/to-pixels/master/pixelASS.png)

> convert images to pixelart and more

* Ever wanted to upscae an image while keeping the pixel density?
* Ever wanted to make a mosaic effect from an image?
* Absolutely sick of square pixels?
* In need of a generator that delivers, images, canvas, SVG or box-shadow versions?

> Pixels is here

```shell
npm i to-pixel
```

```js
import Pixel from 'to-pixel'
```

## simple
```js
  var pixelart = new Pixel({
    src: 'art.png'
  },target);
```

## options
```js
  var pixelart = new Pixel({
    src: 'art.png',
    pixel: 4,
    scale: 32,
    // ... (src,type,pixel,scale,shape)
  },target);
```

## methods 
```js
  var pixelart = new Pixel({
    src: 'art.png'
  },target);

  pixelart.scale(64);
  pixelart.pixel(4);
  pixelart.resize(64,4);
  pixelart.shape('circle');
  pixelart.src('ass.png');
  pixelart.type('svg');
```


| Method        | description                              |
| ------------- | ---------------------------------------- |
| scale         | witdh of input                           |
| pixel         | size of pixel                            |
| resize        | see scale & pixel                        |
| shape         | shape of pixel  (circle, undefined)      |
| type          | type of output  (canvas, svg,img,shadow) |
| src           | image-src of input                       |


