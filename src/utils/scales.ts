var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

({
    createAxes: function(svg, dimensions, axesOptions) {
        var createY2Axis, height, width, x, xAxis, y, y2, y2Axis, yAxis;
        createY2Axis = axesOptions.y2 != null;

        width = dimensions.width;
        height = dimensions.height;

        width = width - dimensions.left - dimensions.right;
        height = height - dimensions.top - dimensions.bottom;

        x = void 0;
        if (axesOptions.x.type === "date") {
            x = d3.time.scale().rangeRound([0, width]);
        } else {
            x = d3.scale.linear().rangeRound([0, width]);
        }
        xAxis = this.createAxis(x, "x", axesOptions);

        y = void 0;
        if (axesOptions.y.type === "log") {
            y = d3.scale.log().clamp(true).rangeRound([height, 0]);
        } else {
            y = d3.scale.linear().rangeRound([height, 0]);
        }
        y.clamp(true);
        yAxis = this.createAxis(y, "y", axesOptions);

        y2 = void 0;
        if (createY2Axis && axesOptions.y2.type === "log") {
            y2 = d3.scale.log().clamp(true).rangeRound([height, 0]);
        } else {
            y2 = d3.scale.linear().rangeRound([height, 0]);
        }
        y2.clamp(true);
        y2Axis = this.createAxis(y2, "y2", axesOptions);

        function style(group) {
            group.style({
                "font": "10px Courier",
                "shape-rendering": "crispEdges"
            });

            return group.selectAll("path").style({
                "fill": "none",
                "stroke": "#000"  //000'
            });
        }

        return {
            xScale: x,
            yScale: y,
            y2Scale: y2,
            xAxis: xAxis,
            yAxis: yAxis,
            y2Axis: y2Axis,
            andAddThemIf: (conditions) => {
                if (!!conditions.all) {
                    if (!!conditions.x) {
                        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).call(style);
                    }

                    if (!!conditions.y) {
                        svg.append("g").attr("class", "y axis").call(yAxis).call(style);
                    }

                    if (createY2Axis && !!conditions.y2) {
                        svg.append("g").attr("class", "y2 axis").attr("transform", "translate(" + width + ", 0)").call(y2Axis).call(style);
                    }
                }

                return {
                    xScale: x,
                    yScale: y,
                    y2Scale: y2,
                    xAxis: xAxis,
                    yAxis: yAxis,
                    y2Axis: y2Axis
                };
            }
        };
    },
    createAxis: (scale, key, options) => {
        var axis, o, sides;
        sides = {
            x: "bottom",
            y: "left",
            y2: "right"
        };

        o = options[key];

        axis = d3.svg.axis().scale(scale).orient(sides[key]).tickFormat(o != null ? o.ticksFormatter : void 0);

        if (o == null) {
            return axis;
        }

        if (angular.isArray(o.ticks)) {
            axis.tickValues(o.ticks);
        } else if (angular.isNumber(o.ticks)) {
            axis.ticks(o.ticks);
        } else if (angular.isFunction(o.ticks)) {
            axis.ticks(o.ticks, o.ticksInterval);
        }

        return axis;
    },
    setScalesDomain: function(scales, data, series, svg, options) {
        var axis, y2Domain, yDomain;
        this.setXScale(scales.xScale, data, series, options.axes);

        axis = svg.selectAll(".x.axis").call(scales.xAxis);

        if (options.axes.x.ticksRotate != null) {
            axis.selectAll(".tick>text").attr("dy", null).attr("transform", "translate(0,5) rotate(" + options.axes.x.ticksRotate + " 0,6)").style("text-anchor", options.axes.x.ticksRotate >= 0 ? "start" : "end");
        }

        if ((series.filter((s) => s.axis === "y" && s.visible !== false)).length > 0) {
            yDomain = this.getVerticalDomain(options, data, series, "y");
            scales.yScale.domain(yDomain).nice();
            axis = svg.selectAll(".y.axis").call(scales.yAxis);

            if (options.axes.y.ticksRotate != null) {
                axis.selectAll(".tick>text").attr("transform", "rotate(" + options.axes.y.ticksRotate + " -6,0)").style("text-anchor", "end");
            }
        }

        if ((series.filter((s) => s.axis === "y2" && s.visible !== false)).length > 0) {
            y2Domain = this.getVerticalDomain(options, data, series, "y2");
            scales.y2Scale.domain(y2Domain).nice();
            axis = svg.selectAll(".y2.axis").call(scales.y2Axis);

            if (options.axes.y2.ticksRotate != null) {
                return axis.selectAll(".tick>text").attr("transform", "rotate(" + options.axes.y2.ticksRotate + " 6,0)").style("text-anchor", "start");
            }
        }
    },
    getVerticalDomain: function(options, data, series, key) {
        var domain, mySeries, o;
        if (!(o = options.axes[key])) {
            return [];
        }

        if ((o.ticks != null) && angular.isArray(o.ticks)) {
            return [o.ticks[0], o.ticks[o.ticks.length - 1]];
        }

        mySeries = series.filter((s) => s.axis === key && s.visible !== false);

        domain = this.yExtent(series.filter((s) => s.axis === key && s.visible !== false), data, options.stacks.filter((stack) => stack.axis === key));
        if (o.type === "log") {
            domain[0] = domain[0] === 0 ? 0.001 : domain[0];
        }

        if (o.min != null) {
            domain[0] = o.min;
        }
        if (o.max != null) {
            domain[1] = o.max;
        }

        return domain;
    },
    yExtent: (series, data, stacks) => {
        var groups, maxY, minY;
        minY = Number.POSITIVE_INFINITY;
        maxY = Number.NEGATIVE_INFINITY;

        groups = [];
        stacks.forEach((stack) => groups.push(stack.series.map((id) => (series.filter((s) => s.id === id))[0])));

        series.forEach((series, i) => {
            var isInStack;
            isInStack = false;

            stacks.forEach((stack) => {
                var _ref;
                if (_ref = series.id, __indexOf.call(stack.series, _ref) >= 0) {
                    return isInStack = true;
                }
            });

            if (!isInStack) {
                return groups.push([series]);
            }
        });

        groups.forEach((group) => {
            group = group.filter(Boolean);
            minY = Math.min(minY, d3.min(data, (d) => group.reduce(((a, s) => Math.min(a, d[s.y])), Number.POSITIVE_INFINITY)));
            return maxY = Math.max(maxY, d3.max(data, (d) => group.reduce(((a, s) => a + d[s.y]), 0)));
        });

        if (minY === maxY) {
            if (minY > 0) {
                return [0, minY * 2];
            } else {
                return [minY * 2, 0];
            }
        }

        return [minY, maxY];
    },
    setXScale: function(xScale, data, series, axesOptions) {
        var domain, o;
        domain = this.xExtent(data, axesOptions.x.key);
        if (series.filter((s) => s.type === "column").length) {
            this.adjustXDomainForColumns(domain, data, axesOptions.x.key);
        }

        o = axesOptions.x;
        if (o.min != null) {
            domain[0] = o.min;
        }
        if (o.max != null) {
            domain[1] = o.max;
        }

        return xScale.domain(domain);
    },
    xExtent: (data, key) => {
        var from, to, _ref;
        _ref = d3.extent(data, (d) => d[key]), from = _ref[0], to = _ref[1];

        if (from === to) {
            if (from > 0) {
                return [0, from * 2];
            } else {
                return [from * 2, 0];
            }
        }

        return [from, to];
    },
    adjustXDomainForColumns: function(domain, data, field) {
        var step;
        step = this.getAverageStep(data, field);

        if (angular.isDate(domain[0])) {
            domain[0] = new Date(domain[0].getTime() - step);
            return domain[1] = new Date(domain[1].getTime() + step);
        } else {
            domain[0] = domain[0] - step;
            return domain[1] = domain[1] + step;
        }
    },
    getAverageStep: (data, field) => {
        var i, n, sum;
        if (!(data.length > 1)) {
            return 0;
        }
        sum = 0;
        n = data.length - 1;
        i = 0;
        while (i < n) {
            sum += data[i + 1][field] - data[i][field];
            i++;
        }

        return sum / n;
    },
    haveSecondYAxis: (series) => !series.every((s) => s.axis !== "y2")
});
