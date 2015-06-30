({
    computeLegendLayout: function (svg, series, dimensions) {
        var cumul, i, j, leftLayout, leftWidths, padding, rightLayout, rightWidths, that, w;
        padding = 10;
        that = this;
        leftWidths = this.getLegendItemsWidths(svg, "y");
        leftLayout = [0];
        i = 1;
        while (i < leftWidths.length) {
            leftLayout.push(leftWidths[i - 1] + leftLayout[i - 1] + padding);
            i++;
        }
        rightWidths = this.getLegendItemsWidths(svg, "y2");
        if (!(rightWidths.length > 0)) {
            return [leftLayout];
        }
        w = dimensions.width - dimensions.right - dimensions.left;
        cumul = 0;
        rightLayout = [];
        j = rightWidths.length - 1;
        while (j >= 0) {
            rightLayout.push(w - cumul - rightWidths[j]);
            cumul += rightWidths[j] + padding;
            j--;
        }
        rightLayout.reverse();
        return [leftLayout, rightLayout];
    },
    getLegendItemsWidths: function (svg, axis) {
        var i, items, that, widths;
        that = this;
        function bbox(t) {
            return that.getTextBBox(t).width;
        }
        items = svg.selectAll(".legendItem." + axis);
        if (!(items.length > 0)) {
            return [];
        }
        widths = [];
        i = 0;
        while (i < items[0].length) {
            widths.push(bbox(items[0][i]));
            i++;
        }
        return widths;
    },
    drawLegend: function (svg, series, dimensions, handlers, dispatch) {
        var d, groups, legend, that, _ref;
        that = this;
        legend = svg.append("g").attr("class", "legend");
        d = 16;
        svg.select("defs").append("svg:clipPath").attr("id", "legend-clip").append("circle").attr("r", d / 2);
        groups = legend.selectAll(".legendItem").data(series);
        groups.enter().append("g").on("click", function (s, i) {
            var visibility;
            visibility = !(s.visible !== false);
            dispatch.toggle(s, i, visibility);
            return typeof handlers.onSeriesVisibilityChange === "function" ? handlers.onSeriesVisibilityChange({
                series: s,
                index: i,
                newVisibility: visibility
            }) : void 0;
        });
        groups.attr({
            "class": function (s, i) { return "legendItem series_" + i + " " + s.axis; },
            "opacity": function (s, i) {
                if (s.visible === false) {
                    that.toggleSeries(svg, i);
                    return "0.2";
                }
                return "1";
            }
        }).each(function (s) {
            var item;
            item = d3.select(this);
            return item.append("circle").attr({
                "fill": s.color,
                "stroke": s.color,
                "stroke-width": "2px",
                "r": d / 2
            });
        });
        item.append("path").attr({
            "clip-path": "url(#legend-clip)",
            "fill-opacity": (_ref = s.type) === "area" || _ref === "column" ? "1" : "0",
            "fill": "white",
            "stroke": "white",
            "stroke-width": "2px",
            "d": that.getLegendItemPath(s, d, d)
        });
        item.append("circle").attr({
            "fill-opacity": 0,
            "stroke": s.color,
            "stroke-width": "2px",
            "r": d / 2
        });
        item.append("text").attr({
            "class": function (d, i) { return "legendText series_" + i; },
            "font-family": "Courier",
            "font-size": 10,
            "transform": "translate(13, 4)",
            "text-rendering": "geometric-precision"
        }).text(s.label || s.y);
        // Translate every legend g node to its position
        function translateLegends() {
            var left, right, _ref1;
            _ref1 = that.computeLegendLayout(svg, series, dimensions), left = _ref1[0], right = _ref1[1];
            return groups.attr({
                "transform": function (s, i) {
                    if (s.axis === "y") {
                        return "translate(" + (left.shift()) + "," + (dimensions.height - 40) + ")";
                    }
                    else {
                        return "translate(" + (right.shift()) + "," + (dimensions.height - 40) + ")";
                    }
                }
            });
        }
        // We need to call this once, so the
        // legend text does not blink on every update
        translateLegends();
        // now once again,
        // to make sure, text width gets really! computed properly
        setTimeout(translateLegends, 0);
        return this;
    },
    getLegendItemPath: function (series, w, h) {
        var base_path, path;
        if (series.type === "column") {
            path = "M" + (-w / 3) + " " + (-h / 8) + " l0 " + h + " ";
            path += "M0" + " " + (-h / 3) + " l0 " + h + " ";
            path += "M" + w / 3 + " " + (-h / 10) + " l0 " + h + " ";
            return path;
        }
        base_path = "M-" + w / 2 + " 0" + h / 3 + " l" + w / 3 + " -" + h / 3 + " l" + w / 3 + " " + h / 3 + " l" + w / 3 + " -" + 2 * h / 3;
        if (series.type === "area") {
            base_path + " l0 " + h + " l-" + w + " 0z";
        }
        return base_path;
    },
    toggleSeries: function (svg, index) {
        var isVisible;
        isVisible = false;
        svg.select(".content").selectAll(".series_" + index).style("display", function (s) {
            if (d3.select(this).style("display") === "none") {
                isVisible = true;
                return "initial";
            }
            else {
                isVisible = false;
                return "none";
            }
        });
        return isVisible;
    }
});
