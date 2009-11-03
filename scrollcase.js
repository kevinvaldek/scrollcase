/**
*   == Script - scrollcase.js
*
*   == Author   
*       Kevin Valdek (CannedApps)  - created 2009-11-01
*/

var Scrollcase = new Class({

  Implements: [Options, Events],
    
  options: {
    onArrowClick: function(moveRight) {
      var oneSlide = (100 / (this.panes.length - 1)).toInt();
      this.handleFx.set(this.handleFx.step + ((moveRight ? 1 : -1) * oneSlide));
    },
    containerClass: 'scrollcase_container',
    paneClass: 'pane',
    slideTrackClass: 'scrollcase_slide_track',
    slideTrackArrowClass: 'scrollcase_arrow_',
    slideHandleClass: 'handle',
    labelClass: 'label',
    slideTrackEdgeClass: 'edge',
    paneSliderTransition: 'sine:out',
    paneSliderDuration: 300
  },

  /**
   * +paneSlider+ must have the +width+ style specified.
   */
  initialize: function(paneSlider, options) {
    this.setOptions(options);
    this.paneSlider = document.id(paneSlider);
    this.panes = this.paneSlider.getChildren();

    this.setStyles();
    this.container = this.buildContainer();
    this.injectSlideTrack();
    this.injectLabels();
  },

  buildContainer: function() {
    return new Element('div', {
      'class': this.options.containerClass,
      styles: {
        width: this.onePageWidth,
        height: this.panes[0].getStyle('height')
      }
    }).inject(this.paneSlider, 'before').grab(this.paneSlider);
  },

  setStyles: function() {
    this.paneSliderWidth = this.paneSlider.getStyle('width').toInt();
    this.onePaneWidth = this.paneSliderWidth / this.panes.length;

    this.panes.each(function(pane) {
      pane.addClass(this.options.paneClass).setStyle('width', this.onePaneWidth);
    }, this);
  },

  injectSlideTrack: function() {
    this.slideTrack = new Element('div', { 'class': this.options.slideTrackClass }).inject(this.container, 'after');

    var injectSideElement = function(className, injectArg) {
      return new Element('div', {
        'class': className
      }).inject(this.slideTrack, injectArg);
    }.bind(this);

    var injectArrow = function(side) { return injectSideElement(this.options.slideTrackArrowClass + side, 'before') }.bind(this);
    var injectEdge = function(side) { injectSideElement(this.options.slideTrackEdgeClass + ' ' + side, 'top') }.bind(this);
    ['left', 'right'].each(function(side) {
      this[side + 'Arrow'] = injectArrow(side);
      injectEdge(side);
    }, this);

    this.injectHandle();
    this.attachPaneSliderEvents();
  },

  injectHandle: function() {
    this.handle = new Element('div', { 'class': this.options.slideHandleClass }).inject(this.slideTrack);
    this.attachHandleEvents();
  },

  attachHandleEvents: function() {
    this.handleFx = new Slider(this.slideTrack, this.handle, {
      steps: 100, // explicit, as it defaults to 100. need 100 to use percentage
      onChange: this.onHandleChange.bind(this),
      onTick: function(position){
        this.knob.tween(this.property, position);
      }
    });

    this.setTween(this.handleFx.knob);
  },

  attachPaneSliderEvents: function() {
    this.setTween(this.paneSlider);

    var moveEvent = function(side, moveRight) {
      this[side + 'Arrow'].addEvent('click', function() {
        this.fireEvent('arrowClick', moveRight);
      }.bind(this));
    }.bind(this);

    moveEvent('left', false);
    moveEvent('right', true);
  },

  setTween: function(element) {
    element.set('tween', {
      transition: this.options.paneSliderTransition,
      duration: this.options.paneSliderDuration
    });
  },

  onHandleChange: function() {
    var paneSliderOffset = (this.handleFx.step / 100) * (this.paneSliderWidth - this.onePaneWidth);
    this.paneSlider.tween('left', -paneSliderOffset);
  },

  injectLabels: function() {
    this.panes.each(function(pane, index) {
      var text;
      if(text = pane.get('rel')) {
        new Element('span', {
          'class': this.options.labelClass,
          rel: index,
          text: text,
          events: {
            selectstart: function() {
              return false;
            },
            click: function(e) {
              e.stopPropagation();
              var moves = 100 / (this.panes.length - 1);
              this.handleFx.set(moves * index);
            }.bind(this)
          }
        }).inject(this.slideTrack, 'top');
      }
    }, this);
  }

});
