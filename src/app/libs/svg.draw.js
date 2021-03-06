import { SVG, Element, extend, on, off } from "@svgdotjs/svg.js";

class PaintHandler {

  plugins = {
    'rect': {
      init(e) {
        const p = this.startPoint;
        this.el.attr({ x: p.x, y: p.y, height: 0, width: 0 });
      },
      calc(e) {
        let rect = {
          x: this.startPoint.x,
          y: this.startPoint.y
        }, p = this.transformPoint(e.clientX, e.clientY);
        rect.width = p.x - rect.x;
        rect.height = p.y - rect.y;
        // Snap the params to the grid we specified
        this.snapToGrid(rect);

        // When width is less than zero, we have to draw to the left
        // which means we have to move the start-point to the left
        if (rect.width < 0) {
          rect.x = rect.x + rect.width;
          rect.width = -rect.width;
        }

        // ...same with height
        if (rect.height < 0) {
          rect.y = rect.y + rect.height;
          rect.height = -rect.height;
        }

        // draw the element
        this.el.attr(rect);
        // console.log(rect, this.el);
      }
    }
  };
  constructor(el, event, options) {
    this.el = el;
    el.remember('_paintHandler', this);

    let _this = this;
    let plugin = this.getPlugin();

    this.parent = el.parent(SVG.Nested) || el.parent(SVG.Doc);
    this.p = this.parent.node.createSVGPoint(); // Helping point for coord transformation
    this.m = null;  // transformation matrix. We get it when drawing starts
    this.startPoint = null;
    this.lastUpdateCall = null;
    this.options = {};
    this.set = SVG;

    // Merge options and defaults
    for (let i in this.el.draw.defaults) {
      this.options[i] = this.el.draw.defaults[i];
      if (typeof options[i] !== 'undefined') {
        this.options[i] = options[i];
      }
    }

    if (plugin.point) {
      plugin['pointPlugin'] = plugin.point;
      delete plugin.point;
    }

    // Import all methods from plugin into object
    for (let i in plugin) {
      this[i] = plugin[i];
    }

    // When we got an event, we use this for start, otherwise we use the click-event as default
    if (!event) {
      this.parent.on('click.draw', function (e) {
        _this.start(e);
      });

    }
  }

  transformPoint(x, y) {
    this.p.x = x - (this.offset.x - window.pageXOffset);
    this.p.y = y - (this.offset.y - window.pageYOffset);
    return this.p.matrixTransform(this.m);
  }

  start(event) {

    const _this = this;

    // get the current transform matrix from screen to element (offset corrected)
    this.m = this.el.node.getScreenCTM().inverse();

    // we save the current scrolling-offset here
    this.offset = { x: window.pageXOffset, y: window.pageYOffset };

    // we want to snap in screen-coords, so we have to scale the snapToGrid accordingly
    this.options.snapToGrid *= Math.sqrt(this.m.a * this.m.a + this.m.b * this.m.b)

    // save the startpoint
    this.startPoint = this.snapToGrid(this.transformPoint(event.clientX, event.clientY));

    // the plugin may do some initial work
    if (this.init) { this.init(event); }

    // Fire our `drawstart`-event. We send the offset-corrected cursor-position along
    this.el.fire('drawstart', { event: event, p: this.p, m: this.m });

    // We need to bind the update-function to the mousemove event to keep track of the cursor
    on(window, 'mousemove.draw', function (e) {
      _this.update(e);
    });

    // Every consecutive call to start should map to point now
    this.start = this.point;
  }

  // This function draws a point if the element is a polyline or polygon
  // Otherwise it will just stop drawing the shape cause we are done
  point(event) {
    if (this.point != this.start) return this.start(event);

    if (this.pointPlugin) {
      return this.pointPlugin(event);
    }

    // If this function is not overwritten we just call stop
    this.stop(event);
  };


  // The stop-function does the cleanup work
  stop(event) {
    if (event) {
      // console.log('stop after update')
      this.update(event);
    }

    // Plugin may want to clean something
    // if (this.clean) { this.clean(); }

    // Unbind from all events
    off(window, 'mousemove.draw');
    this.parent.off('click.draw');

    // remove Refernce to PaintHandler
    this.el.forget('_paintHandler');

    // overwrite draw-function since we never need it again for this element
    this.el.draw = function () { };
    // console.log(this.el);
    // Fire the `drawstop`-event
    this.el.fire('drawstop');
  }

  // Updates the element while moving the cursor
  update(event) {
    if (!event && this.lastUpdateCall) {
      event = this.lastUpdateCall;
    }

    this.lastUpdateCall = event;

    // Get the current transform matrix
    // it could have been changed since the start or the last update call
    this.m = this.el.node.getScreenCTM().inverse();

    // Call the calc-function which calculates the new position and size
    this.calc(event);

    // Fire the `drawupdate`-event
    this.el.fire('drawupdate', { event: event, p: this.p, m: this.m });
    // console.log('drawupdate', { event: event, p: this.p, m: this.m });
  }

  // Called from outside. Finishs a poly-element
  done() {
    this.calc();
    this.stop();

    this.el.fire('drawdone');
  }

  // Called from outside. Cancels a poly-element
  cancel() {
    // stop drawing and remove the element
    this.stop();
    this.el.remove();

    this.el.fire('drawcancel');
  }

  // Calculate the corrected position when using `snapToGrid`
  snapToGrid(draw) {

    var temp = null;

    // An array was given. Loop through every element
    if (draw.length) {
      temp = [draw[0] % this.options.snapToGrid, draw[1] % this.options.snapToGrid];
      draw[0] -= temp[0] < this.options.snapToGrid / 2 ? temp[0] : temp[0] - this.options.snapToGrid;
      draw[1] -= temp[1] < this.options.snapToGrid / 2 ? temp[1] : temp[1] - this.options.snapToGrid;
      return draw;
    }

    // Properties of element were given. Snap them all
    for (let i in draw) {
      temp = draw[i] % this.options.snapToGrid;
      draw[i] -= (temp < this.options.snapToGrid / 2 ? temp : temp - this.options.snapToGrid) + (temp < 0 ? this.options.snapToGrid : 0);
    }

    return draw;
  }

  param(key, value) {
    this.options[key] = value === null ? this.el.draw.defaults[key] : value;
    this.update();
  }

  // Returns the plugin
  getPlugin() {
    return this.plugins[this.el.type];
  }
}

extend(Element, {
  // Draw element with mouse
  draw(event, options, value) {

    // sort the parameters
    if (!(event instanceof Event || typeof event === 'string')) {
      options = event;
      event = null;
    }

    // get the old Handler or create a new one from event and options
    const paintHandler = this.remember('_paintHandler') || new PaintHandler(this, event, options || {});

    // When we got an event we have to start/continue drawing
    if (event instanceof Event) {
      paintHandler['start'](event);
    }

    // if event is located in our PaintHandler we handle it as method
    if (paintHandler[event]) {
      paintHandler[event](options, value);
    }

    return this;
  }
});

// Default values. Can be changed for the whole project if needed
Element.prototype.draw.defaults = {
  snapToGrid: 1        // Snaps to a grid of `snapToGrid` px
}

Element.prototype.draw.extend = function (name, obj) {

  let plugins = {};
  if (typeof name === 'string') {
    plugins[name] = obj;
  } else {
    plugins = name;
  }

  for (let shapes in plugins) {
    let shapesArr = shapes.trim().split(/\s+/);

    for (let i in shapesArr) {
      Element.prototype.draw.plugins[shapesArr[i]] = plugins[shapes];
    }
  }

};
