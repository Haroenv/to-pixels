# new Pixel('art');

```js
var pixelass = new Pixel('ass.png');
```

![pixelASS.png](https://raw.githubusercontent.com/pixelass/to-pixels/master/pixelASS.png)

> convert images to pixelart and more

* Ever wanted to upscale an image while keeping the pixel density?
* Ever wanted to make a mosaic effect from an image?
* Absolutely sick of square pixels?
* In need of a generator that delivers, images, canvas, SVG or box-shadow versions?

> Pixel is here to help

Examples:  
[1. (v0.0.5)](http://codepen.io/pixelass/pen/JXpJZP)  
[2. (v0.0.5)](http://codepen.io/pixelass/full/mPXrdM)  
[3. (v0.1.0)](http://codepen.io/pixelass/full/KzogJj)  

## node & bower

```shell
npm install to-pixels
bower install to-pixels
```

## common js

```js
import Pixel from 'to-pixels'
// or
var Pixel = require('to-pixels');
```

## browser

```js
var Pixel = window.Pixel;
```

## simple
```js
  new Pixel('art.png',function(instance){
    var simple     = instance.getType('canvas');
    var svg        = instance.getType('svg');
    var img        = instance.getType('img');
    var boxShadow  = instance.getType('boxShadow');
    var colorArray = instance.getType('colorArray')(function(colors,row){
      // e.g. colors = ['transparent', 'hsla(0,0,0,1)', 'hsla(0,0,0,1)', 'transparent']
      //      row = 32 (pixels/row)
    });
  });
```

## options
```js
  new Pixel({
    src: 'bart.png',
    pixel: 6,
    row: 64,
    shape: 'circle',
    hue: 20
    hueRotate: -50,
    saturate: -.5
  },function(instance){
    var output = instance.getType('img');
    document.getElementById('example_options').appendChild(output);
  });
```

## methods 
```js
  new Pixel('art.png', function(instance){
    let type = 'canvas'; // canvas, svg, img, boxShadow, colorArray
    let output = instance.getType(type);
  });

```

supported types:



Version 0.1.0 only comes with two methods

`getType`: lazy method to generate when needed  
`setOptions`: set Options after initializing


Version 0.1.0 offers color modification

`hue`: only use this hue value  
`hueRotate`: rotate hue
`saturate`: saturate from -1 to 1


Due to performance concerns the new API does not render anything by itself