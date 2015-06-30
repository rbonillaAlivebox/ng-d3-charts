({
    addPatterns: (svg, series) => {
        var pattern;
        pattern = svg.select("defs").selectAll("pattern").data(series.filter((s) => s.striped)).enter().append("pattern").attr({
            id: (s) => s.type + "Pattern_" + s.index,
            patternUnits: "userSpaceOnUse",
            x: 0,
            y: 0,
            width: 60,
            height: 60
        }).append("g").style({
            "fill": (s) => s.color,
            "fill-opacity": 0.3
        });

        pattern.append("rect").style("fill-opacity", 0.3).attr("width", 60).attr("height", 60);

        pattern.append("path").attr("d", "M 10 0 l10 0 l -20 20 l 0 -10 z");

        pattern.append("path").attr("d", "M40 0 l10 0 l-50 50 l0 -10 z");

        pattern.append("path").attr("d", "M60 10 l0 10 l-40 40 l-10 0 z");

        return pattern.append("path").attr("d", "M60 40 l0 10 l-10 10 l -10 0 z");
    },
    drawArea: function(svg, scales, data, options) {
        var areaSeries, drawers;
        areaSeries = data.filter((series) => series.type === "area");

        this.addPatterns(svg, areaSeries);

        drawers = {
            y: this.createLeftAreaDrawer(scales, options.lineMode, options.tension),
            y2: this.createRightAreaDrawer(scales, options.lineMode, options.tension)
        };

        svg.select(".content").selectAll(".areaGroup").data(areaSeries).enter().append("g").attr("class", (s) => "areaGroup " + "series_" + s.index).append("path").attr("class", "area").style("fill", (s) => {
            if (s.striped !== true) {
                return s.color;
            }
            return "url(#areaPattern_" + s.index + ")";
        }).style("opacity", (s) => {
            if (s.striped) {
                return "1";
            } else {
                return "0.3";
            }
        }).attr("d", (d) => drawers[d.axis](d.values));

        return this;
    },
    createLeftAreaDrawer: (scales, mode, tension) => d3.svg.area().x((d) => scales.xScale(d.x).y0((d) => scales.yScale(d.y0).y1((d) => scales.yScale(d.y0 + d.y).interpolate(mode).tension(tension)))),
    createRightAreaDrawer: (scales, mode, tension) => d3.svg.area().x((d) => scales.xScale(d.x).y0((d) => scales.y2Scale(d.y0).y1((d) => scales.y2Scale(d.y0 + d.y).interpolate(mode).tension(tension))))
});
