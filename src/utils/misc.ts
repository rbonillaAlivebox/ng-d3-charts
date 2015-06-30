var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

({
    getPixelCssProp: (element, propertyName) => {
        var string;
        string = $window.getComputedStyle(element, null).getPropertyValue(propertyName);
        return +string.replace(/px$/, "");
    },
    getDefaultMargins: () => ({
            top: 20,
            right: 50,
            bottom: 60,
            left: 50
        }),
    getDefaultThumbnailMargins: () => ({
            top: 1,
            right: 1,
            bottom: 2,
            left: 0
        }),
    getElementDimensions: function(element, width, height) {
        var bottom, dim, left, parent, right, top;
        dim = {};
        parent = element;

        top = this.getPixelCssProp(parent, "padding-top");
        bottom = this.getPixelCssProp(parent, "padding-bottom");
        left = this.getPixelCssProp(parent, "padding-left");
        right = this.getPixelCssProp(parent, "padding-right");

        dim.width = +(width || parent.offsetWidth || 900) - left - right;
        dim.height = +(height || parent.offsetHeight || 500) - top - bottom;

        return dim;
    },
    getDimensions: function(options, element, attrs) {
        var dim;
        dim = this.getElementDimensions(element[0].parentElement, attrs.width, attrs.height);
        dim = angular.extend(options.margin, dim);

        return dim;
    },
    clean: (element) => d3.select(element).on("keydown", null).on("keyup", null).select("svg").remove(),
    uuid: () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            var r, v;
            r = Math.random() * 16 | 0;
            v = c === "x" ? r : r & 0x3 | 0x8;
            return v.toString(16);
        }),
    bootstrap: (element, id, dimensions) => {
        var defs, height, svg, width;
        d3.select(element).classed("chart", true);

        width = dimensions.width;
        height = dimensions.height;

        svg = d3.select(element).append("svg").attr({
            width: width,
            height: height
        }).append("g").attr("transform", "translate(" + dimensions.left + "," + dimensions.top + ")");

        defs = svg.append("defs").attr("class", "patterns");

        // Add a clipPath for the content area
        defs.append("clipPath").attr("class", "content-clip").attr("id", "content-clip-" + id).append("rect").attr({
            "x": 0,
            "y": 0,
            "width": width - dimensions.left - dimensions.right,
            "height": height - dimensions.top - dimensions.bottom
        });

        return svg;
    },
    createContent: (svg, id, options) => {
        var content;
        content = svg.append("g").attr("class", "content");

        if (options.hideOverflow) {
            return content.attr("clip-path", "url(#content-clip-" + id + ")");
        }
    },
    createGlass: function(svg, dimensions, handlers, axes, data, options, dispatch, columnWidth) {
        var glass, scrubberGroup, that;
        that = this;

        glass = svg.append("g").attr({
            "class": "glass-container",
            "opacity": 0
        });

        scrubberGroup = glass.selectAll(".scrubberItem").data(data).enter().append("g").attr("class", (s, i) => "scrubberItem series_" + i);

        scrubberGroup.each(function(s, i) {
            var g, g2, item;
            item = d3.select(this);

            g = item.append("g").attr({
                "class": "rightTT"
            });

            g.append("path").attr({
                "class": "scrubberPath series_" + i,
                "y": "-7px",
                "fill": s.color
            });

            that.styleTooltip(g.append("text").style("text-anchor", "start").attr({
                "class": (d, i) => "scrubberText series_" + i,
                "height": "14px",
                "transform": "translate(7, 3)",
                "text-rendering": "geometric-precision"
            })).text(s.label || s.y);

            g2 = item.append("g").attr({
                "class": "leftTT"
            });

            g2.append("path").attr({
                "class": "scrubberPath series_" + i,
                "y": "-7px",
                "fill": s.color
            });

            that.styleTooltip(g2.append("text").style("text-anchor", "end").attr({
                "class": "scrubberText series_" + i,
                "height": "14px",
                "transform": "translate(-13, 3)",
                "text-rendering": "geometric-precision"
            })).text(s.label || s.y);

            return item.append("circle").attr({
                "class": "scrubberDot series_" + i,
                "fill": "white",
                "stroke": s.color,
                "stroke-width": "2px",
                "r": 4
            });
        });

        return glass.append("rect").attr({
            "class": "glass",
            width: dimensions.width - dimensions.left - dimensions.right,
            height: dimensions.height - dimensions.top - dimensions.bottom
        }).style("fill", "white").style("fill-opacity", 0.000001).on("mouseover", function() {
            return handlers.onChartHover(svg, d3.select(this), axes, data, options, dispatch, columnWidth);
        });
    },
    getDataPerSeries: (data, options) => {
        var axes, layout, series, straightened;
        series = options.series;
        axes = options.axes;

        if (!(series && series.length && data && data.length)) {
            return [];
        }

        straightened = series.map((s, i) => {
            var seriesData;
            seriesData = {
                index: i,
                name: s.y,
                values: [],
                color: s.color,
                axis: s.axis || "y",
                xOffset: 0,
                type: s.type,
                thickness: s.thickness,
                drawDots: s.drawDots !== false
            };

            if (s.dotSize != null) {
                seriesData.dotSize = s.dotSize;
            }

            if (s.striped === true) {
                seriesData.striped = true;
            }

            if (s.lineMode != null) {
                seriesData.lineMode = s.lineMode;
            }

            if (s.id) {
                seriesData.id = s.id;
            }

            data.filter((row) => row[s.y] != null).forEach((row) => {
                var d;
                d = {
                    x: row[options.axes.x.key],
                    y: row[s.y],
                    y0: 0,
                    axis: s.axis || "y"
                };

                if (s.dotSize != null) {
                    d.dotSize = s.dotSize;
                }
                return seriesData.values.push(d);
            });

            return seriesData;
        });

        if ((options.stacks == null) || options.stacks.length === 0) {
            return straightened;
        }

        layout = d3.layout.stack().values((s) => s.values);

        options.stacks.forEach((stack) => {
            var layers;
            if (!(stack.series.length > 0)) {
                return;
            }
            layers = straightened.filter((s, i) => {
                var _ref;
                return (s.id != null) && (_ref = s.id, __indexOf.call(stack.series, _ref) >= 0);
            });
            return layout(layers);
        });

        return straightened;
    },
    estimateSideTooltipWidth: function(svg, text) {
        var bbox, t;
        t = svg.append("text");
        t.text("" + text);
        this.styleTooltip(t);

        bbox = this.getTextBBox(t[0][0]);
        t.remove();

        return bbox;
    },
    getTextBBox: (svgTextElement) => {
        var error;
        if (svgTextElement !== null) {
            try {
                return svgTextElement.getBBox();
            } catch (_error) {
                error = _error;
                // NS_ERROR_FAILURE in FF for calling .getBBox()
                // on an element that is not rendered (e.g. display: none)
                // https://bugzilla.mozilla.org/show_bug.cgi?id=612118
                return {
                    height: 0,
                    width: 0,
                    y: 0,
                    x: 0
                };
            }
        }

        return {};
    },
    getWidestTickWidth: function(svg, axisKey) {
        var bbox, max, ticks, _ref;
        max = 0;
        bbox = this.getTextBBox;

        ticks = svg.select("." + axisKey + ".axis").selectAll(".tick");
        if ((_ref = ticks[0]) != null) {
            _ref.forEach((t) => max = Math.max(max, bbox(t).width));
        }

        return max;
    },
    getWidestOrdinate: (data, series, options) => {
        var widest;
        widest = "";

        data.forEach((row) => series.forEach((series) => {
                var v, _ref;
                v = row[series.y];

                if ((series.axis != null) && ((_ref = options.axes[series.axis]) != null ? _ref.ticksFormatter : void 0)) {
                    v = options.axes[series.axis].ticksFormatter(v);
                }

                if (v == null) {
                    return;
                }

                if (("" + v).length > ("" + widest).length) {
                    return widest = v;
                }
            }));

        return widest;
    }
});
