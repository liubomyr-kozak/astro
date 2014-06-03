var fs = require('fs-extra')
		, path = require('path')
		, swig = require('swig')
		, stylus = require('stylus')
		, csso = require('csso-stylus')
		, _ = require('underscore')
		, autoprefixer = require('autoprefixer-stylus')
		, pack = require('./package.json');


function joinUrl(url){
	return path.join(__dirname, url);
}

var pages = fs.readdirSync(joinUrl('./html/page'));

// пересоздаем папочку, для чистоты
fs.removeSync(joinUrl('./public'));
fs.mkdirSync(joinUrl('./public'));

// компилим дашбоард
(function(){
	var html = swig.renderFile(joinUrl('./html/dashboard.build.html'), {
		name: pack.name,
		title: 'Список страниц',
		pages: pages
	});

	fs.writeFile(joinUrl('./public/index.html'), html, function(err){
		if(err) throw err;
		console.log('html - dashboard - successful');
	});
})();

// компилим страницы
(function(){
	_(pages).each(function(name){
		var html = swig.renderFile(joinUrl('./html/page.html'), {
			name: pack.name,
			title: name,
			inside: fs.readFileSync(joinUrl('./html/page/' + name), 'utf8')
		});

		fs.writeFile(joinUrl('./public/' + name), html, function(err){
			if(err) throw err;
			console.log('html - ' + name + ' - successful');
		});
	});
})();

// компилим iso
(function(){
	_({'./html/iso': './public/spb/iso'}).each(function(dest, src){
		fs.copy(joinUrl(src), joinUrl(dest), function (err) {
			if (err) {
				console.error(err);
			} else {
				console.log('copy ' + src + ' success!');
			}
		});
	});
})();

// компилим цсс
(function(str, path){
	var css = stylus(str)
			.set('filename', joinUrl('./css/start.styl'))
			.set('compress', true)
			.set('force', true)
			.use(autoprefixer(['last 2 version', '> 1%', 'ie 8', 'ie 7']))
			.use(csso())
			.define('url64', stylus.url()).render();

	fs.writeFile(joinUrl('./public/start.css'), css, function(err){
		if(err) throw err;
		console.log('css compile successful');
	});
})(fs.readFileSync(joinUrl('./css/start.styl'), 'utf-8'));

// скопировать джс/картинки/фонты
(function(){
	_({
		'./js': './public/js',
		'./img': './public/img',
//    './font': './public/font',
		'./css/vendor': './public'
	}).each(function(dest, src){
				fs.copy(joinUrl(src), joinUrl(dest), function (err) {
					if (err) {
						console.error(err);
					} else {
						console.log('copy ' + src + ' success!');
					}
				});
			});
})();