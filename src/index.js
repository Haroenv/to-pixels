import objectAssign from 'object-assign';
import Color from 'color';


/**
 * @class  Pixel
 * generate, colorize and scale pixel art
 *
 * @property {Object|String} options options used on init
 * @property {Function} loadCallback a callback bound to an instance
 */
class Pixel {
  constructor(options, loadCallback) {
    // default options
    let defaults = {
      pixel: 1,
      row: 32,
      shape: 'square'
    }

    // create internal options and extend by defaults
    this.options = {};
    objectAssign(this.options, defaults);

    // if the given options are an object merge them
    // in case of a string it the source will be set
    // if both fail return an error and stop execution
    if (typeof options === 'object') {
      objectAssign(this.options, options);
    } else if (typeof options === 'string') {
      objectAssign(this.options, {
        src: options
      });
    } else {
      return console.error(`
        Error: "options" should be an "object" or a "string"
        The provided type "${typeof options}"" is not supported
      `);
    }

    // bind the callback to this instance
    // and initialize
    this.loadCallback = loadCallback;
    this.reader = this.createReader();
    this.setSource(this.reader, this.options.src);
  }

  /**
   * update the reader after the input is loaded
   * @param  {Event} e load event
   */
  onLoad(e) {
    this.updateReader(this.reader);
    this.loadCallback(this.set.bind(this),this.get.bind(this));
 }

  /**
   * called on loadCallback
   * @param  {Function} callback callback function bound to instance
   */
  loaded(callback) {
    if (typeof callback === 'function') {
      callback(this);
    }
  }

  /**
   * [setSource description]
   * @param {Object} reader = {input,canvas,context}
   * @param {string} src    CORS ready URL
   */
  setSource(reader, src) {
    reader.input.src = src;
  }

  /**
   * create a reader for the instance
   * @return {Object} retuns the input, with the canvas and its context in an object
   *                  {canvas,context, input}
   */
  createReader() {
    let input = document.createElement('img');
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    input.crossOrigin = 'Anonymous';
    input.onload = this.onLoad.bind(this);

    return {
      canvas,
      context,
      input
    };
  }

  /**
   * update the reader with current options
   * sets dimensions and draws the input on the context
   * @param {Object} reader = {input,canvas,context}
   */
  updateReader(reader) {
    let height = reader.input.height / reader.input.width * this.options.row;
    let width = this.options.row;
    objectAssign(this.options, {
      height,
      width
    });
    objectAssign(reader.canvas, {
      height,
      width
    });
    objectAssign(reader.input, {
      height,
      width
    });

    reader.context.drawImage(reader.input, 0, 0, width, height);
  }

  /**
   * set options after init
   * @param {Object} options new options
   */
  set(options) {
    objectAssign(this.options, options);
    this.updateReader(this.reader);
  }

