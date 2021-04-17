const express = require('express');
const consolidate = require('consolidate');
const mustache_ex = require('mustache-express');
const path = require('path');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const morgan = require('morgan');
const body_parser = require('body-parser');
const busboy_body_parser = require('busboy-body-parser');
//const expressSwaggerGenerator = require('express-swagger-generator');
//const expressSwagger = expressSwaggerGenerator(app);
const mstRouter = require('./routes/route_mst');
const { mustache } = require('consolidate');

/*const options = {
    swaggerDefinition: {
        info: {
            description: 'Description',
            title: 'Title',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        produces: ["application/json"],
    },
    basedir: __dirname,
    files: ['./routes//*.js', './models//*.js'],
};*/
//expressSwagger(options);


app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json());
app.use(busboy_body_parser());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).send({ mess: "Bad request" });
        return;
    }

    next();
});



const viewsDir = path.join(__dirname, 'views');
app.engine("mst", mustache_ex(path.join(viewsDir, "partials")));
app.set('views', viewsDir);
app.set('view engine', 'mst');
// usage
app.get('/', function(req, res) {
    res.render('index', { index_current: 'current', home_link: 'disabled_link' });
});


app.get('/about', function(req, res) {
    res.render('about', { about_current: 'current', about_link: 'disabled_link' });
});


app.use('', mstRouter);
app.use(express.static("./public"));
app.use(express.static("./data"));
app.use(morgan('dev'));



app.listen(process.env.PORT || 3000, async() => {
    try {
        console.log(`Server ready`);
        const client = await mongoose.connect(process.env.DB_CONNECTION_STRING || process.env.DB_CONNECTION_STRING_Test, connectOptions);
        console.log('Mongo database connected');
    } catch (err) {
        console.log(err);
        console.log('Mongo database NOT connected');
    }
});