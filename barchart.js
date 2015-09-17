/**
 * Bar Chart Library
 */

function BarChart(options) {

	var self = this;
	options = options || {};

	self._data = options.data || null;
	self._defaultBarColor = options.defaultBarColor || 'rgb(245,30,30)';
	self._barColors = options.barColors || {};
	self._barWidth = options.barWidth || null;
	self._barGutter = options.barGutter || 0;
	self._element = (options.elementId) ? this.element(options.elementId) : null;
	self._canvas = null;
	self._width = options.width || 600;
	self._chartHeight = options.chartHeight || 400;
	self._ranges = options.ranges || [];
	self._targets = options.targets || [];
	self._font = options.font || 'Arial';
	self._fontSize = options.fontSize || 14;
	self._barLabelsColor = options.barLabelsColor || 'rgb(189,188,187)';
	self._chartLow = options.chartLow || null;
	self._chartHigh = options.chartHigh || null;
	self._division = options.division || 50;
	self._divisionColor = options.divisionColor || 'rgb(180,180,180)';
	self._divisionLabelsColor = options.divisionLabelsColor || 'rgb(104,103,103)';
	self._yAxisLabel = options.yAxisLabel || 50;
	self._yAxisLabelBackgroundColor = options.yAxisLabelBackgroundColor || 'rgb(236,236,236)';
	self._yAxisLabelColor = options.yAxisLabelColor || 'rgb(191,190,190)';
	self._yAxisTextAlign = options.yAxisTextAlign || 'center';
	self._chartTitle = options.chartTitle || null;
	self._chartTitleColor = options.chartTitleColor || 'rgb(195,194,194)';
	self._backgroundColor = options.backgroundColor || 'rgb(255,255,255)';



	/**
	 * Sets canvas to `cvs` if provided, or resturns the canvas element
	 */
	self.canvas = function(cvs) {
		if (!cvs && !self._canvas) {
			cvs = document.createElement('canvas');
			cvs.width = self._width;
			cvs.height = self._height;
			cvs.style.maxWidth = '100%';
			var ctx = cvs.getContext('2d');
			ctx.fillStyle = self._backgroundColor;
			ctx.fillRect(0, 0, self._width, self._height);
		}

		if (cvs) {
			self._canvas = cvs;
		}
		
		return self._canvas;
	};


	self.context = function() {
		return self.canvas().getContext('2d');
	}


	self.element = function(elementId) {
		if (elementId) {
			self._element = document.getElementById(elementId);
		}

		return self._element;
	}


	self.draw = function(elementId) {
		if (elementId) {
			self.element(elementId);
		}

		// draw chart elements
		
		if (self._chartTitle) {
			self.drawChartTitle();
		}

		if (self._ranges && self._ranges.length) {
			for (var i = 0, len = self._ranges.length; i < len; i ++) {
				self.drawRange(self._ranges[i].low, self._ranges[i].high, self._ranges[i].color, self._ranges[i].label);
			}
		}

		self.drawScale();
		self.drawYAxisLabel();
		self.drawBars();
		self.drawBarLabels();

		// Targets should be above bars, so draw them after drawing the bars.

		if (self._targets && self._targets.length) {
			for (var i = 0, len = self._targets.length; i < len; i ++) {
				self.drawTarget(self._targets[i].label, self._targets[i].target, self._targets[i].color);
			}
		}

		if (self.objectLength(self._barColors)) {
			self.drawKey();
		}

		// append canvas to element
		self.element().appendChild(self.canvas());
	}


	self.drawChartTitle = function() {
		if (!self._chartTitle) {
			return false;
		}

		var ctx = self.context();
		ctx.fillStyle = self._chartTitleColor;
		ctx.font = self.font();
		ctx.textAlign = 'left';
		ctx.fillText(self._chartTitle, 0, self._fontSize * 2);
	}


	self.drawYAxisLabel = function() {
		var ctx = self.context();
		ctx.font = self.font();
		ctx.save();
		ctx.translate(self.getYAxisLabelWidth() / 2, (self.getChartHeight() / 2) + self.getChartTitleHeight());
		ctx.rotate(-Math.PI/2);
		ctx.fillStyle = self._yAxisLabelBackgroundColor;
		ctx.fillRect((self.getChartHeight() / 2) * -1, (self.getYAxisLabelWidth() / 2) * -1, self.getChartHeight(), self._fontSize * 3);
		ctx.textAlign = self._yAxisTextAlign;
		ctx.fillStyle = self._yAxisLabelColor;
		ctx.fillText(self._yAxisLabel, 0, 0);
		ctx.restore();
	}


	self.drawScale = function() {
		var every = self._division;
		var low = Math.ceil(self.chartLow() / every) * every;
		var high = self.chartHigh();

		var ctx = self.context();
		ctx.strokeStyle = self._divisionColor;
		ctx.lineWidth = 1;
		ctx.font = self.font();
		ctx.textAlign = 'right';
		ctx.fillStyle = self._divisionLabelsColor;

		for (var i = low; i <= high; i += every) {
			ctx.beginPath();
			ctx.moveTo(self.horizontalPixelPosition(0), self.verticalPixelPosition(i) - 0.5);
			ctx.lineTo(self.getChartRightPos(), self.verticalPixelPosition(i) - 0.5);
			ctx.stroke();
			ctx.closePath();
			ctx.fillText(i, self.horizontalPixelPosition(0) - (self._fontSize / 2), self.verticalPixelPosition(i) + (self._fontSize / 4));
		}
	}


	self.drawBars = function() {
		var ctx = self.context();
		var data = self._data;
		var barGutter = self._barGutter;
		var barWidth = self._barWidth;
		var barColor;

		for (var i = 0, len = data.length; i < len; i ++) {
			if (isNaN(data[i].value)) {
				var verticalPos = self.verticalPixelPosition(0);

				for (var i2 = 0, len2 = data[i].value.length; i2 < len2; i2 ++) {
					barColor = self._defaultBarColor;

					if (self.getLabelColor(data[i].value[i2].label)) {
						barColor = self.getLabelColor(data[i].value[i2].label);
					}
					else if (self.getLabelColor(data[i].label)) {
						barColor = self.getLabelColor(data[i].label);
					}

					ctx.fillStyle = barColor;
					ctx.fillRect(
						self.horizontalPixelPosition(i * (barWidth + barGutter) + barGutter), 
						verticalPos, 
						barWidth, 
						self.valueToPixels(data[i].value[i2].value) * -1
					);

					verticalPos -= self.valueToPixels(data[i].value[i2].value);
				}
			}
			else {
				barColor = self._defaultBarColor;

				if (self.getLabelColor(data[i].label)) {
					barColor = self.getLabelColor(data[i].label);
				}

				ctx.fillStyle = barColor;
				ctx.fillRect(
					self.horizontalPixelPosition(i * (barWidth + barGutter) + barGutter), 
					self.verticalPixelPosition(0),
					barWidth, 
					self.valueToPixels(data[i].value) * -1
				);
			}
		}
	}


	self.drawBarLabels = function() {
		var ctx = self.context();
		var barGutter = self._barGutter;
		var barWidth = self._barWidth;
		var data = self._data;
		var fontSize = self.getXAxisLabelFontSize();

		ctx.fillStyle = self._barLabelsColor;

		for (var i = 0, len = data.length; i < len; i ++) {
			ctx.save();
			ctx.translate(self.horizontalPixelPosition(i * (barWidth + barGutter) + barGutter + (barWidth / 2) + (fontSize / 4)), self.getChartHeight() + (fontSize * 2)  + self.getChartTitleHeight());
			ctx.rotate(-Math.PI/2);
			ctx.textAlign = 'right';
			ctx.fillText(data[i].label, 0, 0);
			ctx.restore();
		}
	}


	self.drawKey = function() {
		var ctx = self.context();
		var fontSize = self._fontSize;
		var maxCols = self.getKeyColumns();
		var yPos = self._height - self.getKeyHeight();
		var xPos;
		var col = 0;

		ctx.textAlign = 'left';
		ctx.font = fontSize + 'px ' + self._font;

		// draw line
		yPos += self._fontSize * 4;
		ctx.beginPath();
		ctx.moveTo(0, yPos - 0.5);
		ctx.lineTo(self._width, yPos - 0.5);
		ctx.strokeStyle = 'rgb(227,19,46)';
		ctx.lineWidth = 1;
		ctx.setLineDash([3]);
		ctx.stroke();
		ctx.closePath();

		// draw key title
		yPos += self._fontSize * 1.6;
		ctx.fillStyle = 'rgb(112,111,112)';
		ctx.fillText('Key', 0, yPos);

		// draw key items
		yPos += self._fontSize * 1.6;

		for (var label in self._barColors) {
			if (self._barColors.hasOwnProperty(label)) {
				xPos = Math.round(col * (self._width / maxCols));
				ctx.fillStyle = self._barColors[label];
				ctx.fillRect(xPos, yPos, fontSize, fontSize);
				ctx.fillStyle = 'rgb(178,177,176)';
				ctx.fillText(label, xPos + 45, yPos + (fontSize * 0.9));

				col ++;

				if (col >= maxCols) {
					col = 0;
					yPos += fontSize * 1.6;
				}
			}
		}
	}


	self.drawRange = function(low, high, color, label) {
		var ctx = self.context();
		ctx.fillStyle = color;
		ctx.fillRect(
			self.horizontalPixelPosition(0), 
			self.verticalPixelPosition(low),
			self._width,
			self.valueToPixels(low - high)
		);
		if (label !== undefined) {
			ctx.font = self.font();
			ctx.textAlign = 'right';
			ctx.fillStyle = 'rgb(228,27,58)';
			ctx.fillText(label, self._width - (self._fontSize / 3), self.verticalPixelPosition(high) - (self._fontSize - 45));
		}
	}

	self.drawTarget = function(label, target, color) {

		var ctx = self.context();
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.setLineDash([3]);
		ctx.beginPath();
		ctx.moveTo(self.horizontalPixelPosition(0), self.verticalPixelPosition(target) - 0.5);
		ctx.lineTo(self._width, self.verticalPixelPosition(target) - 0.5);
		ctx.stroke();
		ctx.closePath();

		if (label !== undefined) {
			ctx.font = self.font();
			ctx.textAlign = 'right';
			ctx.fillStyle = color;
			ctx.fillText(label, self._width - (self._fontSize / 3), self.verticalPixelPosition(target) + (self._fontSize - 30));
		}
	}

	self.chartLow = function() {
		if (!self._chartLow) {
			var values = [];

			for (var i = 0, len = self._data.length; i < len; i ++) {
				values.push(self.barTotal(self._data[i]));
			}

			self._chartLow = Math.min.apply(Math, values);
		}

		return self._chartLow;
	}


	self.chartHigh = function() {
		if (!self._chartHigh) {
			var values = [];

			for (var i = 0, len = self._data.length; i < len; i ++) {
				values.push(self.barTotal(self._data[i]));
			}

			self._chartHigh = Math.max.apply(Math, values);
		}

		return self._chartHigh;
	}


	self.barTotal = function(bar) {
		if (!isNaN(bar.value)) {
			return bar.value;
		}

		var barTotal = 0;

		for (var i = 0, len = bar.value.length; i < len; i ++) {
			barTotal += bar.value[i].value;
		}

		return barTotal;
	}


	self.valueToPixels = function(value) { 
		var chartRange = self.chartHigh() - self.chartLow();
		var valueAsPercentage = value / chartRange;
		var pixels = (self.getChartHeight() * valueAsPercentage);
		return Math.round(pixels);
	}


	self.verticalPixelOffset = function() {
		var offset = self.chartLow() * -1;
		var chartRange = self.chartHigh() - self.chartLow();
		var offsetAsPercentage = offset / chartRange;
		var pixelOffset = (self.getChartHeight() * offsetAsPercentage);
		return pixelOffset;
	}


	self.verticalPixelPosition = function(value) {
		return self.getChartBottomPos() - self.verticalPixelOffset() - self.valueToPixels(value);
	}


	self.getChartBottomPos = function() {
		return self._height - self.getBarLabelsHeight() - self.getKeyHeight();
	}


	self.getChartHeight = function() {
		return self.getChartBottomPos() - self.getChartTitleHeight();
	}


	self.getChartTitleHeight = function() {
		return (self._chartTitle) ? self._fontSize * 8 : 0;
	}


	self.horizontalPixelPosition = function(chartPos) {
		return self.getChartLeftPos() + chartPos;
	}


	self.getChartWidth = function() {
		return self._width - self.getChartLeftPos();
	}


	self.getChartRightPos = function() {
		return self._width;
	}


	self.getChartLeftPos = function() {
		return self.getYAxisLabelWidth() + self.getYAxisScaleWidth();
	}


	self.getYAxisLabelWidth = function() {
		if (self._yAxisLabel) {
			return self._fontSize * 3.5;
		}

		return 0;
	}


	self.getYAxisScaleWidth = function() {
		var every = self._division;
		var low = Math.ceil(self.chartLow() / every) * every;
		var high = self.chartHigh();
		var textArray = [];

		for (var i = low; i <= high; i += every) {
			textArray.push(i);
		}

		return self.widestText(textArray, self.font()) + (self._fontSize / 2);
	}


	self.getBarLabelsHeight = function() {
		var data = self._data;
		var fontSize = self.getXAxisLabelFontSize();
		var textArray = [];

		for (var i = 0, len = data.length; i < len; i ++) {
			textArray.push(data[i].label);
		}

		return self.widestText(textArray, fontSize + 'px ' + self._font) + (fontSize * 2);
	}


	self.getKeyHeight = function() {
		return (self.getKeyRows() * self._fontSize * 1.6) + (self._fontSize * 7.2);
	}


	self.getKeyColumns = function() {
		var colWidth = self.widestText(self.getKeyTextAsArray(), self.font()) + (self._fontSize * 2) + 45;
		return Math.floor(self._width / colWidth);
	}


	self.getKeyRows = function() {
		return Math.ceil(self.getKeyTextAsArray().length / self.getKeyColumns());
	}


	self.getKeyTextAsArray = function() {
		var textArray = [];

		for (var label in self._barColors) {
			if (self._barColors.hasOwnProperty(label)) {
				textArray.push(label);
			}
		}

		return textArray;
	}


	self.getXAxisLabelFontSize = function() {
		return self._fontSize;
	}


	self.widestText = function(textArray, font) {
		var widest = 0;
		var cvs = document.createElement('canvas');
		cvs.width = 2000;
		cvs.height = 2000;
		var ctx = cvs.getContext('2d');
		ctx.font = font;

		for (var i = 0, len = textArray.length; i < len; i ++) {
			if (ctx.measureText(textArray[i]).width > widest) {
				widest = ctx.measureText(textArray[i]).width;
			}
		}

		return widest;
	}


	self.font = function() {
		return self._fontSize + 'px ' + self._font;
	}


	self.getLabelColor = function(label) {
		return (self._barColors[label]) ? self._barColors[label] : null;
	}


	self.setHeight = function() {
		self._height = self._chartHeight + self.getChartTitleHeight() + self.getBarLabelsHeight() + self.getKeyHeight();
	}


	self.objectLength = function(obj) {
		var count = 0;

		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				count ++;
			}
		}

		return count;
	};


	self.setHeight();

	if (!self._barWidth) {
		self._barWidth = ((self.getChartWidth() - self._barGutter) / self._data.length) - self._barGutter;
	}

	
	return self;
};
