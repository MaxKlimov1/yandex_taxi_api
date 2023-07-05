const fastify = require('fastify')();
require('dotenv').config();
fastify.register(require('./plugins/requestYandexApi'));

fastify.register(require('./routes/taxiApi'));

fastify.get('/', async function(){
    return 'Hello Roxe Taxi'
});

fastify.listen({port: process.env.SERVER_PORT}, (err, adress) => {
    if(err) {
        console.log(err);
        process.exit(1);
    }
    else {
        console.log('Server is started on port #' + process.env.SERVER_PORT);
    }
});