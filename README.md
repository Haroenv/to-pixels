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
[1. (v0.0.5)](http://codepen.io/pixelass/full/JXpJZP)  
[2. (v0.0.5)](http://codepen.io/pixelass/full/mPXrdM)  
[3. (v0.2.0)](http://codepen.io/pixelass/full/dMmdbV)  

## npm & bower

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
var target = document.getElementById('example');
new Pixel('ass.png',function(set,get){
  var simple = get('canvas');
  target.appendChild(simple);
});
```

## options

```js
var target = document.getElementById('example');
new Pixel({
  src: 'bart.png',
  pixel: 20,
  row: 32,
  // hue: 50,
  // invert: true,
  hueRotate: 30,
  saturate: -.5
},function(set,get){
  set({
    pixel: 5,
    row: 64,
    shape: 'circle'
  });
  var output = get('img');
  target.appendChild(output);
});
```

## callback 

```js
new Pixel('art.png', function(set,get){
  // set after init 
  // src cannot be changed
  set({pixel:10});
  // get the requested type
  let output = get('svg');
});
```

supported types:
* canvas
* svg
* img
* boxShadow
* colorArray



Version 0.2.x comes with two callback methods

* `get`: lazy method to generate when needed  
* `set`: set Options after initializing


Version 0.2.x offers color modification

* `hue`: only use this hue value  
* `hueRotate`: rotate hue  
* `saturate`: saturate from -1 to 1  
* `invert`: inverts the colors  


Due to performance concerns the new API does not render anything by itself
