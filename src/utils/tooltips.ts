({
    getTooltipHandlers: function(options) {
        if (options.tooltip.mode === "scrubber") {
            return {
                onChartHover: angular.bind(this, this.showScrubber)
            };
        } else {
            return {
                onMouseOver: angular.bind(this, this.onMouseOver),
                onMouseOut: angular.bind(this, this.onMouseOut)
            };
        }
    },
    styleTooltip: (d3TextElement) => d3TextElement.attr({
            "font-family": "monospace",
            "font-size": 10,
            "fill": "white",
            "text-rendering": "geometric-precision"
        }),
    addTooltips: function(svg, dimensions, axesOptions) {
        var h, height, p, w, width, xTooltip, y2Tooltip, yTooltip;
        width = dimensions.width;
        height = dimensions.height;

        width = width - dimensions.left - dimensions.right;
        height = height - dimensions.top - dimensions.bottom;

        w = 24;
        h = 18;
        p = 5;

        xTooltip = svg.append("g").attr({
            "id": "xTooltip",
            "class": "xTooltip",
            "opacity": 0
        });

        xTooltip.append("path").attr("transform", "translate(0," + (height + 1) + ")");

        this.styleTooltip(xTooltip.append("text").style("text-anchor", "middle").attr({
            "width": w,
            "height": h,
            "transform": "translate(0," + (height + 19) + ")"
        }));

        yTooltip = svg.append("g").attr({
            id: "yTooltip",
            "class": "yTooltip",
            opacity: 0
        });

        yTooltip.append("path");
        this.styleTooltip(yTooltip.append("text").attr({
            "width": h,
            "height": w
        }));

        if (axesOptions.y2 != null) {
            y2Tooltip = svg.append("g").attr({
                "id": "y2Tooltip",
                "class": "y2Tooltip",
                "opacity": 0,
                "transform": "translate(" + width + ",0)"
            });

            y2Tooltip.append("path");

            return this.styleTooltip(y2Tooltip.append("text").attr({
                "width": h,
                "height": w
            }));
        }
    },
    onMouseOver: function(svg, event, axesOptions) {
        this.updateXTooltip(svg, event, axesOptions.x);

        if (event.series.axis === "y2") {
            return this.updateY2Tooltip(svg, event, axesOptions.y2);
        } else {
            return this.updateYTooltip(svg, event, axesOptions.y);
        }
    },
    onMouseOut: function(svg) {
        return this.hideTooltips(svg);
    },
    updateXTooltip: function(svg, _arg, xAxisOptions) {
        var color, datum, label, series, textX, x, xTooltip, _arg, _f;
        x = _arg.x, datum = _arg.datum, series = _arg.series;
        xTooltip = svg.select("#xTooltip");

        xTooltip.transition().attr({
            "opacity": 1.0,
            "transform": "translate(" + x + ",0)"
        });

        _f = xAxisOptions.tooltipFormatter;
        textX = _f ? _f(datum.x) : datum.x;

        label = xTooltip.select("text");
        label.text(textX);

        // Use a coloring function if defined, else use a color string value
        color = angular.isFunction(series.color) ? series.color(datum, series.values.indexOf(datum)) : series.color;

        return xTooltip.select("path").style("fill", color).attr("d", this.getXTooltipPath(label[0][0]));
    },
    getXTooltipPath: function(textElement) {
        var h, p, w;
        w = Math.max(this.getTextBBox(textElement).width, 15);
        h = 18;
        p = 5;  // Size of the 'arrow' that points towards the axis

        return "m-" + w / 2 + " " + p + " " + "l0 " + h + " " + "l" + w + " 0 " + "l0 " + "" + (-h) + "l" + (-w / 2 + p) + " 0 " + "l" + (-p) + " -" + h / 4 + " " + "l" + (-p) + " " + h / 4 + " " + "l" + (-w / 2 + p) + " 0z";
    },
    updateYTooltip: function(svg, _arg, yAxisOptions) {
        var color, datum, label, series, textY, w, y, yTooltip, _arg, _f;
        y = _arg.y, datum = _arg.datum, series = _arg.series;
        yTooltip = svg.select("#yTooltip");
        yTooltip.transition().attr({
            "opacity": 1.0,
            "transform": "translate(0, " + y + ")"
        });

        _f = yAxisOptions.tooltipFormatter;
        textY = _f ? _f(datum.y) : datum.y;

        label = yTooltip.select("text");
        label.text(textY);
        w = this.getTextBBox(label[0][0]).width + 5;

        label.attr({
            "transform": "translate(" + (-w - 2) + ",3)",
            "width": w
        });

        // Use a coloring function if defined, else use a color string value
        color = angular.isFunction(series.color) ? series.color(datum, series.values.indexOf(datum)) : series.color;

        return yTooltip.select("path").style("fill", color).attr("d", this.getYTooltipPath(w));
    },
    updateY2Tooltip: function(svg, _arg, yAxisOptions) {
        var color, datum, label, series, textY, w, y, y2Tooltip, _arg, _f;
        y = _arg.y, datum = _arg.datum, series = _arg.series;
        y2Tooltip = svg.select("#y2Tooltip");
        y2Tooltip.transition().attr("opacity", 1.0);

        _f = yAxisOptions.tooltipFormatter;
        textY = _f ? _f(datum.y) : datum.y;

        label = y2Tooltip.select("text");
        label.text(textY);
        w = this.getTextBBox(label[0][0]).width + 5;
        label.attr({
            "transform": "translate(7, " + (parseFloat(y) + 3) + ")",
            "w": w
        });

        // Use a coloring function if defined, else use a color string value
        color = angular.isFunction(series.color) ? series.color(datum, series.values.indexOf(datum)) : series.color;

        return y2Tooltip.select("path").style("fill", color).attr({
            "d": this.getY2TooltipPath(w),
            "transform": "translate(0, " + y + ")"
        });
    },
    getYTooltipPath: (w) => {
        var h, p;
        h = 18;
        p = 5;  // Size of the 'arrow' that points towards the axis

        return "m0 0" + "l" + (-p) + " " + (-p) + " " + "l0 " + (-h / 2 + p) + " " + "l" + (-w) + " 0 " + "l0 " + h + " " + "l" + w + " 0 " + "l0 " + (-h / 2 + p) + "l" + (-p) + " " + p + "z";
    },
    getY2TooltipPath: (w) => {
        var h, p;
        h = 18;
        p = 5;  // Size of the 'arrow' that points towards the axis

        return "m0 0" + "l" + p + " " + p + " " + "l0 " + (h / 2 - p) + " " + "l" + w + " 0 " + "l0 " + (-h) + " " + "l" + (-w) + " 0 " + "l0 " + (h / 2 - p) + " " + "l" + (-p) + " " + p + "z";
    },
    hideTooltips: (svg) => {
        svg.select("#xTooltip").transition().attr("opacity", 0);

        svg.select("#yTooltip").transition().attr("opacity", 0);

        return svg.select("#y2Tooltip").transition().attr("opacity", 0);
    }
});
