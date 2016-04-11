/**
 * @class  Pixel
 * @property {Object} props options:
 *                          {
 *                            src: 'CORS ready url',
 *                            pixel: size of pixel,
 *                            scale: downscale original to width,
 *                            shape: circle or undefined (square),
 *                            type: render as SVG, canvas, png, or box-shadow
 *                          }
 * @property {Node} target render target
 */
class Pixel {
  constructor(props, target) {
    this.props = props;
    this.target = target;
    this.createReader();
    this.createInput();

    // initial values
    this.generateType = (props.type || 'canvas');
    this.downScale = (props.scale || 32);
    this.pixelSize = (props.pixel || 1);
    this.pixelShape = (props.shape || 'square');
    this.src(props.src);
  }

  /**
   * create a reader canvas
   */
  createReader() {
    this.Reader = document.createElement('canvas');
    this.reader = this.Reader.getContext('2d');
  }

  /**
   * update the reader and fire rerendering methods
   */
  updateReader() {
    // prevent until loaded
    if (!this.loaded) return;

    this.Reader.height = this.height;
    this.Reader.width = this.width;
    this.reader.drawImage(this.Input, 0, 0, this.width, this.height);

    // rerender
    this.getColorArray();
    this.draw();
  }

  /**
   * render the pixelart
   */
  draw() {
    let drawing = this.generateByType(this.generateType);
    this.target.innerHTML = '';
    this.target.appendChild(drawing);
  }

  /**
   * load event of the input image
   * @param  {Event} e load event
   */
  onLoad(e) {
    this.loaded = true;
    this.setSize();
    this.updateReader();
  }

  /**
   * create input element (img)
   * and add loader
   */
  createInput() {
    this.Input = document.createElement('img');
    this.Input.crossOrigin = 'Anonymous';
    this.Input.onload = this.onLoad.bind(this);
  }

  /**
   * public method for src changes
   * @param  {String} src CORS ready URL
   */
  src(src) {
    this.loaded = false;
    // changing the source will rerender automatically
    this.Input.src = src;
  }

  /**
   * public method for pixel size changes
   * @param  {Integer} size an Integer > 0
   */
  pixel(size) {
    this.pixelSize = size;
    this.updateReader();
  }

  /**
   * public method for output type changes
   * @param  {String} type one of:
   *                       - canvas
   *                       - svg
   *                       - img
   *                       - shadow
   */
  type(type) {
    this.generateType = type;
    this.updateReader();
  }

  /**
   * public method for scale changes
   * will create more mosaic
   * @param  {Integer} scale downscale width of the input
   */
  scale(scale) {
    this.downScale = scale;
    this.setSize();
    this.updateReader();
  }

  /**
   * public method for pixel shape changes
   * @param  {String|undefined} shape either 'circle' or undefined|null|false
   */
  shape(shape) {
    this.pixelShape = shape;
    this.updateReader();
  }

  /**
   * public method for resizing
   * combines pixel and scale
   * @param  {Integer} scale downscale width of the input
   * @param  {Integer} pixel an Integer > 0
   */
  resize(scale, pixel) {
    this.downScale = scale;
    this.pixelSize = pixel;
    this.setSize();
    this.updateReader();
  }

  /**
   * apply size to input
   */
  setSize() {
    this.height = this.Input.height / this.Input.width * this.downScale;
    this.width = this.downScale;
    this.Input.height = this.height;
    this.Input.width = this.width;
  }


