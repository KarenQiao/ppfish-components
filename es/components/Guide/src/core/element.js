"use strict";

exports.__esModule = true;
exports.default = void 0;

var _constants = require("../common/constants");

var _utils = require("../common/utils");

var _position = _interopRequireDefault(require("./position"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wrapper around DOMElements to enrich them
 * with the functionality necessary
 */
var Element =
/*#__PURE__*/
function () {
  /**
   * DOM element object
   * @param {Node|HTMLElement} node
   * @param {Object} options
   * @param {Popover} popover
   * @param {Stage} stage
   * @param {Overlay} overlay
   * @param {Window} window
   * @param {Document} document
   */
  function Element(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        node = _ref.node,
        options = _ref.options,
        popover = _ref.popover,
        stage = _ref.stage,
        overlay = _ref.overlay,
        window = _ref.window,
        document = _ref.document;

    this.node = node;
    this.document = document;
    this.window = window;
    this.options = options;
    this.overlay = overlay;
    this.popover = popover;
    this.stage = stage;
    this.animationTimeout = null;
  }
  /**
   * Checks if the current element is visible in viewport
   * @returns {boolean}
   * @public
   */


  var _proto = Element.prototype;

  _proto.isInView = function isInView() {
    var top = this.node.offsetTop;
    var left = this.node.offsetLeft;
    var width = this.node.offsetWidth;
    var height = this.node.offsetHeight;
    var el = this.node;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return top >= this.window.pageYOffset && left >= this.window.pageXOffset && top + height <= this.window.pageYOffset + this.window.innerHeight && left + width <= this.window.pageXOffset + this.window.innerWidth;
  }
  /**
   * Manually scrolls to the position of element if `scrollIntoView` fails
   * @private
   */
  ;

  _proto.scrollManually = function scrollManually() {
    var elementRect = this.node.getBoundingClientRect();
    var absoluteElementTop = elementRect.top + this.window.pageYOffset;
    var middle = absoluteElementTop - this.window.innerHeight / 2;
    this.window.scrollTo(0, middle);
  }
  /**
   * Brings the element to middle of the view port if not in view
   * @public
   */
  ;

  _proto.bringInView = function bringInView() {
    // If the node is not there or already is in view
    if (!this.node || this.isInView()) {
      return;
    } // If browser does not support scrollIntoView


    if (!this.node.scrollIntoView) {
      this.scrollManually();
      return;
    }

    try {
      this.node.scrollIntoView(this.options.scrollIntoViewOptions || {
        behavior: 'instant',
        block: 'center'
      });
    } catch (e) {
      // `block` option is not allowed in older versions of firefox, scroll manually
      this.scrollManually();
    }
  }
  /**
   * Gets the calculated position on screen, around which
   * we need to draw
   * @public
   * @return {Position}
   */
  ;

  _proto.getCalculatedPosition = function getCalculatedPosition() {
    var body = this.document.body;
    var documentElement = this.document.documentElement;
    var window = this.window;
    var scrollTop = this.window.pageYOffset || documentElement.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft;
    var elementRect = this.node.getBoundingClientRect();
    return new _position.default({
      top: elementRect.top + scrollTop,
      left: elementRect.left + scrollLeft,
      right: elementRect.left + scrollLeft + elementRect.width,
      bottom: elementRect.top + scrollTop + elementRect.height
    });
  }
  /**
   * Gets the popover for the current element if any
   * @returns {Popover|*}
   * @public
   */
  ;

  _proto.getPopover = function getPopover() {
    return this.popover;
  }
  /**
   * Is called when element is about to be deselected
   * i.e. when moving the focus to next element of closing
   * @public
   */
  ;

  _proto.onDeselected = function onDeselected(hideStage) {
    if (hideStage === void 0) {
      hideStage = false;
    }

    this.hidePopover();

    if (hideStage) {
      this.hideStage();
    }

    this.removeHighlightClasses(); // If there was any animation in progress, cancel that

    this.window.clearTimeout(this.animationTimeout);

    if (this.options.onDeselected) {
      this.options.onDeselected(this);
    }
  }
  /**
   * Checks if the given element is same as the current element
   * @param {Element} element
   * @returns {boolean}
   * @public
   */
  ;

  _proto.isSame = function isSame(element) {
    if (!element || !element.node) {
      return false;
    }

    return element.node === this.node;
  }
  /**
   * Is called when the element is about to be highlighted
   * @public
   */
  ;

  _proto.onHighlightStarted = function onHighlightStarted() {
    if (this.options.onHighlightStarted) {
      this.options.onHighlightStarted(this);
    }
  }
  /**
   * Is called when the element has been successfully highlighted
   * @public
   */
  ;

  _proto.onHighlighted = function onHighlighted() {
    var highlightedElement = this;

    if (!highlightedElement.isInView()) {
      highlightedElement.bringInView();
    } // Show the popover and stage once the item has been
    // brought in the view, this would allow us to handle
    // the cases where the container has scroll overflow


    this.showPopover();
    this.showStage();
    this.addHighlightClasses();

    if (this.options.onHighlighted) {
      this.options.onHighlighted(this);
    }
  }
  /**
   * Removes the stacking context fix classes and the highlighter classes
   * @private
   */
  ;

  _proto.removeHighlightClasses = function removeHighlightClasses() {
    this.node.classList.remove(_constants.CLASS_DRIVER_HIGHLIGHTED_ELEMENT);
    this.node.classList.remove(_constants.CLASS_POSITION_RELATIVE);
    var stackFixes = this.document.querySelectorAll("." + _constants.CLASS_FIX_STACKING_CONTEXT);

    for (var counter = 0; counter < stackFixes.length; counter++) {
      stackFixes[counter].classList.remove(_constants.CLASS_FIX_STACKING_CONTEXT);
    }
  }
  /**
   * Adds the highlight class on the current element and "fixes"
   * the parent nodes if they
   * @private
   */
  ;

  _proto.addHighlightClasses = function addHighlightClasses() {
    this.node.classList.add(_constants.CLASS_DRIVER_HIGHLIGHTED_ELEMENT); // Don't make relative if element already has some position set

    if (this.canMakeRelative()) {
      this.node.classList.add(_constants.CLASS_POSITION_RELATIVE);
    } // Check and re-define the stacking context


    this.fixStackingContext();
  }
  /**
   * Walks through the parents of the current element and fixes
   * the stacking context
   * @private
   */
  ;

  _proto.fixStackingContext = function fixStackingContext() {
    var parentNode = this.node.parentNode;

    while (parentNode) {
      if (!parentNode.tagName || parentNode.tagName.toLowerCase() === 'body') {
        break;
      }

      var zIndex = (0, _utils.getStyleProperty)(parentNode, 'z-index');
      var opacity = parseFloat((0, _utils.getStyleProperty)(parentNode, 'opacity'));
      var transform = (0, _utils.getStyleProperty)(parentNode, 'transform', true);
      var transformStyle = (0, _utils.getStyleProperty)(parentNode, 'transform-style', true);
      var transformBox = (0, _utils.getStyleProperty)(parentNode, 'transform-box', true);
      var filter = (0, _utils.getStyleProperty)(parentNode, 'filter', true);
      var perspective = (0, _utils.getStyleProperty)(parentNode, 'perspective', true); // Stacking context gets disturbed if
      // - Parent has z-index
      // - Opacity is below 0
      // - Filter/transform or perspective is applied

      if (/[0-9]+/.test(zIndex) || opacity < 1 || transform && transform !== 'none' || transformStyle && transformStyle !== 'flat' || transformBox && transformBox !== 'border-box' || filter && filter !== 'none' || perspective && perspective !== 'none') {
        parentNode.classList.add(_constants.CLASS_FIX_STACKING_CONTEXT);
      }

      parentNode = parentNode.parentNode;
    }
  }
  /**
   * Checks if we can make the current element relative or not
   * @return {boolean}
   * @private
   */
  ;

  _proto.canMakeRelative = function canMakeRelative() {
    var currentPosition = this.getStyleProperty('position');
    var avoidPositionsList = ['absolute', 'fixed', 'relative']; // Because if the element has any of these positions, making it
    // relative will break the UI

    return avoidPositionsList.indexOf(currentPosition) === -1;
  }
  /**
   * Get current element's CSS attribute value
   * @param {string} property
   * @returns string
   * @private
   */
  ;

  _proto.getStyleProperty = function getStyleProperty(property) {
    return (0, _utils.getStyleProperty)(this.node, property);
  }
  /**
   * Shows the stage behind the element
   * @public
   */
  ;

  _proto.showStage = function showStage() {
    this.stage.show(this.getCalculatedPosition());
  }
  /**
   * Gets the DOM Element behind this element
   * @returns {Node|HTMLElement|*}
   * @public
   */
  ;

  _proto.getNode = function getNode() {
    return this.node;
  }
  /**
   * Hides the stage
   * @public
   */
  ;

  _proto.hideStage = function hideStage() {
    this.stage.hide();
  }
  /**
   * Hides the popover if possible
   * @public
   */
  ;

  _proto.hidePopover = function hidePopover() {
    if (!this.popover) {
      return;
    }

    this.popover.hide();
  }
  /**
   * Shows the popover on the current element
   * @public
   */
  ;

  _proto.showPopover = function showPopover() {
    var _this = this;

    if (!this.popover) {
      return;
    }

    var showAtPosition = this.getCalculatedPosition(); // For first highlight, show it immediately because there won't be any animation

    var showAfterMs = _constants.ANIMATION_DURATION_MS; // If animation is disabled or  if it is the first display, show it immediately

    if (!this.options.animate || !this.overlay.lastHighlightedElement) {
      showAfterMs = 0;
    } // @todo remove timeout and handle with CSS


    this.animationTimeout = this.window.setTimeout(function () {
      _this.popover.show(showAtPosition);
    }, showAfterMs);
  }
  /**
   * @returns {{height: number, width: number}}
   * @public
   */
  ;

  _proto.getFullPageSize = function getFullPageSize() {
    // eslint-disable-next-line prefer-destructuring
    var body = this.document.body;
    var html = this.document.documentElement;
    return {
      height: Math.max(body.scrollHeight, body.offsetHeight, html.scrollHeight, html.offsetHeight),
      width: Math.max(body.scrollWidth, body.offsetWidth, html.scrollWidth, html.offsetWidth)
    };
  }
  /**
   * Gets the size for popover
   * @returns {{height: number, width: number}}
   * @public
   */
  ;

  _proto.getSize = function getSize() {
    return {
      height: Math.max(this.node.scrollHeight, this.node.offsetHeight),
      width: Math.max(this.node.scrollWidth, this.node.offsetWidth)
    };
  };

  return Element;
}();

exports.default = Element;