$(function () {
    $.get('/graphsData', function (data) {

        var trace1 = {
            x: data["x1"],
            y: data["y1"],
            type: 'scatter',
            name : data["m1"]
        };
        var trace2 = {
            x: data["x2"],
            y: data["y2"],
            type: 'scatter',
            name : data["m2"]
        };
        var trace3 = {
            x: [0,31],
            y: [data["budget"],data["budget"]],
            type: 'lines',
            name : 'Budget',
            line : {
                dash: 'dot',
                width: 4,
                color : 'rgba(255, 0, 0, 1)'
            }
        };
        var data = [trace1, trace2, trace3];
        var layout = {
            title: 'Expense Graph',
            xaxis: {
                title: 'Dates',
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                title: 'Money Spent(in Rs.)',
                showline: false
            }
        };

        Plotly.newPlot('graph1', data, layout);
    });
});