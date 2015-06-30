var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item)
        return i;
} return -1; };
({
    drawLines: function (svg, scales, data, options, handlers) {
        var drawers, lineGroup;
        drawers = {
            y: this.createLeftLineDrawer(scales, options.lineMode, options.tension),
            y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)
        };
        lineGroup = svg.select(".content").selectAll(".lineGroup").data(data.filter(function (s) {
            var _ref;
            return _ref = s.type, __indexOf.call(["line", "area"].enter().append("g"), _ref) >= 0;
        }));
        lineGroup.style("stroke", function (s) { return s.color; }).attr("class", function (s) { return "lineGroup series_" + s.index; }).append("path").attr({
            "class": "line",
            d: function (d) { return drawers[d.axis](d.values); }
        }).style({
            "fill": "none",
            "stroke-width": function (s) { return s.thickness; },
            "stroke-dasharray": function (s) {
                if (s.lineMode === "dashed") {
                    return "10,3";
                }
                return void 0;
            }
        });
        if (options.tooltip.interpolate) {
            function interpolateData(series) {
                var datum, error, i, interpDatum, maxXPos, maxXValue, maxYPos, maxYValue, minXPos, minXValue, minYPos, minYValue, mousePos, target, valuesData, x, xPercentage, xVal, y, yPercentage, yVal, _i, _len;
                target = d3.select(d3.event.target);
                try {
                    mousePos = d3.mouse(this);
                }
                catch (_error) {
                    error = _error;
                    mousePos = [0, 0];
                }
                // interpolate between min/max based on mouse coords
                valuesData = target.datum().values;
                // find min/max coords and values
                for (i = _i = 0, _len = valuesData.length; _i < _len; i = ++_i) {
                    datum = valuesData[i];
                    x = scales.xScale(datum.x);
                    y = scales.yScale(datum.y);
                    if ((typeof minXPos === "undefined" || minXPos === null) || x < minXPos) {
                        minXPos = x;
                        minXValue = datum.x;
                    }
                    if ((typeof maxXPos === "undefined" || maxXPos === null) || x > maxXPos) {
                        maxXPos = x;
                        maxXValue = datum.x;
                    }
                    if ((typeof minYPos === "undefined" || minYPos === null) || y < minYPos) {
                        minYPos = y;
                    }
                    if ((typeof maxYPos === "undefined" || maxYPos === null) || y > maxYPos) {
                        maxYPos = y;
                    }
                    if ((typeof minYValue === "undefined" || minYValue === null) || datum.y < minYValue) {
                        minYValue = datum.y;
                    }
                    if ((typeof maxYValue === "undefined" || maxYValue === null) || datum.y > maxYValue) {
                        maxYValue = datum.y;
                    }
                }
                xPercentage = (mousePos[0] - minXPos) / (maxXPos - minXPos);
                yPercentage = (mousePos[1] - minYPos) / (maxYPos - minYPos);
                xVal = Math.round(xPercentage * (maxXValue - minXValue) + minXValue);
                yVal = Math.round((1 - yPercentage) * (maxYValue - minYValue) + minYValue);
                interpDatum = {
                    x: xVal,
                    y: yVal
                };
                return typeof handlers.onMouseOver === "function" ? handlers.onMouseOver(svg, {
                    series: series,
                    x: mousePos[0],
                    y: mousePos[1],
                    datum: interpDatum
                }, options.axes) : void 0;
            }
            lineGroup.on("mousemove", interpolateData.on("mouseout", function (d) { return handlers.onMouseOut(svg); }));
        }
        return this;
    },
    createLeftLineDrawer: function (scales, mode, tension) { return d3.svg.line().x(function (d) { return scales.xScale(d.x).y(function (d) { return scales.yScale(d.y + d.y0).interpolate(mode).tension(tension); }); }); },
    createRightLineDrawer: function (scales, mode, tension) { return d3.svg.line().x(function (d) { return scales.xScale(d.x).y(function (d) { return scales.y2Scale(d.y + d.y0).interpolate(mode).tension(tension); }); }); }
});
