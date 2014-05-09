// jQuery Lite
export var $ = (selector, ctx=document) => [...ctx.querySelectorAll(selector)];
export var $$ = (selector, ctx=document) => ctx.querySelector(selector);
var UUID = () => 'uuid-' + Math.floor((Math.random() ^ 100 * Math.random() ^ 100) * 10000);
var events = {};
export var on = (element, event, fn) => {
  if (typeof element === 'string') element = $(element);
  events[UUID()] = { element, event, fn };
  if (element instanceof Array)
    element.forEach(addEventListener);
  else addEventListener();

  function addEventListener(el=element) {
    el.addEventListener(event, fn, false);
  }
}

export var off = (element, event, fn) => {
  if (typeof element === 'string') element = $(element);
  for (var o in events) {
    o = events[o];
    if (o.event !== event) continue;
    fn = fn || o.fn;
    if (o.element instanceof Array) {
      // TOOD: make this a bit smarter than just looping in the same order
      if (o.element.every((e, i) => e === element[i]))
        o.element.forEach(removeEventListener);
      else removeEventListener();
    }
  }
  function removeEventListener(el=element) {
    el.removeEventListener(event, fn);
  }
}

export var delegateTo = function delegateTo(selector, fn) {
  return function(e) {
    var ctx;
    if ((ctx = isChild(e.target, 'button', this))) fn.apply(ctx, arguments);
  };
};

var isChild = (node, parentSelector, stopAtNode=document.body) => {
  while (!node.matches(parentSelector)) {
    if (node === stopAtNode) return false;
    node = node.parentNode;
  }
  return node;
}

export var prependTo = (ctx, el) => {
  if (typeof ctx === 'string') ctx = $(ctx);
  if (Array.isArray(ctx)) ctx.forEach((c) => c.insertBefore(el, c.firstChild));
  else ctx.insertBefore(el, ctx.firstChild);
  return ctx;
}

