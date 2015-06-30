({
    drawDots: function (svg, axes, data, options, handlers, dispatch) {
        var dotGroup;
        dotGroup = svg.select(".content").selectAll(".dotGroup").data(data.filter(function (s) {
            var _ref;
            return ((_ref = s.type) === "line" || _ref === "area") && s.drawDots.enter().append("g");
        }));
        dotGroup.attr({
            "class": function (s) { return "dotGroup series_" + s.index; },
            fill: function (s) { return s.color; }
        }).selectAll(".dot").data(function (d) { return d.values.enter().append("circle").attr({
            "class": "dot",
            "r": function (d) { return d.dotSize; },
            "cx": function (d) { return axes.xScale(d.x); },
            "cy": function (d) { return axes[d.axis + "Scale"](d.y + d.y0); }
        }).style({
            "stroke": "white",
            "stroke-width": "2px"
        }).on({
            "click": function (d, i) { return dispatch.click(d, i); }
        }).on({
            "mouseover": function (d, i) { return dispatch.hover(d, i); }
        }); });
        if (options.tooltip.mode !== "none") {
            dotGroup.on("mouseover", function (series) {
                var d, target;
                target = d3.select(d3.event.target);
                d = target.datum();
                target.attr("r", function (s) { return s.dotSize + 2; });
                return typeof handlers.onMouseOver === "function" ? handlers.onMouseOver(svg, {
                    series: series,
                    x: target.attr("cx"),
                    y: target.attr("cy"),
                    datum: d
                }, options.axes) : void 0;
            }).on("mouseout", function (d) {
                d3.select(d3.event.target).attr("r", function (s) { return s.dotSize; });
                return typeof handlers.onMouseOut === "function" ? handlers.onMouseOut(svg) : void 0;
            });
        }
        return this;
    }
});