  /**
   * [getColorArray description]
   * @param  {CanvasRenderingContext2D} context the readers context
   * @return {Object}         returns colors as an array of hsla or transparent value
   */
  getColorArray(context) {
    let imageData = context.getImageData(0, 0, this.options.width, this.options.height);
    let colorArray = [];

    if (!imageData) {
      return colorArray;
    }

    let data = imageData.data;
    // simplify the array
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let a = data[i + 3] / 255;
      let rgba = `rgba(${[r,g,b,a].join(',')})`;

      // make transparent pixels obvious for later filtering
      if (a === 0) {
        colorArray.push('transparent');
      } else {
        let color = new Color(rgba);
        let invert = this.options.invert;
        let hue = this.options.hue;
        let hueRotate = this.options.hueRotate;
        let sat = this.options.saturate;
        // handle color modification
        if (invert === true) {
          color = color.negate()
        }
        if (typeof hue === 'number') {
          color = color.hue(hue);
        }
        if (typeof hueRotate === 'number') {
          color = color.rotate(hueRotate);
        }
        if (typeof sat === 'number') {
            color = color.saturate(sat);
        }
        let hsla = color.hslaString();
        colorArray.push(hsla);
      }
    }
    if (colorArray.length > this.options.width) {
      this.colorArray = colorArray;
    } else {
      this.colorArray = false;
    }
    return colorArray;
  }

  /**
   * draw the art with box-shadows
   * @param {Object} reader = {input,canvas,context}
   * @return {Node} returns a div with the pixelart version as shadows
   */
  drawShadow(reader) {
    let shadow = [];
    let y = 0;
    let pixel = this.options.pixel;
    let div = document.createElement('div');
    let colorArray = this.colorArray || this.getColorArray(reader.context);

    let margin = [
      `${-1 * pixel}px`,
      `${pixel * this.options.width}px`,
      `${pixel * this.options.height}px`,
      `${-1 * pixel}px`
    ].join(' ');
    let width = `${pixel}px`;
    let height = width;

    objectAssign(div.style, {
      margin,
      height,
      width
    })

    if (this.options.shape === 'circle') {
      div.style.borderRadius = '100%';
    }

    colorArray.forEach((color, index) => {
      let width = this.options.width;
      let x = (index % width + 1);

      if (x === 1) {
        ++y;
      }

      if (color !== 'transparent') {
        shadow.push(`${x * pixel}px ${y * pixel}px 0 ${color}`)
      }
    });

    div.style.boxShadow = shadow.join(',');

    return div;
  }

  /**
   * draw the art as SVG
   * @param {Object} reader = {input,canvas,context}
   * @return {Node} returns an SVG
   */
  drawSVG(reader) {
    let colorArray = this.colorArray || this.getColorArray(reader.context);
    let y = -1;
    let xmlns = 'http://www.w3.org/2000/svg';
    let svg = document.createElementNS(xmlns, 'svg');
    let height = this.options.height;
    let width = this.options.width;
    let pixel = this.options.pixel;
    svg.setAttributeNS(null, 'viewBox', `0 0 ${[width, height].join(' ')}`);
    svg.setAttributeNS(null, 'height', height * pixel);
    svg.setAttributeNS(null, 'width', width * pixel);

    colorArray.forEach((color, index) => {
      let x = index % width;
      if (x === 0) {
        ++y;
      }

      // filter transparent pixels
      if (color !== 'transparent') {

        if (this.options.shape === 'circle') {
          let circle = document.createElementNS(xmlns, 'circle');
          circle.setAttributeNS(null, 'fill', color);
          circle.setAttributeNS(null, 'cx', (x + .5));
          circle.setAttributeNS(null, 'cy', (y + .5));
          circle.setAttributeNS(null, 'r', .5);
          svg.appendChild(circle);
        } else {
          let rect = document.createElementNS(xmlns, 'rect');
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
   * @param {Object} reader = {input,canvas,context}
   * @return {Node} returns a canvas with the pixelart version
   */
  drawCanvas(reader) {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let colorArray = this.colorArray || this.getColorArray(reader.context);
    let y = -1;
    let pixel = this.options.pixel;

    canvas.height = this.options.height * pixel;
    canvas.width = this.options.width * pixel;

    colorArray.forEach((color, index) => {
      let x = index % this.options.width;

      if (x === 0) {
        ++y;
      }

      if (color !== 'transparent') {
        context.fillStyle = color;
        if (this.options.shape === 'circle') {
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

  /**
   * get dataURL from canvas
   * @param  {Canvas} canvas 
   * @return {String} base encoded png
   */
  getDataURL(canvas) {
    return canvas.toDataURL('image/png');
  }

/**
   * uses drawCanvas 
   * @param {Object} reader = {input,canvas,context}
   * @return {Node} image with a base encoded png
   */
  drawIMG(dataURL) {
    let img = document.createElement('img');
    img.src = dataURL;
    return img;
  }

  /**
   * render the pixelart
   */
  render(target) {
    let drawing = this.draw(this.options.type);
    target.innerHTML = '';
    target.appendChild(drawing);
  }

  /**
   * get type on request
   * @param  {String} type 
   * @return {Node|Function}  if "colorArray" a function will be called with the arra and row values
   *                          row = number of pixels per row
   *                          in all other cases the unrendered element will be returned
   */
  get(type) {
    let reader = this.reader;
    if (type === 'canvas') {
      return this.drawCanvas(reader);
    } else if (type === 'svg') {
      return this.drawSVG(reader);
    } else if (type === 'img') {
      let canvas = this.drawCanvas(reader);
      let dataURL = this.getDataURL(canvas);
      return this.drawIMG(dataURL);
    } else if (type === 'boxShadow') {
      return this.drawShadow(reader);
    } else if (type === 'dataURL') {
      let canvas = this.drawCanvas(reader);
      return this.getDataURL(canvas);
    } else if (type === 'colorArray') {
      return (callback) => {
        if (typeof callback === 'function') {
          let colors = this.getColorArray(reader.context);
          callback(colors, this.options.row);
        }
      };
    } else {
      let message = `Error: ${type} is not a supported type`;
      return {
        message
      };
    }
  }

}

export default Pixel;