function createGraph(graphX, graphY, graphWidth, graphHeight,
	legends = 'Need legend', types = 'Need type', colorVal = 'default')
{
		var pts = [];

		var xdat = {
			min: Infinity,
			max: -Infinity
		};

		var ydat = {
			min: Infinity,
			max: -Infinity
		};

		if (!Array.isArray(legends)) legends = [legends];

		if (!Array.isArray(types)) types = [types];

		var nLines = legends.length;

		if (types.length !== nLines) {
			console.log('graph error: legends/types length mismatch');
			return;
		}

		var useColor = false;
		if (!colorVal || colorVal == 'default' || 
		    (Array.isArray(colorVal) && colorVal.length != nLines)) {
				colorVal = [
					'green', 'blue', 'yellow', 'magenta', 
					'purple', 'cyan', 'olive', 'lime', 'navy'
				];
		} else {
			useColor = true;
			if (!Array.isArray(colorVal)) colorVal = [colorVal];
		}

		function add(x, y)
		{
			if (x > xdat.max) xdat.max = x;
			if (x < xdat.min) xdat.min = x;

			if (!Array.isArray(y)) y = [y];

			if (y.length !== nLines) {
				console.log('graph error: legends/data length mismatch');
				return;
			}

			for (var i = 0; i < nLines; i++)
			{
				var ypt = y[i];
				if (ypt > ydat.max) ydat.max = ypt;
				if (ypt < ydat.min) ydat.min = ypt;
			}

			pts.push({
				x: x, y: y
			});

		}

		function calcTicks(vmin, vmax, ntry, yval)
		{
			var tickStep = (vmax - vmin) / (ntry - 1);
			var mag = Math.pow(10, Math.floor(Math.log10(tickStep)));
			var residual = tickStep / mag;

			if (!yval) {
				if (residual > 5) {
					tickStep = 10 * mag;
				} else if (residual > 2) {
					tickStep = 5 * mag;
				} else if (residual > 1) {
					tickStep = 2 * mag;
				} else {
					tickStep = mag;
				}
			}

			var tickMin = tickStep * Math.floor(vmin / tickStep);
			var tickMax = tickStep * Math.ceil(vmax / tickStep);
			var nticks = !yval ? Math.floor((tickMax - tickMin) / tickStep) + 1 : yval;

			return {
				min: tickMin, max: tickMax,
				step: tickStep,
				n: nticks
			};
		}

		function draw()
		{
			var pad = 20;

			var xticks = {
				min: 0,
				max: 1,
				step: 0,
				n: 2
			};
			var yticks = {
				min: 0,
				max: 1,
				step: 0,
				n: 2
			};

			function tocanvas(x, y)
			{
				var tx = map(x, xticks.min, xticks.max, pad, graphWidth - pad);
				var ty = map(y, yticks.min, yticks.max, graphHeight - pad,  pad);
				return {
					tx, ty
				};
			}

			var nPts = pts.length;
			if (nPts > 1) {
				var nmax = min(nPts, 10);
				xticks = calcTicks(xdat.min, xdat.max, nmax, false);
				yticks = calcTicks(ydat.min, ydat.max, nmax, 10);
			}

			push();
			translate(graphX, graphY);

			fill(192);
			stroke(192);
			strokeWeight(1);

			for (var i = 0; i < xticks.n; i++)
			{
				var xpos = i / (xticks.n - 1) * (graphWidth - 2 * pad) + pad;						
				line(xpos, pad, xpos, graphHeight - pad);
			}
			for (var i = 0; i < yticks.n; i++)
			{
				var ypos = i / (yticks.n - 1) * (graphHeight - 2 * pad) + pad;
				line(pad, ypos, graphWidth - pad, ypos);
			}

			fill(230);
			noStroke();
			textAlign(CENTER, CENTER);
			textSize(graphWidth / 50 + graphHeight / 50);

			for (var i = 0; i < xticks.n; i++)
			{
				var xpos = i / (xticks.n - 1) * (graphWidth - 2 * pad) + pad;			
				text('' + round(xticks.min + i * xticks.step), xpos, graphHeight - pad / 2);
			}
			textAlign(LEFT, CENTER);
			for (var i = 0; i < yticks.n; i++)
			{
				var ypos = i / (yticks.n - 1) * (graphHeight - 2 * pad) + pad;
				var yval = ((yticks.n - 1 - i) * yticks.step + yticks.min);
				var textStr = '' + eToNumber(yval.toFixed(9));
				text(textStr, -(textWidth(textStr) - 16), ypos);
			}

			strokeWeight(2);

			if (nPts < 2) {
				pop();
				return;
			}

			for (var i = 0; i < nLines; i++)
			{
				if (useColor) {
					stroke(colorVal[i]);
				} else {
					stroke(colorVal[i % colorVal.length]);
				}
				if (types[i] == 'rect') {
					for (var j = 0; j < nPts; j++)
					{
						var p = pts[j];
						var pt = tocanvas(p.x, p.y[i]);
						rect(pt.tx, pt.ty, 4, 4);
					}
				} else if (types[i] == 'line') {
					for (var j = 1; j < nPts; j++)
					{
						var p1 = pts[j];
						var p2 = pts[j-1];
						var pt1 = tocanvas(p1.x, p1.y[i]);
						var pt2 = tocanvas(p2.x, p2.y[i]);
						line(pt1.tx, pt1.ty, pt2.tx, pt2.ty);
					}
				} else if (types[i] == 'dot') {
					for (var j = 0; j < nPts; j++)
					{
						var p = pts[j];
						var pt = tocanvas(p.x, p.y[i]);
						ellipse(pt.tx, pt.ty, 4, 4);
					}
				} else if (types[i] == 'dotline') {
					for (var j = 1; j < nPts; j++)
					{
						var p1 = pts[j];
						var p2 = pts[j-1];
						var pt1 = tocanvas(p1.x, p1.y[i]);
						var pt2 = tocanvas(p2.x, p2.y[i]);
						line(pt1.tx, pt1.ty, pt2.tx, pt2.ty);
						ellipse(pt2.tx, pt2.ty, 4, 4);
					}
				} else if (types[i] == 'linetozero') {
					for (var j = 0; j < nPts; j++)
					{
						var p = pts[j];
						var pt = tocanvas(p.x, p.y[i]);
						var pt0 = tocanvas(p.x, yticks.min);
						line(pt.tx, pt.ty, pt0.tx, pt0.ty);
					}
				} else if (types[i] == 'linetolinetozero') {
					for (var j = 1; j < nPts; j++)
					{
						var p1 = pts[j];
						var p2 = pts[j-1];
						var pt1 = tocanvas(p1.x, p1.y[i]);
						var pt2 = tocanvas(p2.x, p2.y[i]);
						line(pt1.tx, pt1.ty, pt2.tx, pt2.ty);
						var pt0 = tocanvas(p1.x, yticks.min);
						line(pt1.tx, pt1.ty, pt0.tx, pt0.ty);
					}
				}
			}

			stroke(color(255, 0, 0));
			var xpt0min = tocanvas(xticks.min, 0);
			var xpt0max = tocanvas(xticks.max, 0);
			var ypt0min = tocanvas(0, yticks.min);
			var ypt0max = tocanvas(0, yticks.max);
			if (xpt0min.ty <= ypt0min.ty && xpt0max.ty >= ypt0max.ty) {
				line(xpt0min.tx, xpt0min.ty, xpt0max.tx, xpt0max.ty);
			}

			var legendY = 5;
			var legendW = 30;
			var legendH = 14 * nLines;
			var legendPad = 5;

			noStroke();
			textSize(12);
			textAlign(LEFT, BASELINE);

			for (var i = 0; i < legends.length; i++)
			{
				var textW = textWidth(legends[i]);
				if (textW > legendW) legendW = textW;
			}
			var legendX = legendW + 2 * legendPad;

			fill(34, 160);
			rect((graphWidth - pad) - legendX - legendPad, pad + legendY,
				legendW + 2 * legendPad, legendH + 2 * legendPad);

			for (var i = 0; i < nLines; i++)
			{
				if (useColor) {
					fill(colorVal[i]);
				} else {
					fill(colorVal[i % colorVal.length]);
				}
				text(legends[i], (graphWidth - pad) - legendX, pad + legendY + (i + 1) * 16);
			}

			pop();
		}

		function reset()
		{
			pts = [];
			xdat = {
				min: Infinity,
				max: -Infinity
			};
			ydat = {
				min: Infinity,
				max: -Infinity
			};
		}

		return {
			add,
			draw,
			reset
		}
	}