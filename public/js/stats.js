$(function () {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

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
        var graphData = [trace1, trace2, trace3];
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
            },
            height: h/2*0.9,
            width: w*0.7
        };

        Plotly.newPlot('graph1', graphData, layout);

        if(data["x3"].length>0 && data["x4"].length>0){
            var chartData = [{
                values: data["y3"],
                labels: data["x3"],
                name: 'Previous Month',
                hoverinfo: 'label+percent+name',
                hole: .4,
                type: 'pie'
            },{
                values: data["y4"],
                labels: data["x4"],
                text: 'CO2',
                textposition: 'inside',
                name: 'This Month',
                hoverinfo: 'label+percent+name',
                hole: .4,
                type: 'pie'
            }];

            var layout1 = {
                title: 'Category-wise Expenditure',
                annotations: [
                    {
                        font: {
                            size: 20
                        },
                        showarrow: false,
                        text: 'Previous Month',
                        x: 0.215,
                        y: -0.25
                    },
                    {
                        font: {
                            size: 20
                        },
                        showarrow: false,
                        text: 'This Month',
                        x: 0.82,
                        y: -0.25
                    }
                ],
                height: h/2*0.9,
                width: w*0.7
            };
            Plotly.newPlot('chart', chartData, layout1);
        } else if(data["x3"].length>0){
            var chartData = [{
                values: data["y3"],
                labels: data["x3"],
                name: 'Previous Month',
                hoverinfo: 'label+percent+name',
                hole: .4,
                type: 'pie'
            }];

            var layout1 = {
                title: 'Category-wise Expenditure',
                annotations:[
                    {
                        font: {
                            size: 20
                        },
                        showarrow: false,
                        text: 'Previous Month',
                        x: 0.5,
                        y: -0.25
                    }]
                ,
                height: h/2*0.9,
                width: w*0.7
            };
            Plotly.newPlot('chart', chartData, layout1);
        } else if(data["x4"].length>0){
            var chartData = [{
                values: data["y4"],
                labels: data["x4"],
                name: 'This Month',
                hoverinfo: 'label+percent+name',
                hole: .4,
                type: 'pie'
            }];

            var layout1 = {
                title: 'Category-wise Expenditure',
                annotations:[
                    {
                        font: {
                            size: 20
                        },
                        showarrow: false,
                        text: 'This Month',
                        x: 0.5,
                        y: -0.25
                    }]
                ,
                height: h/2*0.9,
                width: w*0.7
            };
            Plotly.newPlot('chart', chartData, layout1);
        }

    });
});
