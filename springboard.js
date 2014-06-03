// module
var express = require('express')
  , http = require('http')
  , path = require('path')
  , url = require('url')
  , fs = require('fs')
  , swig = require('swig')
  , stylus = require('stylus')
  , csso = require('csso-stylus')
  , autoprefixer = require('autoprefixer-stylus')
  , pack = require('./package.json');

var app = express();




app.configure(function () {
  // общие настройки
  app.set('port', process.env.PORT || 3333);
  app.set('root', __dirname);

  // добавляем мидлвеары
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.errorHandler());
  app.use(app.router);

  /**
   * настройки свига
   * */
    // переопределяем стандартный рендер
  app.engine('html', swig.renderFile);

  app.set('view engine', 'html');
  app.set('views', __dirname + '/html');

  // отключаем кеш свига
  swig.setDefaults({cache: false});

  /**
   * настройки стайлуса
   * */
  app.use(stylus.middleware({
    src: __dirname + '/css',
    dest: __dirname + '/public',
    compile: function (str, path) {
      return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .set('force', true)
        .use(autoprefixer(['last 2 version', '> 1%', 'ie 8', 'ie 7']))
//        .use(csso())
        .define('url64', stylus.url());
    }
  }));

  app.use("/img", express.static(path.join(__dirname, 'img')));
  app.use("/font", express.static(path.join(__dirname, 'font')));
  app.use("/js", express.static(path.join(__dirname, 'js')));

  // выводим в паблик папочку
  app.use(express.static(path.join(__dirname, 'css/vendor')));
  app.use(express.static(path.join(__dirname, 'public')));



  /**
   * роутеры
   * */

  // блоки и страницы
  app.get('/spb/:module/:name', function (req, res) {
    var module = req.route.params.module,
        name = req.route.params.name;

    if (module !== 'page' && module !== 'block') res.end(404);

    res.render(module, {
      name: pack.name,
      title: name,
      inside: fs.readFileSync('./html/' + module + '/' + name, 'utf8')
    });
  });

  // главная
  app.get('/', function (req, res) {
    res.render('dashboard', {
      name: pack.name,
      title: 'Dashboard',
      blocks: fs.readdirSync('./html/block'),
      pages: fs.readdirSync('./html/page')
    });
  });

});


http.createServer(app).listen(app.get('port'), function () {
  console.log('use localhost:' + app.get('port') + ' and brain!');
});