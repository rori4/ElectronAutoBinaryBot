$(() => {
    const app = Sammy('#container', function () {


        this.get('index.html', getWelcomePage);

        function getWelcomePage() {

        }
    });

    app.run();
});