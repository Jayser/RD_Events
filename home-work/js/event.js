$event = (function () {

    var guid = 0;

    function fixEvent(e) {
        e = e || window.event;

        e.preventDefault = e.preventDefault || function(){this.returnValue = false};
        e.stopPropagation = e.stopPropagaton || function(){this.cancelBubble = true};

        if (!e.target) {
            e.target = e.srcElement
        }

        if (!e.relatedTarget && e.fromElement) {
            e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
        }

        if (e.pageX == null && e.clientX != null) {
            var html = document.documentElement, body = document.body;
            e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
            e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
        }

        if (!e.keyCode) {
            e.keyCode = e.which || e.charCode;
        }

        return e;
    }

    function commonHandle(e) {
        e = fixEvent(e);

        var errors = [];
        var handlers = this.events[e.type];

        for (var index in handlers) {
            try {
                var ret = handlers[index].call(this, e);
                if (ret === false) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if (e.stopNow) break;
            } catch (e) {
                errors.push(e);
            }

            if (errors.length == 1) {
                throw errors[0];
            } else if (errors.length > 1) {
                var e = new Error("Multiple errors thrown in handling 'sig', see errors property");
                e.errors = errors;
                throw e;
            }
        }
    }

    return {
        addEvent: function (el, type, handler) {

            if (!handler._guid) {
                handler._guid = ++guid;
            }

            if (!el.events) {
                el.events = {};
                el.handle = function (e) {
                    return commonHandle.call(el, e);
                }
            }

            if (!el.events[type]) {
                el.events[type] = {};

                if (el.addEventListener) {
                    el.addEventListener(type, el.handle, false);
                } else if (el.attachEvent) {
                    el.attachEvent("on" + type, el.handle);
                }
            }

            el.events[type][handler._guid] = handler;
        },
        delegate: function (el, type, selector, handler) {
            this.addEvent(el, type, selector, function (e) {
                var target = e.target;

                while (target != el) {
                    if (target.tagName == selector.tagName) {
                        handler(target);
                        return;
                    }
                    target = target.parentNode;
                }
            });
        },
        removeEvent: function (el, type, handler) {
            var handlers = el.events && el.events[type];
            if (!handlers) return;

            if (!handler) {
                for (var handle in handlers) {
                    delete el.events[type][handle];
                }
                return;
            }

            delete handlers[handler._guid];

            for (var any in handlers) return;

            if (el.removeEventListener)
                el.removeEventListener(type, el.handle, false);
            else if (el.detachEvent)
                el.detachEvent("on" + type, el.handle);

            delete el.events[type];

            for (var any in el.events) return;

            try {
                delete el.handle;
                delete el.events;
            } catch (e) { // IE
                el.removeAttribute("handle");
                el.removeAttribute("events");
            }
        },
        once: function (el, type, handler) {

        },
        trigger: function (el, event) {

        },

        // Mediator
        publish: function (type) {

        },
        subscribe: function (type, handler) {

        },
        remove: function (type, handler) {

        }
    }
}());
