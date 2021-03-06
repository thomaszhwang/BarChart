function BarChart(canvas_selector, data_path, metadata, configurations) {
    var margins = configurations.margins || {
        top: 20, right: 30, bottom: 30, left: 40
    };
    var axis_font = configurations.axis_font || "12px sans-serif";
    var axis_line_color = configurations.axis_line_color || "#000";
    var show_x_axis = true;
    if (configurations.show_x_axis != undefined)
        show_x_axis = configurations.show_x_axis;
    var y_axis_label = configurations.y_axis_label || "";

    var width = $(canvas_selector).width() - margins.left - margins.right;
    var height = $(canvas_selector).height() - margins.top - margins.bottom;

    $.get(data_path, function(data) {
        var results = __readData(data, metadata);

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(results.rows.map(function(d) {
                return d[metadata[0].field_name];
            }));

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, Math.max.apply(Math, results.rows.map(function(d) {
                return d[metadata[1].field_name];
            }))])

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10);

        var chart = d3.select(canvas_selector)
            .attr("width", width + margins.left + margins.right)
            .attr("height", height + margins.top + margins.bottom)
          .append("g")
            .attr("transform",
                "translate(" + margins.left + ", " + margins.top + ")");
    
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);

        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(y_axis_label);

        chart.selectAll("g.axis").style("font", axis_font);
        chart.selectAll("g.axis path, g.axis line").style({
            "fill": "none",
            "stroke": axis_line_color,
            "shape-rendering": "crispEdges"
        });
        if (show_x_axis == false) chart.selectAll("g.x.axis path").style({
            "display": "none"
        });

        chart.selectAll(".bar")
            .data(results.rows)
          .enter().append("rect")
            .attr("x", function(d) { return x(d.month); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.total_spending); })
            .attr("height", function(d) { return height - y(d.total_spending); } )
            .style("fill", "steelblue");
    })

    /*console.log($(".axis").length);

    $(".axis path, .axis line").css({
        
    });

    $(".x.axis path").css("display", "none");*/
}

function __readData(data, metadata) {
    var results = {};
    results["rows"] = [];
        
    var splitted_rows = data.split("\\n");
    $.each(splitted_rows, function(i, raw_row) {
        raw_row = raw_row.trim();
        if (raw_row != '') {
            var row = {};
            var splitted_fields = raw_row.split("\\t");
            $.each(splitted_fields, function(j, raw_field) {
                if (j < metadata.length) {
                    var field_name = metadata[j].field_name;
                    var data_type = metadata[j].data_type;
                    if (data_type == "STRING")
                        row[field_name] = raw_field;
                    else if (data_type == "NUMERIC")
                        row[field_name] = +raw_field;
                    else
                        throw "unrecognized data type " + data_type;
                }
            })
            results["rows"].push(row);
        }
    })

    return results;
}
