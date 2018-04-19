const {BrowserWindow, app, session} = require('electron');
const {ipcMain} = require('electron')
const url = require('url');
const ipc = require('ipc');

let mainWindow = null;
let absWindow = null;

function boot() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: true,
        minWidth: 400,
        minHeight: 700,
        'web-preferences': {
            'direct-write': process.platform === 'win32',
            'experimental-features': true,
            'overlay-scrollbars': process.platform === 'win32'
        }
    });
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}

function absConnect() {
    absWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: true,
        minWidth: 400,
        minHeight: 700,
        'web-preferences': {
            'direct-write': process.platform === 'win32',
            'experimental-features': true,
            'overlay-scrollbars': process.platform === 'win32'
        }
    });

    absWindow.loadURL(`http://members.autobinarysignals.com/user/login`);
}

app.on('ready', boot);

ipcMain.on('connectAbs', (event, arg) => {
    if (absWindow !== null && absWindow.isDestroyed() === false) {
        absWindow.focus()
    } else {
        absConnect();
    }
});

ipcMain.on('absConnectedSuccessfully', () => {
    if (absWindow !== null && mainWindow !== null) {
        absWindow.close();
        mainWindow.focus();
        absWindow = null;
    }
});

ipcMain.on('clearSession', (event, arg) => {
    session.defaultSession.clearStorageData([], (data) => {
    });
});

ipcMain.on('absWindowCheck', (event, arg) => {
    if (absWindow !== null) {
        event.returnValue = absWindow.isDestroyed();
    } else {
        event.returnValue = false;
    }
});


