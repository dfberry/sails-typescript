/**
 *
 * @param message   Message to display.
 * @param data      Contains optional configuration.
 *                      type        Type of the message: info (blue), warning (orange), error (red), success (green), none (gray).
 *                      duration    Duration in ms. [2000]
 *                      classes     CSS classes, must be separated by spaces if several.
 */
Materialize.toast = function (message, data) {
    if(!data){
        data = {};
    }

    data.type = data.type || 'info'; // Info by default.
    if(data.type == 'error'){
        data.type = 'danger'; // Automatic change to allow to use "error", which is more common.
    }else if(data.type == 'none'){
        data.type = ''; // Delete the type, we don't want any.
    }

    data.duration = data.duration || 2000;
    data.classes = data.classes || "";

    var container = document.getElementById('toast-container');

    // Create toast container if it does not exist
    if (container === null) {
        // create notification container
        var container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Select and append toast
    var newToast = createToast(message);
    container.appendChild(newToast);

    newToast.style.top = '35px';
    newToast.style.opacity = 0;

    // Animate toast in
    Vel(newToast,
        {
            "top" : "0px",
            opacity: 1
        },
        {
            duration: 300,
            easing: 'easeOutCubic',
            queue: false
        }
    );

    /**
     * Allows timer to be pause while being panned
     * @type {NodeTimer|number}
     */
    var counterInterval = setInterval (function(){

        if (newToast.parentNode === null)
            window.clearInterval(counterInterval);

        // If toast is not being dragged, decrease its time remaining
        if (!newToast.classList.contains('panning')) {
            data.duration -= 20;
        }

        if (data.duration <= 0) {
            // Animate toast out
            Vel(newToast, {"opacity": 0, marginTop: '-40px'}, { duration: 375,
                easing: 'easeOutExpo',
                queue: false,
                complete: function(){
                    // Call the optional callback
                    if(data.callback && typeof(data.callback) === "function"){
                        data.callback();
                    }

                    // Remove toast after it times out
                    this[0].parentNode.removeChild(this[0]);
                }
            });
            window.clearInterval(counterInterval);
        }
    }, 20);

    /**
     * Create a toast.
     * @param html
     * @returns {*}
     */
    function createToast(html) {
        // Create toast
        var toast = document.createElement('div');
        toast.classList.add('toast');

        // Add optional CSS classes.
        if (data.classes) {
            var classes = data.classes.split(' ');

            for (var i = 0, count = classes.length; i < count; i++) {
                toast.classList.add(classes[i]);
            }
        }

        // Add class corresponding to the type.
        if(data.type){
            toast.classList.add(data.type);
        }

        toast.innerHTML = html;

        // Bind hammer
        var hammerHandler = new Hammer(toast, {prevent_default: false});

        /**
         * On "pan" event.
         */
        hammerHandler.on('pan', function(e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // Change toast state
            if (!toast.classList.contains('panning')){
                toast.classList.add('panning');
            }

            var opacityPercent = 1-Math.abs(deltaX / activationDistance);
            if (opacityPercent < 0)
                opacityPercent = 0;

            Vel(toast, {left: deltaX, opacity: opacityPercent }, {duration: 50, queue: false, easing: 'easeOutQuad'});
        });

        /**
         * On "panend" event.
         */
        hammerHandler.on('panend', function(e) {
            var deltaX = e.deltaX;
            var activationDistance = 80;

            // If toast dragged past activation point
            if (Math.abs(deltaX) > activationDistance) {
                Vel(toast,
                    {
                        marginTop: '-40px'
                    },
                    {
                        duration: 375,
                        easing: 'easeOutExpo',
                        queue: false,
                        complete: function(){
                            if(data.callback && typeof(data.callback) === "function"){
                                data.callback();
                            }

                            toast.parentNode.removeChild(toast);
                        }
                    }
                );

            } else {
                toast.classList.remove('panning');

                // Put toast back into original position
                Vel(toast,
                    {
                        left: 0,
                        opacity: 1
                    }, {
                        duration: 300,
                        easing: 'easeOutExpo',
                        queue: false
                    }
                );
            }
        });

        return toast;
    }
};