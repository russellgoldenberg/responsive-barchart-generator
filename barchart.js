(function() {
	var _output;
	var _result;
	var _demo = 'Superette\t$8.00\nTasty Treat\t$5.00\nBig Fresh\t$9.00\nSeta\'s Cafe\t$7.50';
	var _maxWidth = 80;
	var _css = '\n.barchart-container {\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 15px;\n\tmargin: 1em 0;\n\tcolor: #1a1a1a;\n}\n.barchart-header {\n\tmargin-bottom: 0.5em;\n}\n.barchart-hed {\n\tfont-size: 1.4em;\n\tfont-weight: bold;\n}\n.barchart-subhed {\n\tfont-size: 1em;\n}\n.barchart-row-name {\n\tmargin: 0.1em 0 0.1em 0;\n\twidth: 100%;\n\tfont-size: 0.9em;\n}\n.highlight .barchart-row-name {\n\tfont-weight: bold;\n}\n.barchart-row-bar {\n\theight: 1.2em;\n\tmargin: 0 0 .4em 0;\n}\n.barchart-row-bar-inner {\n\tdisplay: inline-block;\n\theight: 100%;\n\tbackground: #edece4;\n}\n.highlight .barchart-row-bar-inner {\n\tbackground: #bf6151;\n}\n.barchart-row-value {\n\tdisplay: inline-block;\n\tvertical-align: top;\n\tline-height: 1.5;\n\tmargin-left: .5em;\n\tfont-size: .8em;\n\tfont-weight: 700;\n}\n.barchart-source-and-credit {\n\tfont-family: Georgia,"Times New Roman",Times,serif;\n\twidth: 100%;\n\toverflow: hidden;\n\tmargin-top: 1em;\n}\n.barchart-source {\n\tmargin: 0;\n\tfloat: left;\n\tletter-spacing: 0.05em;\n\tfont-weight: bold;\n\tfont-size: 0.75em;\n}\n.barchart-credit {\n\tmargin: 0;\n\tcolor: #999;\n\ttext-transform: uppercase;\n\tfloat: right;\n\ttext-align: right;\n\tfont-size: 0.65em;\n}\n@media (max-width: 640px) {\n.barchart-source-and-credit > div {\n\twidth: 100%;\n\tdisplay: block;\n\tfloat: none;\n\ttext-align: right;\n}\n}';
	var _sortBy = 'default';
	var _copy = {
		hed: 'Hed',
		subhed: 'Subhed goes here.',
		credit: 'Full Name / Globe Staff',
		sourcePre: 'DATA',
		sourcePost: 'Sources'
	};

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

		$('.preview').on('click', '.barchart-row', function() {
			$(this).toggleClass('highlight');
		});

		$('.options-sort').on('click', function(e) {
			e.preventDefault();
			$('.options-sort').removeClass('current');
			$(this).addClass('current');
			_sortBy = $(this).attr('data-sort');
			createChart();
			return false;
		})
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
				var name = cols[0].trim();
				var value = cols[1].trim();
				if(name.length > 0 && value.length > 0) {
					var num = numeral().unformat(value);

					result.data.push({
						'name': name,
						'value': value,
						'value_number': num,
						'id': 'barchart-row-' + i
					});
					result.max = Math.max(result.max, num);
					result.min = Math.min(result.min, num);	
				}
				
			} else {
				err = 'error with data format';
			}
		}

		cb(err, result);
	}

	function createChart() {
		var $container = $('<div class="barchart-container"></div>');
		var $header = $('<div class="barchart-header"></div>');
		var $hed = $('<div contenteditable="true" class="barchart-hed">' + _copy.hed + '</div>');
		var $subhed = $('<div contenteditable="true" class="barchart-subhed">' + _copy.subhed + '</div>');
		var $chart = $('<div class="barchart-content"></div>');
		var $sourceCredit = $('<div class="barchart-source-and-credit">' + _copy.credit + '</div>');
		var $source = $('<div class="barchart-source"><span contenteditable="true" class="pre-colon">' + _copy.sourcePre + '</span>: <span contenteditable="true" class="post-colon">' + _copy.sourcePost + '</span></div>');
		var $credit = $('<div contenteditable="true" class="barchart-credit">First Last / Globe Staff</div>');

		var chartContent = '';

		var sortedResults = sortResults();

		for(var i = 0; i < sortedResults.length; i++) {
			var datum = sortedResults[i];
			chartContent += '<div class="barchart-row" id="' + datum.id + '">';
			chartContent += '<div class="barchart-row-name">' + datum.name + '</div>';
			chartContent += '<div class="barchart-row-bar"><span class="barchart-row-bar-inner" style="width: ' + datum.percent + '"></span>';
			chartContent += '<span class="barchart-row-value">' + datum.value + '</span>';
			chartContent += '</div></div>';
		}

		$chart.append(chartContent);
		$sourceCredit.append($source);
		$sourceCredit.append($credit);
		$header.append($hed);
		$header.append($subhed);
		
		$container.append($header);
		$container.append($chart);
		$container.append($sourceCredit);

		$('.output').removeClass('hide');
		$('.preview').empty().append($container);
	}

	function generateCode() {
		_copy.hed = $('.barchart-hed').text();
		_copy.subhed = $('.barchart-subhed').text();
		_copy.credit = $('.barchart-credit').text();
		_copy.sourcePre = $('.barchart-source .pre-colon').text();
		_copy.sourcePost = $('.barchart-source .post-colon').text();

		var highlight = {};

		$('.barchart-row').each(function() {
			if($(this).hasClass('highlight')) {
				var id = $(this).attr('id');
				highlight[id] = true;
			}
		});

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
			hiClass = highlight[datum.id] ? ' highlight' : '';
			html += '\n\t\t<div class="barchart-row' + hiClass + '" id="' + datum.id + '">';	
			html += '\n\t\t\t<div class="barchart-row-name">' + datum.name + '</div>';
			html += '\n\t\t\t<div class="barchart-row-bar">';
			html += '\n\t\t\t\t<span class="barchart-row-bar-inner" style="width: ' + datum.percent + '"></span>';
			html += '\n\t\t\t\t<span class="barchart-row-value">' + datum.value + '</span>';
			html += '\n\t\t\t</div>'
			html += '\n\t\t</div>';
		}

		html += '\n\t</div>';
		html += '\n\t<div class="barchart-source-and-credit">';
		html += '\n\t\t<div class="barchart-source"><span class="pre-colon">' + copy.sourcePre + '</span><span class="post-colon">' + copy.sourcePost + '</span></div>';
		html += '\n\t\t<div class="barchart-credit">' + copy.credit + '</div>';
		html += '\n\t</div>';
		html += '\n</div>';

		$('.output-code').val(html);
	}

	function sortResults() {
		var dupe = _result.data.clone();
		if(_sortBy === 'asc') {
			dupe.sort(function(a,b) {
				return a['value_number'] - b['value_number'];
			});
		} else if(_sortBy === 'desc') {
			dupe.sort(function(a,b) {
				return b['value_number'] - a['value_number'];
			});
		} else if(_sortBy === 'alph') {
			dupe.sort(function(a,b) {
				if(a['name'] < b['name']) {
					return -1;
				} else if(a['name'] > b['name']) {
					return 1;
				} else {
					return 0;	
				}
			});
		}

		return dupe;
	}

	init();
})();

Array.prototype.clone = function() {
	return this.slice(0);
};