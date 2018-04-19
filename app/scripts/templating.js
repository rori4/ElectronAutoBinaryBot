$(() => {
    const app = Sammy('#app', function () {
        const {ipcRenderer} = require('electron');
        this.use('Handlebars', 'hbs');

        this.get('index.html', getWelcomePage);
        this.get('#/home', getWelcomePage);

        this.post('#/connectAbs', (ctx) => {
            ipcRenderer.send('connectAbs');
            console.log(abs.connect());
            abs.connect(ctx).then(() => {
                ctx.redirect('#/home');
            });
        });

        this.post('#/startTrading', (ctx) => {
            abs.getMainSignals();
        });

        this.post('#/disconnectAbs', (ctx) => {
            ipcRenderer.send('clearSession');
            ctx.redirect('#/home');
        });

        function getWelcomePage(ctx) {
            abs.testConnectionOnce()
                .then(() => {
                    loadSignInPage(ctx);
                })
                .catch(() => {
                    loadSignInPage(ctx);
            });
        }

        function loadSignInPage(ctx) {
            console.log('Status: ' + abs.connectedStatus());
            ctx.absConnected = abs.connectedStatus();
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                sidebar: './templates/common/sidebar.hbs',
                forms: './templates/accountForms.hbs',
            }).then(function () {
                this.partial('./templates/dashboard.hbs');
            });
        }

    });
    app.run()
});
