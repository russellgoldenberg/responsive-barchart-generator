(function() {
	var _output;
	var _result;
	var _demo = 'Superette\t$8.00\nTasty Treat\t$5.00\nBig Fresh\t$9.00\nSeta\'s Cafe\t$7.50';
	var _maxWidth = 80;
	var _css = '\n.barchart-container {\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 15px;\n\tmargin: 1em 0;\n}\n.barchart-header {\n\tmargin-bottom: 0.5em;\n}\n.barchart-hed {\n\tfont-size: 1.4em;\n\tfont-weight: bold;\n}\n.barchart-subhed {\n\tfont-size: 1em;\n}\n.barchart-row {\n\t\n}\n.barchart-row-name {\n\tmargin: 0.1em 0 0.1em 0;\n\twidth: 100%;\n\tfont-size: 0.8em;\n}\n.barchart-row-bar {\n\theight: 1.2em;\n\tmargin: 0 0 .4em 0;\n\tbackground: #edece4;\n}\n.barchart-row-bar-inner {\n\tdisplay: inline-block;\n\theight: 100%;\n\tbackground: #bf6151;\n}\n.barchart-row-value {\n\tdisplay: inline-block;\n\tcolor: #888;\n\tvertical-align: top;\n\tline-height: 1.5;\n\tmargin-left: .5em;\n\tfont-size: .8em;\n\tfont-weight: 700;\n}\n.barchart-source-and-credit {\n\twidth: 100%;\n\toverflow: hidden;\n\tmargin-top: 1em;\n}\n.barchart-source-and-credit > div{\n\tmargin: 0;\n\ttext-align: right;\n}\n.barchart-credit {\n\tcolor: #999;\n\ttext-transform: uppercase;\n\tfloat: right;\n\tfont-size: 0.65em;\n}\n.barchart-source {\n\tfloat: left;\n\tfont-weight: bold;\n\tfont-size: 0.8em;\n}\n@media (max-width: 640px) {\n.barchart-credit {\n\tfloat: left;\n}\n}';

	function init() {
		bindEvents();
	}

	//setup all event listeners
	function bindEvents() {
		$('.generate').on('click', function(e) {
			e.preventDefault();	
			var val = $('.input').val();
			parseInput(val, function(err, result) {
				if(err) {
					alert(err);
				} else {
					_result = result;
					setPercentWidth();
					createChart();
				}
			});
			return false;
		});

		$('.demo').on('click', function(e) {
			e.preventDefault();
			$('.input').val(_demo);
			return false;
		});

	
		$('.generate-code').on('click', function() {
			generateCode();
		});
		// var scrollTo = $('.after').offset().top - 10;
		// $('html, body').animate({
		// 	scrollTop: scrollTo
		// }, 250);
	}

	function setPercentWidth() {
		for(var i = 0; i < _result.data.length; i++) {
			var datum = _result.data[i];
			datum.percent = Math.max(0.5, (datum['value_number'] / _result.max * _maxWidth).toFixed(2)) + '%';
		}
	}

	//grab the text from the input textarea and start parsing
 	function parseInput(input, cb) {
		var lines = input.split('\n');
		if(lines.length > 1) {
			parseLines(lines, function(err, result) {
				if(err) {
					alert(err);
				} else {
					cb(null, result);
				}
			});
		} else {
			cb('no data submitted');
		}
	}

	function parseLines(lines, cb) {
		var err = false;
		var result = {
			data: [],
			max: 0,
			min: 999999999999
		};

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var cols = line.split('\t');
			if(cols.length >= 2) {
				var num = numeral().unformat(cols[1].trim());
				result.data.push({
					'name': cols[0].trim(),
					'value': cols[1].trim(),
					'value_number': num
				});
				result.max = Math.max(result.max, num);
				result.min = Math.min(result.min, num);
			} else {
				err = 'Not enough information in data';
			}
		}

		cb(err, result);
	}

	function createChart(input) {
		var $container = $('<div class="barchart-container"></div>');
		var $header = $('<div class="barchart-header"></div>');
		var $hed = $('<div contenteditable="true" class="barchart-hed">Hed</div>');
		var $subhed = $('<div contenteditable="true" class="barchart-subhed">A subhed goes here</div>');
		var $chart = $('<div class="barchart-content"></div>');
		var $sourceCredit = $('<div class="barchart-source-and-credit"></div>');
		var $credit = $('<div contenteditable="true" class="barchart-credit">First Last / Globe Staff</div>');
		var $source = $('<div contenteditable="true" class="barchart-source">Data: Source</div>');

		var chartContent = '';
		for(var i = 0; i < _result.data.length; i++) {
			var datum = _result.data[i];
			chartContent += '<div class="barchart-row" id="barchart-row-' + i + '">';
			chartContent += '<div class="barchart-row-name">' + datum.name + '</div>';
			chartContent += '<div class="barchart-row-bar"><span class="barchart-row-bar-inner" style="width: ' + datum.percent + '"></span>';
			chartContent += '<span class="barchart-row-value">' + datum.value + '</span>';
			chartContent += '</div>';
		}

		$chart.append(chartContent);
		$sourceCredit.append($credit);
		$sourceCredit.append($source);
		$header.append($hed);
		$header.append($subhed);
		
		$container.append($header);
		$container.append($chart);
		$container.append($sourceCredit);

		$('.output').removeClass('hide');
		$('.preview').empty().append($container);
	}

	function generateCode() {
		var copy = {
			hed: $('.barchart-hed').text(),
			subhed: $('.barchart-subhed').text(),
			credit: $('.barchart-credit').text(),
			source: $('.barchart-source').text()
		};

		var html = '';

		html += '<style>' + _css + '\n</style>';
		html += '\n<div class="barchart-container">';
		html += '\n\t<div class="barchart-header">';
		html += '\n\t\t<div class="barchart-hed">' + copy.hed + '</div>';
		html += '\n\t\t<div class="barchart-subhed">' + copy.subhed + '</div>';
		html += '\n\t</div>';
		html += '\n\t<div class="barchart-content">';

		for(var i = 0; i < _result.data.length; i++) {
			var datum = _result.data[i];
			html += '\n\t\t<div class="barchart-row" id="barchart-row-' + i + '">';
			html += '\n\t\t\t<div class="barchart-row-name">' + datum.name + '</div>';
			html += '\n\t\t\t<div class="barchart-row-bar">';
			html += '\n\t\t\t\t<span class="barchart-row-bar-inner" style="width: ' + datum.percent + '"></span>';
			html += '\n\t\t\t\t<span class="barchart-row-value">' + datum.value + '</span>';
			html += '\n\t\t\t</div>'
			html += '\n\t\t</div>';
		}

		html += '\n\t</div>';
		html += '\n\t<div class="barchart-source-and-credit">';
		html += '\n\t\t<div class="barchart-credit">' + copy.credit + '</div>';
		html += '\n\t\t<div class="barchart-source">' + copy.source + '</div>';
		html += '\n\t</div>';
		html += '\n</div>';

		$('.output-code').val(html);
	}

	init();
})();