function easySlider(cfg) {

    // Constants
    var UNIT = 'px';
    var TO_BACK = true;

    // Default params
    cfg = cfg || {};
    var animationDuration = cfg.animationDuration || '.5s';
    var mouseOffsetToMove = cfg.mouseOffsetToMove || 50;
    var animationAfter = cfg.animationAfter || 2000;
    var moduleId = cfg.moduleId || 'easySlider';
    var autoScroll = cfg.autoScroll === 'false' ? false : true;

    // Selectors
    var root = document.getElementById(moduleId);

    // Calculations
    var itemWidth = root.clientWidth;
    var sliderWidth = root.children.length * itemWidth;
    var sliderLimit = (sliderWidth - (2 * itemWidth)) * -1;

    // Flags
    var isAnimationFinished = true;
    var isOverSlider = false;

    // Other
    var animationIndex, mouseOffsetStartPoint;

    // Calculations Infinity slider
    function resetSlider(toDefault) {
        var offsetLeft = parseInt(root.style.left, 10);
        var isResetToStart = (offsetLeft === ((sliderWidth - itemWidth) * -1));
        var isResetToEnd = offsetLeft === 0;

        if (toDefault || (isResetToStart || isResetToEnd)) {
            root.style.transitionDuration = '';
            root.style.width = sliderWidth + UNIT;

            if (toDefault || isResetToStart) {
                root.style.left = (itemWidth * -1) + UNIT;
            } else if (isResetToEnd) {
                root.style.left = sliderLimit + UNIT;
            }
        }
    }

    function runSlide() {
        animationIndex = setTimeout(offsetSlide, animationAfter);
    }

    function init() {

        resetSlider(true); // Set default data to slider

        /**
         * if autoScroll = true
         * run slider
         */
        if (autoScroll) {
            runSlide();
        }

        // Add handlers
        addListeners();
    }

    function addListeners() {
        root.addEventListener('transitionend', function () {

            /*
             * reset slider if it's need
             * if it's end begin from start
             * if it's start begin from end
             * */
            resetSlider();

            /*
             * isOverSlider = true
             * mouse over slider
             *
             * isAnimationFinished = false
             * animation in process
             * */
            if (isAnimationFinished && !isOverSlider) {
                runSlide();
            }

            // define that animation finished
            isAnimationFinished = true;
        });
        root.addEventListener('mousemove', function (e) {
            e.preventDefault();
            // Stop auto scroll
            if (autoScroll) {
                clearTimeout(animationIndex);
                isOverSlider = true;
            }
        });
        root.addEventListener('mouseout', function (e) {
            e.preventDefault();
            // Start auto scroll
            if (autoScroll) {
                isOverSlider = false;
                runSlide();
            }
        });
        root.addEventListener('mousedown', function (e) {
            e.preventDefault();
            mouseOffsetStartPoint = e.clientX;
        });
        root.addEventListener('mouseup', function (e) {
            e.preventDefault();
            var mouseOffset = mouseOffsetStartPoint - e.clientX;

            // start new animation only when previous finished
            if (isAnimationFinished) {

                // Which direction to move
                if (mouseOffset >= mouseOffsetToMove) {
                    isAnimationFinished = false;
                    offsetSlide();
                } else if (mouseOffset <= -mouseOffsetToMove) {
                    isAnimationFinished = false;
                    offsetSlide(TO_BACK);
                }
            }
        });
    }

    // Change offset
    function offsetSlide(isToBack) {
        var previewsOffset = parseInt(root.style.left, 10);

        // Move right
        var newOffset = (+previewsOffset) - itemWidth;

        // Move left
        if (isToBack) {
            newOffset = (+previewsOffset) + itemWidth;
        }

        // Move
        if (previewsOffset >= sliderLimit) {
            root.style.transitionDuration = animationDuration;
            root.style.left = newOffset + UNIT;
        }
    }

    init();
}

easySlider();
easySlider({
    autoScroll: 'false',
    moduleId: 'easySlider2'
});