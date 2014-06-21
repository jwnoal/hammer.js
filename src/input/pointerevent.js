var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types are defined as integers
var IE10_POINTER_TYPE_MAP = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE
};

var POINTER_ELEMENT_EVENTS = 'pointerdown pointermove pointerup pointercancel';
var POINTER_WINDOW_EVENTS = 'pointerout';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown MSPointerMove MSPointerUp MSPointerCancel';
    POINTER_WINDOW_EVENTS = 'MSPointerOut';
}

/**
 * Pointer events input
 * @constructor
 */
function PointerEventInput() {
    this.elEvents = POINTER_ELEMENT_EVENTS;
    this.winEvents = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_MAP[ev.pointerType] || ev.pointerType;

        // out of the window?
        var target = ev.relatedTarget || ev.toElement || ev.target;
        if (eventTypeNormalized == 'pointerout' && target.nodeName != 'HTML') {
            eventType = INPUT_MOVE;
        }

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || pointerType == INPUT_TYPE_TOUCH)) {
            store.push(ev);
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // get index of the event in the store
        // it not found, so the pointer hasn't been down (so it's probably a hover)
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});
