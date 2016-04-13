(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.Pixel = _index2.default;
},{"./index":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pixel = function () {
  function Pixel(options, loadCallback) {
    _classCallCheck(this, Pixel);

    var defaults = {
      pixel: 1,
      row: 32,
      shape: 'square'
    };
    this.options = {};
    (0, _objectAssign2.default)(this.options, defaults);

    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
      (0, _objectAssign2.default)(this.options, options);
    } else if (typeof options === 'string') {
      (0, _objectAssign2.default)(this.options, {
        src: options
      });
    } else {
      return console.error('\n        Error: "options" should be an "object" or a "string"\n        The provided type "' + (typeof options === 'undefined' ? 'undefined' : _typeof(options)) + '"" is not supported\n      ');
    }
    this.loadCallback = loadCallback;
    this.init(this.options);
  }

  _createClass(Pixel, [{
    key: 'init',
    value: function init(options) {
      this.reader = this.createReader();
      this.setSource(this.reader, this.options.src);
    }
  }, {
    key: 'onLoad',
    value: function onLoad(e) {
      this.updateReader(this.reader);
    }
  }, {
    key: 'loaded',
    value: function loaded(callback) {
      if (typeof callback === 'function') {
        console.log('2.', this.options.height);
        callback(this);
      }
    }
  }, {
    key: 'setSource',
    value: function setSource(reader, src) {
      reader.input.src = src;
    }
  }, {
    key: 'createReader',
    value: function createReader() {
      var input = document.createElement('img');
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      input.crossOrigin = 'Anonymous';
      input.onload = this.onLoad.bind(this);

      return {
        canvas: canvas,
        context: context,
        input: input
      };
    }
  }, {
    key: 'updateReader',
    value: function updateReader(reader) {
      var height = reader.input.height = reader.input.height / reader.input.width * this.options.row;
      var width = reader.input.width = this.options.row;
      (0, _objectAssign2.default)(this.options, { height: height, width: width });
      (0, _objectAssign2.default)(reader.canvas, { height: height, width: width });

      reader.context.drawImage(reader.input, 0, 0, width, height);
      this.loadCallback(this);
    }
  }, {
    key: 'getColorArray',
    value: function getColorArray(context) {
      var imageData = context.getImageData(0, 0, this.options.width, this.options.height);
      var colorArray = [];

      if (!imageData) {
        return colorArray;
      }

      var data = imageData.data;
      // simplify the array
      for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var a = data[i + 3] / 255;
        var rgba = 'rgba(' + [r, g, b, a].join(',') + ')';

        // make transparent pixels obvious for later filtering
        if (a === 0) {
          colorArray.push('transparent');
        } else {
          colorArray.push(rgba);
        }
      }
      if (colorArray.length > this.options.width) {
        this.colorArray = colorArray;
      } else {
        this.colorArray = false;
      }
      return colorArray;
    }
  }, {
    key: 'drawShadow',
    value: function drawShadow(reader) {
      var _this = this;

      var shadow = [];
      var y = 0;
      var pixel = this.options.pixel;
      var div = document.createElement('div');
      var colorArray = this.colorArray || this.getColorArray(reader.context);

      var margin = [-1 * pixel + 'px', pixel * this.options.width + 'px', pixel * this.options.height + 'px', -1 * pixel + 'px'].join(' ');
      var width = pixel + 'px';
      var height = width;

      (0, _objectAssign2.default)(div.style, {
        margin: margin,
        height: height,
        width: width
      });

      if (this.options.shape === 'circle') {
        div.style.borderRadius = '100%';
      }

      colorArray.forEach(function (color, index) {
        var width = _this.options.width;
        var x = index % width + 1;

        if (x === 1) {
          ++y;
        }

        if (color !== 'transparent') {
          shadow.push(x * pixel + 'px ' + y * pixel + 'px 0 ' + color);
        }
      });

      div.style.boxShadow = shadow.join(',');

      return div;
    }
  }, {
    key: 'drawSVG',
    value: function drawSVG(reader) {
      var _this2 = this;

      var colorArray = this.colorArray || this.getColorArray(reader.context);
      var y = -1;
      var xmlns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(xmlns, 'svg');
      var height = this.options.height;
      var width = this.options.width;
      var pixel = this.options.pixel;
      svg.setAttributeNS(null, 'viewBox', '0 0 ' + [width, height].join(' '));
      svg.setAttributeNS(null, 'height', height * pixel);
      svg.setAttributeNS(null, 'width', width * pixel);

      colorArray.forEach(function (color, index) {
        var x = index % width;
        if (x === 0) {
          ++y;
        }

        // filter transparent pixels
        if (color !== 'transparent') {

          if (_this2.options.shape === 'circle') {
            var circle = document.createElementNS(xmlns, 'circle');
            circle.setAttributeNS(null, 'fill', color);
            circle.setAttributeNS(null, 'cx', x + .5);
            circle.setAttributeNS(null, 'cy', y + .5);
            circle.setAttributeNS(null, 'r', .5);
            svg.appendChild(circle);
          } else {
            var rect = document.createElementNS(xmlns, 'rect');
            rect.setAttributeNS(null, 'fill', color);
            rect.setAttributeNS(null, 'x', x);
            rect.setAttributeNS(null, 'y', y);
            rect.setAttributeNS(null, 'width', 1);
            rect.setAttributeNS(null, 'height', 1);
            svg.appendChild(rect);
          }
        }
      });

      return svg;
    }

    /**
     * draw the art on a canvas
     * @return {Node} returns a canvas with the pixelart version
     */

  }, {
    key: 'drawCanvas',
    value: function drawCanvas(reader) {
      var _this3 = this;

      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var colorArray = this.colorArray || this.getColorArray(reader.context);
      var y = -1;
      var pixel = this.options.pixel;

      canvas.height = this.options.height * pixel;
      canvas.width = this.options.width * pixel;

      colorArray.forEach(function (color, index) {
        var x = index % _this3.options.width;

        if (x === 0) {
          ++y;
        }

        if (color !== 'transparent') {
          context.fillStyle = color;
          if (_this3.options.shape === 'circle') {
            context.beginPath();
            context.arc((x + .5) * pixel, (y + .5) * pixel, pixel / 2, 0, 2 * Math.PI);
            context.closePath();
            context.fill();
          } else {
            context.fillRect(x * pixel, y * pixel, pixel, pixel);
          }
        }
      });
      return canvas;
    }
  }, {
    key: 'getDataURL',
    value: function getDataURL(canvas) {
      return canvas.toDataURL('image/png');
    }
  }, {
    key: 'drawIMG',
    value: function drawIMG(dataURL) {
      var img = document.createElement('img');
      img.src = dataURL;
      return img;
    }

    /**
     * render the pixelart
     */

  }, {
    key: 'render',
    value: function render(target) {
      var drawing = this.draw(this.options.type);
      target.innerHTML = '';
      target.appendChild(drawing);
    }
  }, {
    key: 'getType',
    value: function getType(type) {
      var _this4 = this;

      var reader = this.reader;
      if (type === 'canvas') {
        return this.drawCanvas(reader);
      } else if (type === 'svg') {
        return this.drawSVG(reader);
      } else if (type === 'img') {
        var canvas = this.drawCanvas(reader);
        var dataURL = this.getDataURL(canvas);
        return this.drawIMG(dataURL);
      } else if (type === 'boxShadow') {
        return this.drawShadow(reader);
      } else if (type === 'dataURL') {
        var _canvas = this.drawCanvas(reader);
        return this.getDataURL(_canvas);
      } else if (type === 'colorArray') {
        return function (callback) {
          if (typeof callback === 'function') {
            var colors = _this4.getColorArray(reader.context);
            callback(colors, _this4.options.row);
          }
        };
      } else {
        var message = 'Error: ' + type + ' is not a supported type';
        return {
          message: message
        };
      }
    }
  }]);

  return Pixel;
}();

exports.default = Pixel;
},{"object-assign":3}],3:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}]},{},[1]);
