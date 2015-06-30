({
    drawDots: function(svg, axes, data, options, handlers, dispatch) {
        var dotGroup;
        dotGroup = svg.select(".content").selectAll(".dotGroup").data(data.filter((s) => {
            var _ref;
            return ((_ref = s.type) === "line" || _ref === "area") && s.drawDots.enter().append("g");
        }));
        dotGroup.attr({
            "class": (s) => "dotGroup series_" + s.index,
            fill: (s) => s.color
        }).selectAll(".dot").data((d) => d.values.enter().append("circle").attr({
                "class": "dot",
                "r": (d) => d.dotSize,
                "cx": (d) => axes.xScale(d.x),
                "cy": (d) => axes[d.axis + "Scale"](d.y + d.y0)
            }).style({
                "stroke": "white",
                "stroke-width": "2px"
            }).on({
                "click": (d, i) => dispatch.click(d, i)
            }).on({
                "mouseover": (d, i) => dispatch.hover(d, i)
            }));

        if (options.tooltip.mode !== "none") {
            dotGroup.on("mouseover", (series) => {
                var d, target;
                target = d3.select(d3.event.target);
                d = target.datum();
                target.attr("r", (s) => s.dotSize + 2);

                return typeof handlers.onMouseOver === "function" ? handlers.onMouseOver(svg, {
                    series: series,
                    x: target.attr("cx"),
                    y: target.attr("cy"),
                    datum: d
                }, options.axes) : void 0;
            }).on("mouseout", (d) => {
                d3.select(d3.event.target).attr("r", (s) => s.dotSize);
                return typeof handlers.onMouseOut === "function" ? handlers.onMouseOut(svg) : void 0;
            });
        }

        return this;
    }
});
