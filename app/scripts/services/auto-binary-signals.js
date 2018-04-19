let abs = (() => {
    const {ipcRenderer} = require('electron');
    let connected = false;
    let waitForConn = false;
    let signals = null;

    async function connect() {
        waitForConn = true;
        return await testTheConnectionRec();
    }

    async function testTheConnectionRec() {
        return new Promise((resolve, reject) => {
            let waitFor = $.ajax({
                type: 'POST',
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: `http://members.autobinarysignals.com/api/main`,
            }).done(function (msg) {
                try {
                    let jsonObject = JSON.parse(msg);
                } catch (e) {
                    console.log(msg);
                }
            });

            function rec() {
                $.ajax({
                    type: 'POST',
                    headers: {'X-Requested-With': 'XMLHttpRequest'},
                    url: `http://members.autobinarysignals.com/api/main`,
                }).always(function () {

                    if (waitFor.state() !== 'resolved' && waitForConn === true) rec();

                }).done(function (msg) {
                    ipcRenderer.send('absConnectedSuccessfully');
                    resolve('Connected!');
                }).fail(function (msg) {
                    if (ipcRenderer.sendSync('absWindowCheck') === true) {
                        resolve('Did close the window');
                        waitForConn = false;
                    }

                    console.log('waiting to connect')
                });
            }

            rec();
        });
    }

    async function testConnectionOnce() {
        return $.ajax({
            type: 'POST',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            url: `http://members.autobinarysignals.com/api/main`,
            statusCode: {
                404: function (response) {
                    connected = false;
                    console.log('404')
                },
                500: function (response) {
                    connected = false;
                    console.log('500')
                }
            },
            success: function (output, status, xhr) {
                if (status === 'success') {
                    console.log(status);
                    console.log(output);
                    connected = true;
                    // console.log(status);
                    // console.log(connected);
                    // ipcRenderer.send('absConnectedSuccessfully');
                } else {
                    connected = false;
                }
            }
        });
    }

    function getMainSignals() {
        if (connected) {
            $.ajax({
                type: 'POST',
                headers: {'X-Requested-With': 'XMLHttpRequest'},
                url: `http://members.autobinarysignals.com/api/main`,
                success: function (output, status, xhr) {
                    if (status === 'success') {
                        signals = JSON.parse(output);
                        // console.log(signals);
                    } else {
                        connected = false;
                    }
                }
            }).complete(function(){
                setTimeout(getMainSignals(), 100000);
            });
        }
    }

    function getConnectionStatus() {
        return connected;
    }

    function getSignals(){
        return signals;
    }

    ipcRenderer.on('absCheck', (event, arg) => {
        console.log('test') // prints "pong"
    });

    return {
        connect,
        connectedStatus: getConnectionStatus,
        getMainSignals,
        testTheConnectionRec,
        testConnectionOnce,
        signals,
        getSignals,
    };


})();