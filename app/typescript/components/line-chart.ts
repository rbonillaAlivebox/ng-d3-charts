var m, old_m;

old_m = angular.module("n3-charts.linechart", ["n3charts.utils"]);
m = angular.module("n3-line-chart", ["n3charts.utils"]);

function directive(name, conf) {
    old_m.directive(name, conf);
    return m.directive(name, conf);
}

directive("linechart", [
    "n3utils", "$window", "$timeout", (n3utils, $window, $timeout) => {
        function link(scope, element, attrs, ctrl) {
            var dispatch, id, initialHandlers, isUpdatingOptions, promise, _u;
            _u = n3utils;
            dispatch = _u.getEventDispatcher();
            id = _u.uuid();

            // Hacky hack so the chart doesn't grow in height when resizing...
            element[0].style["font-size"] = 0;

            scope.redraw = () => {
                scope.update();

            };

            isUpdatingOptions = false;
            initialHandlers = {
                onSeriesVisibilityChange: (_arg) => {
                    var index, newVisibility, series, _arg;
                    series = _arg.series, index = _arg.index, newVisibility = _arg.newVisibility;
                    scope.options.series[index].visible = newVisibility;
                    return scope.$apply();
                }
            };

            scope.update = () => {
                var axes, columnWidth, dataPerSeries, dimensions, handlers, isThumbnail, options, svg;
                options = _u.sanitizeOptions(scope.options, attrs.mode);
                handlers = angular.extend(initialHandlers, _u.getTooltipHandlers(options));
                dataPerSeries = _u.getDataPerSeries(scope.data, options);
                dimensions = _u.getDimensions(options, element, attrs);
                isThumbnail = attrs.mode === "thumbnail";

                _u.clean(element[0]);

                svg = _u.bootstrap(element[0], id, dimensions);

                function fn(key) {
                    return (options.series.filter((s) => s.axis === key && s.visible !== false)).length > 0;
                }

                axes = _u.createAxes(svg, dimensions, options.axes).andAddThemIf({
                    all: !isThumbnail,
                    x: true,
                    y: fn("y"),
                    y2: fn("y2")
                });

                if (dataPerSeries.length) {
                    _u.setScalesDomain(axes, scope.data, options.series, svg, options);
                }

                _u.createContent(svg, id, options, handlers);

                if (dataPerSeries.length) {
                    columnWidth = _u.getBestColumnWidth(axes, dimensions, dataPerSeries, options);

                    _u.drawArea(svg, axes, dataPerSeries, options, handlers).drawColumns(svg, axes, dataPerSeries, columnWidth, options, handlers, dispatch).drawLines(svg, axes, dataPerSeries, options, handlers);

                    if (options.drawDots) {
                        _u.drawDots(svg, axes, dataPerSeries, options, handlers, dispatch);
                    }
                }

                if (options.drawLegend) {
                    _u.drawLegend(svg, options.series, dimensions, handlers, dispatch);
                }

                if (options.tooltip.mode === "scrubber") {
                    return _u.createGlass(svg, dimensions, handlers, axes, dataPerSeries, options, dispatch, columnWidth);
                } else if (options.tooltip.mode !== "none") {
                    return _u.addTooltips(svg, dimensions, options.axes);
                }
            };

            function updateEvents() {
                // Deprecated: this will be removed in 2.x
                if (scope.oldclick) {
                    dispatch.on("click", scope.oldclick);
                } else if (scope.click) {
                    dispatch.on("click", scope.click);
                } else {
                    dispatch.on("click", null);
                }

                // Deprecated: this will be removed in 2.x
                if (scope.oldhover) {
                    dispatch.on("hover", scope.oldhover);
                } else if (scope.hover) {
                    dispatch.on("hover", scope.hover);
                } else {
                    dispatch.on("hover", null);
                }

                // Deprecated: this will be removed in 2.x
                if (scope.oldfocus) {
                    dispatch.on("focus", scope.oldfocus);
                } else if (scope.focus) {
                    dispatch.on("focus", scope.focus);
                } else {
                    dispatch.on("focus", null);
                }

                if (scope.toggle) {
                    return dispatch.on("toggle", scope.toggle);
                } else {
                    return dispatch.on("toggle", null);
                }
            }

            promise = void 0;
            function window_resize() {
                if (promise != null) {
                    $timeout.cancel(promise);
                }
                return promise = $timeout(scope.redraw, 1);
            }

            $window.addEventListener("resize", window_resize);

            scope.$watch("data", scope.redraw, true);
            scope.$watch("options", scope.redraw, true);
            scope.$watchCollection("[click, hover, focus, toggle]", updateEvents);

            // Deprecated: this will be removed in 2.x
            scope.$watchCollection("[oldclick, oldhover, oldfocus]", updateEvents);

        }

        return {
            replace: true,
            restrict: "E",
            scope: {
                data: "=",
                options: "=",
                // Deprecated: this will be removed in 2.x
                oldclick: "=click",
                oldhover: "=hover",
                oldfocus: "=focus",
                // Events
                click: "=onClick",
                hover: "=onHover",
                focus: "=onFocus",
                toggle: "=onToggle"
            },
            template: "<div></div>",
            link: link
        };
    }
]);
