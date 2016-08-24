if ("undefined" == typeof jQuery)
	throw new Error("Minesweeper requires jQuery");

!function ($) {
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
			if (typeof opts == 'object') {
				this.mines = (opts.mines) ? parseInt(opts.mines) : this.mines;
				this.sizeX = (opts.sizeX) ? parseInt(opts.sizeX) : this.sizeX;
				this.sizeY = (opts.sizeY) ? parseInt(opts.sizeY) : this.sizeY;
			}
		},

		generate: function (ele) {
			ele.append($('<div>', {
				class: 'ms-mine',
				oncontextmenu: 'return false;'
			}));

			this.ele = ele.find('.ms-mine');
			this.drawField();
			this.randomMines();
			this.calculateIndexes();
		},

		drawField: function () {
			this.values = new Array(this.sizeX);

			for (var i = 0; i < this.sizeY; i++) {
				this.values[i] = new Array(this.sizeY);

				for (var j = 0; j < this.sizeX; j++) {
					this.ele.append($('<div>', {
						class: 'ms-item classic',
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
			} else
				$(e.target).removeClass('flag');
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