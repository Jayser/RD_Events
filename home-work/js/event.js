$event = (function () {

    var guid = 0;

    var topics = {};

    var hOP = topics.hasOwnProperty;

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
            var self = this;
            var fn = function (e) {
                handler(e);
                self.removeEvent(el, type, fn);
            };
            this.addEvent(el, type, fn);
        },

        // Pub/Sub
        subscribe: function(topic, listener) {
            // Create the topic's object if not yet created
            if(!hOP.call(topics, topic)) topics[topic] = [];

            // Add the listener to queue
            var index = topics[topic].push(listener) -1;

            // Provide handle back for removal of topic
            return {
                remove: function() {
                    delete topics[topic][index];
                }
            };
        },
        publish: function(topic, info) {
            // If the topic doesn't exist, or there's no listeners in queue, just leave
            if(!hOP.call(topics, topic)) return;

            // Cycle through topics queue, fire!
            topics[topic].forEach(function(item) {
                item(info != undefined ? info : {});
            });
        }
    }
}());
