!function(d) {

    const
        miio = require( 'miio' ),
        iro = require( '@jaames/iro' ),
        shell = require( 'electron' ).shell,
        devices = miio.devices({ cacheTime: 300 }), // 5 minutes. Default is 1800 seconds (30 minutes)
        colorCard = d.querySelectorAll( ".card" ),
        deviceStatus = d.getElementById( "device-status" ),
        deviceStatusText = d.getElementById( "device-status-text" ),
        retryButton = d.getElementById( "retry" ),
        brightness = d.getElementById( "brightness" ),
        brightnessValue = d.getElementById( "brightness-value" ),
        powerCheckbox = d.getElementById( "power" ),
        openPickerElem = d.getElementById( "open-picker" ),
        colorPickerContainer = d.getElementById( "color-picker-container" ),
        colorPickerClose = d.getElementById( "color-picker-close" ),
        discoButton = d.getElementById( "disco" ),
        footerLink = d.getElementById( "footer-link" ),
        colorPicker = new iro.ColorPicker( "#color-picker", {
            width: 240,
            layout: [ { component: iro.ui.Wheel, options: {} } ]
        });

    let
        discoInterval,
        myDevice = null,
        discoStatus = false,

        /**
         * Set direct light color
         * @param color
         */
        setColor = function( color ) {

            myDevice.color( color );

        },

        /**
         * Open color picker
         */
        openPicker = function() {

            colorPickerContainer.className = "active";

        },

        /**
         * Close color picker
         * @param event
         */
        closePicker = function(event) {

            colorPickerContainer.className = "";

        },

        /**
         * Listener for on color picker changes
         * @param color
         * @param changes
         */
        onColorChange = function(color, changes) {

            myDevice.color( color.hexString );

        },

        /**
         * Set brightness by range bar input
         */
        changeBrightness = function() {

            myDevice.setBrightness(brightness.value);
            brightnessValue.innerText = "%" + brightness.value;

        },

        /**
         * Turn on-off power
         */
        switchPower = function() {

            if ( powerCheckbox.checked )
                myDevice.setPower(true);
            else
                myDevice.setPower(false);

        },

        /**
         * Disco functional
         */
        disco = function() {

            setTimeout(function() {
                myDevice.color( "#f00", 100 );
                setTimeout(function() {
                    myDevice.color( "#fff", 100 );
                    setTimeout(function() {
                        myDevice.color( "#00f", 100 );
                        setTimeout(function() {
                            myDevice.color( "#fff", 100 );
                        }, 240);
                    }, 240);
                }, 240);
            }, 240);

        },

        /**
         * Turn light to disco mode
         */
        toggleDisco = function() {

            if ( discoStatus ) {

                discoButton.className = "";
                discoStatus = false;
                clearInterval( discoInterval );

            } else {

                discoButton.className = "active";
                discoStatus = true;

                disco();

                discoInterval = setInterval(function() {
                    disco();
                }, 1000 );

            }

        },

        /**
         * Open link inside browser
         */
        openBrowser = function(e) {

            e.preventDefault();

            event.preventDefault();
            shell.openExternal( this.href );

        },

        /**
         * Initialize device to control
         */
        initDevice = function() {

            deviceStatusText.innerText = "Please wait . . .";

            devices.on( 'available', reg => {

                if(!reg.token) {
                    return;
                }

                // If device found and was light
                if ( reg.device.matches( 'type:light' ) ) {

                    deviceStatus.className = "";

                    myDevice = reg.device;

                    // Get current power status
                    myDevice.power()
                        .then(isOn => {
                            powerCheckbox.checked = isOn;
                        });

                    // Get current brightness
                    myDevice.brightness()
                        .then(b => {
                            brightnessValue.innerText = "%" + b;
                            brightness.value = b;
                        });

                    // If brightness changed by another device
                    myDevice.on('brightnessChanged', val => {
                        brightnessValue.innerText = "%" + val;
                        brightness.value = val;
                    });

                    // If power changed by another device
                    myDevice.on('powerChanged', isOn => {
                        powerCheckbox.checked = isOn;
                    });

                }

            });

            devices.on( 'unavailable', reg => {
                if ( !reg.device ) deviceStatusText.innerText = "Device not detected";
            });

            devices.on( 'error', err => {
                deviceStatusText.innerText = "Device not detected";
            });

        };

    initDevice();

    brightness.addEventListener( 'input', changeBrightness );
    powerCheckbox.addEventListener( 'change', switchPower );
    openPickerElem.addEventListener( 'click', openPicker );
    colorPickerClose.addEventListener( 'click', closePicker );
    discoButton.addEventListener( 'click', toggleDisco );
    retryButton.addEventListener( 'click', initDevice );
    footerLink.addEventListener( 'click', openBrowser );
    colorPicker.on( 'color:change', onColorChange );

    for( let i = 0; i < colorCard.length; i++ )
        colorCard[ i ].addEventListener( 'click', function() {
            setColor( this.dataset.color );
        });

}(document);