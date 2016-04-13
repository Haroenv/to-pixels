import objectAssign from 'object-assign';

class Pixel {
  constructor(options, loadCallback) {
    let defaults = {
      pixel: 1,
      row: 32,
      shape: 'square'
    }
    this.options = {};
    objectAssign(this.options, defaults);

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
    this.loadCallback = loadCallback;
    this.init(this.options);
  }

  init(options) {
    this.reader = this.createReader();
    this.setSource(this.reader,this.options.src);
  }

  onLoad(e) {
    this.updateReader(this.reader);
  }

  loaded(callback) {
    if (typeof callback === 'function') {
    console.log('2.',this.options.height);
      callback(this);
    }
  }

  setSource(reader,src){
    reader.input.src = src;
  }

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

  updateReader(reader) {
    let height = reader.input.height = reader.input.height / reader.input.width * this.options.row;
    let width = reader.input.width = this.options.row;
    objectAssign(this.options,{height,width});
    objectAssign(reader.canvas,{height,width});

    reader.context.drawImage(reader.input, 0, 0, width, height);
    this.loadCallback(this);
  }

  getColorArray(context) {
    let imageData = context.getImageData(0,0,this.options.width,this.options.height);
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
      let rgba = `rgba(${[r, g, b, a].join(',')})`;

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

  getDataURL(canvas) {
    return canvas.toDataURL('image/png');
  }

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

  getType(type) {
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
      return (callback)=>{
        if (typeof callback === 'function') {
          let colors = this.getColorArray(reader.context);
          callback(colors,this.options.row);
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