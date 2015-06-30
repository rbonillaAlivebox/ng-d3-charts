var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

({
    getPseudoColumns: (data, options) => {
        var keys, pseudoColumns;
        data = data.filter((s) => s.type === "column");

        pseudoColumns = {};
        keys = [];
        data.forEach((series, i) => {
            var inAStack, index, visible;
            visible = options.series != null ? options.series[i].visible : void 0;
            if (visible === void 0 || visible === !false) {
                inAStack = false;
                options.stacks.forEach((stack, index) => {
                    var _ref;
                    if ((series.id != null) && (_ref = series.id, __indexOf.call(stack.series, _ref) >= 0)) {
                        pseudoColumns[series.id] = index;
                        if (__indexOf.call(keys, index) < 0) {
                            keys.push(index);
                        }
                        return inAStack = true;
                    }
                });

                if (inAStack === false) {
                    i = pseudoColumns[series.id] = index = keys.length;
                    return keys.push(i);
                }
            }
        });

        return {
            pseudoColumns: pseudoColumns,
            keys: keys
        };
    },
    getMinDelta: (seriesData, key, scale, range) => d3.min(seriesData.map((series) => series.values.map((d) => scale(d[key])).filter((e) => true).reduce((prev, cur, i, arr) => {
                var diff;
                diff = i > 0 ? cur - arr[i - 1] : Number.MAX_VALUE;
                if (diff < prev) {
                    return diff;
                } else {
                    return prev;
                }
            }, Number.MAX_VALUE))),
    getBestColumnWidth: function(axes, dimensions, seriesData, options) {
        var colData, delta, innerWidth, keys, nSeries, pseudoColumns, _ref;
        if (!(seriesData && seriesData.length !== 0)) {
            return 10;
        }

        if ((seriesData.filter((s) => s.type === "column")).length === 0) {
            return 10;
        }

        _ref = this.getPseudoColumns(seriesData, options), pseudoColumns = _ref.pseudoColumns, keys = _ref.keys;

        // iner width of the chart area
        innerWidth = dimensions.width - dimensions.left - dimensions.right;

        colData = seriesData.filter((d) => pseudoColumns.hasOwnProperty(d.id));

        // Get the smallest difference on the x axis in the visible range
        delta = this.getMinDelta(colData, "x", axes.xScale, [0, innerWidth]);

        // We get a big value when we cannot compute the difference
        if (delta > innerWidth) {
            // Set to some good looking ordinary value
            delta = 0.25 * innerWidth;
        }

        // number of series to display
        nSeries = keys.length;

        return parseInt((delta - options.columnsHGap) / nSeries);
    },
    getColumnAxis: function(data, columnWidth, options) {
        var keys, pseudoColumns, x1, _ref;
        _ref = this.getPseudoColumns(data, options), pseudoColumns = _ref.pseudoColumns, keys = _ref.keys;

        x1 = d3.scale.ordinal().domain(keys).rangeBands([0, keys.length * columnWidth], 0);

        return (s) => {
            var index;
            if (pseudoColumns[s.id] == null) {
                return 0;
            }
            index = pseudoColumns[s.id];
            return x1(index) - keys.length * columnWidth / 2;
        };
    },
    drawColumns: function(svg, axes, data, columnWidth, options, handlers, dispatch) {
        var colGroup, x1;
        data = data.filter((s) => s.type === "column");

        x1 = this.getColumnAxis(data, columnWidth, options);

        data.forEach((s) => s.xOffset = x1(s) + columnWidth * .5);

        colGroup = svg.select(".content").selectAll(".columnGroup").data(data).enter().append("g").attr("class", (s) => "columnGroup series_" + s.index).attr("transform", (s) => "translate(" + x1(s) + ",0)");

        colGroup.each(function(series) {
            return d3.select(this).selectAll("rect").data(series.values).enter().append("rect").style({
                "stroke": series.color,
                "fill": series.color,
                "stroke-opacity": (d) => {
                    if (d.y === 0) {
                        return "0";
                    } else {
                        return "1";
                    }
                },
                "stroke-width": "1px",
                "fill-opacity": (d) => {
                    if (d.y === 0) {
                        return 0;
                    } else {
                        return 0.7;
                    }
                }
            }).attr({
                width: columnWidth,
                x: (d) => axes.xScale(d.x),
                height: (d) => {
                    if (d.y === 0) {
                        return axes[d.axis + "Scale"].range()[0];
                    }
                    return Math.abs(axes[d.axis + "Scale"](d.y0 + d.y) - axes[d.axis + "Scale"](d.y0));
                },
                y: (d) => {
                    if (d.y === 0) {
                        return 0;
                    } else {
                        return axes[d.axis + "Scale"](Math.max(0, d.y0 + d.y));
                    }
                }
            }).on({
                "click": (d, i) => dispatch.click(d, i)
            }).on("mouseover", (d, i) => {
                dispatch.hover(d, i);
                return typeof handlers.onMouseOver === "function" ? handlers.onMouseOver(svg, {
                    series: series,
                    x: axes.xScale(d.x),
                    y: axes[d.axis + "Scale"](d.y0 + d.y),
                    datum: d
                }, options.axes) : void 0;
            }).on("mouseout", (d) => handlers.onMouseOut(svg));
        });

        return this;
    }
});