  /**
   * get the color Array and generate art
   */
  getColorArray() {
    let data = [];
    let colorArray = [];

    // stop if no height is given
    // better safe than sorry
    if (this.Reader.height > 0) {
      data = this.reader.getImageData(0, 0, this.width, this.height).data;
    }
    
    // simplify the array
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let a = data[i + 3] / 255;
      let rgba = [r, g, b, a].join(',');

      // make transparent pixels obvious for later filtering
      if (a === 0) {
        colorArray.push('transparent');
      } else {
        colorArray.push(`rgba(${rgba})`);
      }
    }
    this.colorArray = colorArray;
    this.generateByType(this.generateType);
  }

  /**
   * draw the art on a canvas
   * @return {Node} returns a canvas with the pixelart version
   */
  drawCanvas() {
    let C = document.createElement('canvas');
    let $ = C.getContext('2d');
    let n = -1;

    C.height = this.height * this.pixelSize;
    C.width = this.width * this.pixelSize;
    
    for (let i = 0; i < this.colorArray.length; i++) {
      $.fillStyle = this.colorArray[i];
      let x = i % this.width;

      if (x === 0) {
        ++n;
      }

      // filter transparent pixels
      if (this.colorArray[i] !== 'transparent') {
        let y = n;

        if (this.pixelShape === 'circle') {
          $.beginPath();
          $.arc((x + .5) * this.pixelSize, (y + .5) * this.pixelSize, this.pixelSize / 2, 0, 2 * Math.PI);
          $.closePath();
          $.fill();
        } else {
          $.fillRect(x * this.pixelSize, y * this.pixelSize, this.pixelSize, this.pixelSize);
        }
      }
    }
    return C;
  }

  /**
   * draw the art on an SVG
   * @return {Node} returns an SVG with the pixelart version
   */
  drawSVG() {
    let n = -1;
    let xmlns = 'http://www.w3.org/2000/svg';
    let SVG = document.createElementNS(xmlns, 'svg');
    SVG.setAttributeNS(null, 'viewBox', `0 0 ${[this.width, this.height].join(' ')}`);
    SVG.setAttributeNS(null, 'height', this.height * this.pixelSize);
    SVG.setAttributeNS(null, 'width', this.width * this.pixelSize);

    for (let i = 0; i < this.colorArray.length; i++) {
      let x = i % this.width;
      if (x === 0) {
        ++n;
      }

      // filter transparent pixels
      if (this.colorArray[i] !== 'transparent') {
        let y = n;

        if (this.pixelShape === 'circle') {
          let circle = document.createElementNS(xmlns, 'circle');
          circle.setAttributeNS(null, 'fill', this.colorArray[i]);
          circle.setAttributeNS(null, 'cx', (x + .5));
          circle.setAttributeNS(null, 'cy', (y + .5));
          circle.setAttributeNS(null, 'r', .5);
          SVG.appendChild(circle);
        } else {
          let rect = document.createElementNS(xmlns, 'rect');
          rect.setAttributeNS(null, 'fill', this.colorArray[i]);
          rect.setAttributeNS(null, 'x', x);
          rect.setAttributeNS(null, 'y', y);
          rect.setAttributeNS(null, 'width', 1);
          rect.setAttributeNS(null, 'height', 1);
          SVG.appendChild(rect);
        }
      }
    }

    return SVG;
  }

  /**
   * draw the art with box-shadows
   * @return {Node} returns a div with the pixelart version as shadows
   */
  drawShadow() {
    let shadow = [];
    let n = 0;
    let S = document.createElement('div');

    S.style.margin = `${-1 * this.pixelSize}px ${this.width * this.pixelSize}px ${this.height * this.pixelSize}px ${-1 * this.pixelSize}px`;
    S.style.width = `${this.pixelSize}px`;
    S.style.height = `${this.pixelSize}px`;

    if (this.pixelShape === 'circle') {
      S.style.borderRadius = '100%';
    }
    
    for (let i = 0; i < this.colorArray.length; i++) {
      let x = (i % this.width + 1) * this.pixelSize;

      if (i % this.width === 0) {
        ++n;
      }

      if (this.colorArray[i] !== 'transparent') {
        let y = n * this.pixelSize;
        shadow.push(`${x}px ${y}px 0 ${this.colorArray[i]}`)
      }
    }

    S.style.boxShadow = shadow.join(',').replace(/"/g, '');

    return S;
  }

  /**
   * uses drawCanvas to return a PNG
   * @return {Node} image with a base encoded png
   */
  drawIMG() {
    let C = this.drawCanvas();
    let I = document.createElement('img');
    let dataURL = C.toDataURL('image/png');
    I.src = dataURL;

    return I;
  }

  /**
   * generate the output by type
   * @param  {String} type one of:
   *                       - canvas
   *                       - svg
   *                       - img
   *                       - shadow
   * @return {function}    return the type generator
   */
  generateByType(type) {
    if (type === 'canvas') {
      return this.drawCanvas();
    } else if (type === 'svg') {
      return this.drawSVG();
    } else if (type === 'img') {
      return this.drawIMG();
    } else if (type === 'shadow') {
      return this.drawShadow();
    }
  }
}


export default Pixel;
