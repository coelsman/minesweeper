if ("undefined" == typeof jQuery)
	throw new Error("Minesweeper requires jQuery");

!function ($) {
	var Statistics = function (options) {
		this.timer = 0;
		this.remain = 0;

		$(window).on('blur', $.proxy(this.pauseTimer, this));
		$(window).on('focus', $.proxy(this.startTimer, this));
	};

	Statistics.prototype = {
		generate: function (ele) {
			ele.prepend($('<div>', {
				class: 'ms-stats clearfix'
			}));
			this.ele = ele.find('.ms-stats');
			this.ele.append($('<div>', {
				class: 'ms-timer'
			})).append($('<div>', {
				class: 'ms-remain'
			}));
			this.timerElement = this.ele.find('.ms-timer');
			this.remainElement = this.ele.find('.ms-remain').html(this.remain);
		},

		startTimer: function () {
			var obj = this;
			this.timerInterval = setInterval(function () {
				obj.updateTimerValue(obj.timer + 1);
			}, 1000);
		},

		pauseTimer: function () {
			if ('undefined' != typeof this.timerInterval)
				clearInterval(this.timerInterval);
		},

		stopTimer: function () {
			if ('undefined' != typeof this.timerInterval) {
				this.updateTimerValue(0);
				clearInterval(this.timerInterval);
			}
		},

		updateTimerValue: function (value) {
			this.timer = value;
			this.timerElement.html(this.timer);
		},

		updateRemainValue: function (value) {
			this.remain = value;
			this.remainElement.html(this.remain);
		}

	};

	var Minesweeper = function (ele, options) {
		this.mines = 99;
		this.sizeX = 30;
		this.sizeY = 16;
		this.digitColor = ['', '#22E', '#292', '#E22', '#3F0092', '#945200', '#006494', '#222'];

		this.updateOptions(options);
		this.generate(ele);

		ele.on('click', '.ms-item', $.proxy(this.select, this));
		ele.on('mouseup', '.ms-item', $.proxy(this.mouseup, this));
		ele.on('mousedown', '.ms-item', $.proxy(this.mousedown, this));

		return this;
	};

	Minesweeper.prototype = {
		updateOptions: function (opts) {
			this.statistics = new Statistics();

			if (typeof opts == 'object') {
				this.mines             = (opts.mines) ? parseInt(opts.mines) : this.mines;
				this.statistics.remain = (opts.mines) ? parseInt(opts.mines) : this.mines;
				this.sizeX             = (opts.sizeX) ? parseInt(opts.sizeX) : this.sizeX;
				this.sizeY             = (opts.sizeY) ? parseInt(opts.sizeY) : this.sizeY;
			}
		},

		generate: function (ele) {
			ele.append($('<div>', {
				class: 'ms-mine classic',
				oncontextmenu: 'return false;'
			}));

			this.ele = ele.find('.ms-mine');
			this.statistics.generate(this.ele);
			this.drawField();
			this.randomMines();
			this.calculateIndexes();
			this.statistics.startTimer();
		},

		drawField: function () {
			this.values = new Array(this.sizeX);

			for (var i = 0; i < this.sizeY; i++) {
				this.values[i] = new Array(this.sizeY);

				for (var j = 0; j < this.sizeX; j++) {
					this.ele.append($('<div>', {
						class: 'ms-item',
						'ms-x': j,
						'ms-y': i
					}));
				}

				this.ele.append($('<div>', {
					class: 'clearfix'
				}));
			}
		},

		randomMines: function () {
			var i = 0, _x, _y;

			while (i < this.mines) {
				_x = Math.floor(Math.random() * this.sizeX);
				_y = Math.floor(Math.random() * this.sizeY);

				if ('undefined' == typeof this.values[_y][_x]) {
					this.values[_y][_x] = false;
					i++;
				}
			}
		},

		calculateIndexes: function () {
			for (var i = 0; i < this.sizeY; i++) {
				for (var j = 0; j < this.sizeX; j++) {

					if ('boolean' != typeof this.values[i][j])
						this.values[i][j] = this.countMineAround(j, i);

					// if ('boolean' == typeof this.values[i][j]) {
					// 	this.ele.find('.ms-item[ms-x="'+j+'"][ms-y="'+i+'"]').addClass('ms-bomb').html('B');
					// } else
					// 	this.ele.find('.ms-item[ms-x="'+j+'"][ms-y="'+i+'"]').html(this.countMineAround(j, i));

				}
			}
		},

		countMineAround: function (x, y) {
			var _mx, _my, _nx, _ny, c = 0, type;

			_mx = (x > 1) ? x - 1 : 0;
			_my = (y > 1) ? y - 1 : 0;
			_nx = (x < this.sizeX - 1) ? x + 1 : this.sizeX - 1;
			_ny = (y < this.sizeY - 1) ? y + 1 : this.sizeY - 1;

			for (var i = _my; i <= _ny; i++) {
				for (var j = _mx; j <= _nx; j++) {
					type = typeof this.values[i][j];
					if (type == 'boolean') c++;
				}
			}

			return c;
		},

		select: function (e) {
			if (!$(e.target).hasClass('flag')) {
				e = $(e.target).addClass('active');
				var _x = e.attr('ms-x'), _y = e.attr('ms-y');
				this.open(e, _x, _y);
			}
		},

		mouseup: function (e) {
			if (e.button == 2) {
				e.preventDefault();
				this.rightMouseUp(e);
				return false;
			}
		},

		mousedown: function (e) {
			if (e.button == 2) {
				e.preventDefault();
				this.rightMouseDown(e);
				return false;
			}
		},

		open: function (ele, x, y) {
			if ('boolean' == typeof this.values[y][x])
				ele.addClass('bomb');
			else {
				if (this.values[y][x] != 0)
					ele.css('color', this.digitColor[this.values[y][x]]).html(this.values[y][x]);
			}
		},

		rightMouseUp: function (e) {
			if (!$(e.target).hasClass('flag') && !$(e.target).hasClass('active')) {
				$(e.target).addClass('flag');
				this.statistics.updateRemainValue(this.statistics.remain - 1);
			} else {
				$(e.target).removeClass('flag');
				this.statistics.updateRemainValue(this.statistics.remain + 1);
			}
		},

		rightMouseDown: function (e) {
			if ($(e.target).hasClass('active')) {
				var rightClickOnOpened = true;

				$(e.target).unbind().on('mousedown', function (e) {
					if (e.button == 0 && rightClickOnOpened) {
						rightClickOnOpened = false;
						alert('OK1');
					}
				});

			} 
		}
	};

	$.fn.minesweeper = function (options) {
		var el = $(this);
		el.data('minesweeper', new Minesweeper(el, options));

		return el.data('minesweeper');
	};
}(jQuery);