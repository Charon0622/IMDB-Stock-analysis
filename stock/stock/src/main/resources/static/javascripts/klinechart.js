var upColor = '#00da3c';
var downColor = '#ec0000';

function splitData(rawData) {
    var categoryData = [];
    var values = [];
    var volumes = [];
    for (var i = 0; i < rawData.length; i++) {
        categoryData.push(rawData[i].splice(0, 1)[0]);
        values.push(rawData[i]);
        volumes.push([i, rawData[i][7], rawData[i][0] > rawData[i][1] ? 1 : -1]);
    }

    return {
        categoryData: categoryData,
        values: values,
        volumes: volumes
    };
}

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.values.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1];
        }
        result.push(+(sum / dayCount).toFixed(3));
    }
    return result;
}

function getMA(dataCount, data){
    var result = [];
    for (var i = 0, len = data.values.length ; i < len; i++) {
        result.push(data.values[i][dataCount]);
    }
    return result;
}

var timeK = angular.module('timeK', []);
timeK.controller('timeKCtrl', function ($scope, $http) {
    $http({
        method: 'POST',
        url: '/api/history/days',
        data: {"code": "600121"}
    }).then(function successCallback(response) {
        var myChart = echarts.init(document.getElementById('timeKMain'));
        var rawData = response.data;
        console.log(rawData);
        var data = splitData(rawData);
        console.log(data);
        myChart.setOption(option = {
            backgroundColor: '#fff',
            animation: false,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(245, 245, 245, 0.8)',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = {top: 10};
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
                // extraCssText: 'width: 170px'
            },
            axisPointer: {
                link: {xAxisIndex: 'all'},
                label: {
                    backgroundColor: '#777'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.1
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 4,
                dimension: 2,
                pieces: [{
                    value: 1,
                    color: downColor
                }, {
                    value: -1,
                    color: upColor
                }]
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '63%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    splitLine: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                    // axisPointer: {
                    //     label: {
                    //         formatter: function (params) {
                    //             var seriesValue = (params.seriesData[0] || {}).value;
                    //             return params.value
                    //             + (seriesValue != null
                    //                 ? '\n' + echarts.format.addCommas(seriesValue)
                    //                 : ''
                    //             );
                    //         }
                    //     }
                    // }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 98,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: 98,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'Dow-Jones index',
                    type: 'candlestick',
                    data: data.values,
                    itemStyle: {
                        normal: {
                            color: upColor,
                            color0: downColor,
                            borderColor: null,
                            borderColor0: null
                        }
                    },
                    tooltip: {
                        formatter: function (param) {
                            param = param[0];
                            return [
                                'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                'Open: ' + param.data[0] + '<br/>',
                                'Close: ' + param.data[1] + '<br/>',
                                'Lowest: ' + param.data[2] + '<br/>',
                                'Highest: ' + param.data[3] + '<br/>'
                            ].join('');
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: getMA(4, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: getMA(5, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: getMA(6, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                // {
                //     name: 'MA30',
                //     type: 'line',
                //     data: calculateMA(30, data),
                //     smooth: true,
                //     lineStyle: {
                //         normal: {opacity: 0.5}
                //     }
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: data.volumes
                }
            ]
        }, true);

        // myChart.on('brushSelected', renderBrushed);

        // function renderBrushed(params) {
        //     var sum = 0;
        //     var min = Infinity;
        //     var max = -Infinity;
        //     var countBySeries = [];
        //     var brushComponent = params.brushComponents[0];

        //     var rawIndices = brushComponent.series[0].rawIndices;
        //     for (var i = 0; i < rawIndices.length; i++) {
        //         var val = data.values[rawIndices[i]][1];
        //         sum += val;
        //         min = Math.min(val, min);
        //         max = Math.max(val, max);
        //     }

        //     panel.innerHTML = [
        //         '<h3>STATISTICS:</h3>',
        //         'SUM of open: ' + (sum / rawIndices.length).toFixed(4) + '<br>',
        //         'MIN of open: ' + min.toFixed(4) + '<br>',
        //         'MAX of open: ' + max.toFixed(4) + '<br>'
        //     ].join(' ');
        // }

        myChart.dispatchAction({
            type: 'brush',
            areas: [
                {
                    brushType: 'lineX',
                    coordRange: ['2016-06-02', '2016-06-20'],
                    xAxisIndex: 0
                }
            ]
        });

    }, function errorCallback(response) {
        alert("不存在这支股票。");
    });
});

timeK.controller('dayKCtrl', function ($scope, $http) {
    $http({
        method: 'POST',
        url: '/api/history/days',
        data: {"code": "600121"}
    }).then(function successCallback(response) {
        var myChart = echarts.init(document.getElementById('dayKMain'));
        var rawData = response.data;
        console.log(rawData);
        var data = splitData(rawData);
        console.log(data);
        myChart.setOption(option = {
            backgroundColor: '#fff',
            animation: false,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(245, 245, 245, 0.8)',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = {top: 10};
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
                // extraCssText: 'width: 170px'
            },
            axisPointer: {
                link: {xAxisIndex: 'all'},
                label: {
                    backgroundColor: '#777'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.1
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 4,
                dimension: 2,
                pieces: [{
                    value: 1,
                    color: downColor
                }, {
                    value: -1,
                    color: upColor
                }]
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '63%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    splitLine: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                    // axisPointer: {
                    //     label: {
                    //         formatter: function (params) {
                    //             var seriesValue = (params.seriesData[0] || {}).value;
                    //             return params.value
                    //             + (seriesValue != null
                    //                 ? '\n' + echarts.format.addCommas(seriesValue)
                    //                 : ''
                    //             );
                    //         }
                    //     }
                    // }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 98,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: 98,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'Dow-Jones index',
                    type: 'candlestick',
                    data: data.values,
                    itemStyle: {
                        normal: {
                            color: upColor,
                            color0: downColor,
                            borderColor: null,
                            borderColor0: null
                        }
                    },
                    tooltip: {
                        formatter: function (param) {
                            param = param[0];
                            return [
                                'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                'Open: ' + param.data[0] + '<br/>',
                                'Close: ' + param.data[1] + '<br/>',
                                'Lowest: ' + param.data[2] + '<br/>',
                                'Highest: ' + param.data[3] + '<br/>'
                            ].join('');
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: getMA(4, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: getMA(5, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: getMA(6, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                // {
                //     name: 'MA30',
                //     type: 'line',
                //     data: calculateMA(30, data),
                //     smooth: true,
                //     lineStyle: {
                //         normal: {opacity: 0.5}
                //     }
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: data.volumes
                }
            ]
        }, true);

        // myChart.on('brushSelected', renderBrushed);

        // function renderBrushed(params) {
        //     var sum = 0;
        //     var min = Infinity;
        //     var max = -Infinity;
        //     var countBySeries = [];
        //     var brushComponent = params.brushComponents[0];

        //     var rawIndices = brushComponent.series[0].rawIndices;
        //     for (var i = 0; i < rawIndices.length; i++) {
        //         var val = data.values[rawIndices[i]][1];
        //         sum += val;
        //         min = Math.min(val, min);
        //         max = Math.max(val, max);
        //     }

        //     panel.innerHTML = [
        //         '<h3>STATISTICS:</h3>',
        //         'SUM of open: ' + (sum / rawIndices.length).toFixed(4) + '<br>',
        //         'MIN of open: ' + min.toFixed(4) + '<br>',
        //         'MAX of open: ' + max.toFixed(4) + '<br>'
        //     ].join(' ');
        // }

        myChart.dispatchAction({
            type: 'brush',
            areas: [
                {
                    brushType: 'lineX',
                    coordRange: ['2016-06-02', '2016-06-20'],
                    xAxisIndex: 0
                }
            ]
        });

    }, function errorCallback(response) {
        alert("不存在这支股票。");
    });
});

timeK.controller('weekKCtrl', function ($scope, $http) {
    $http({
        method: 'POST',
        url: '/api/history/days',
        data: {"code": "600121"}
    }).then(function successCallback(response) {
        var myChart = echarts.init(document.getElementById('weekKMain'));
        var rawData = response.data;
        console.log(rawData);
        var data = splitData(rawData);
        console.log(data);
        myChart.setOption(option = {
            backgroundColor: '#fff',
            animation: false,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(245, 245, 245, 0.8)',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = {top: 10};
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
                // extraCssText: 'width: 170px'
            },
            axisPointer: {
                link: {xAxisIndex: 'all'},
                label: {
                    backgroundColor: '#777'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.1
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 4,
                dimension: 2,
                pieces: [{
                    value: 1,
                    color: downColor
                }, {
                    value: -1,
                    color: upColor
                }]
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '63%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    splitLine: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                    // axisPointer: {
                    //     label: {
                    //         formatter: function (params) {
                    //             var seriesValue = (params.seriesData[0] || {}).value;
                    //             return params.value
                    //             + (seriesValue != null
                    //                 ? '\n' + echarts.format.addCommas(seriesValue)
                    //                 : ''
                    //             );
                    //         }
                    //     }
                    // }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 98,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: 98,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'Dow-Jones index',
                    type: 'candlestick',
                    data: data.values,
                    itemStyle: {
                        normal: {
                            color: upColor,
                            color0: downColor,
                            borderColor: null,
                            borderColor0: null
                        }
                    },
                    tooltip: {
                        formatter: function (param) {
                            param = param[0];
                            return [
                                'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                'Open: ' + param.data[0] + '<br/>',
                                'Close: ' + param.data[1] + '<br/>',
                                'Lowest: ' + param.data[2] + '<br/>',
                                'Highest: ' + param.data[3] + '<br/>'
                            ].join('');
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: getMA(4, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: getMA(5, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: getMA(6, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                // {
                //     name: 'MA30',
                //     type: 'line',
                //     data: calculateMA(30, data),
                //     smooth: true,
                //     lineStyle: {
                //         normal: {opacity: 0.5}
                //     }
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: data.volumes
                }
            ]
        }, true);

        // myChart.on('brushSelected', renderBrushed);

        // function renderBrushed(params) {
        //     var sum = 0;
        //     var min = Infinity;
        //     var max = -Infinity;
        //     var countBySeries = [];
        //     var brushComponent = params.brushComponents[0];

        //     var rawIndices = brushComponent.series[0].rawIndices;
        //     for (var i = 0; i < rawIndices.length; i++) {
        //         var val = data.values[rawIndices[i]][1];
        //         sum += val;
        //         min = Math.min(val, min);
        //         max = Math.max(val, max);
        //     }

        //     panel.innerHTML = [
        //         '<h3>STATISTICS:</h3>',
        //         'SUM of open: ' + (sum / rawIndices.length).toFixed(4) + '<br>',
        //         'MIN of open: ' + min.toFixed(4) + '<br>',
        //         'MAX of open: ' + max.toFixed(4) + '<br>'
        //     ].join(' ');
        // }

        myChart.dispatchAction({
            type: 'brush',
            areas: [
                {
                    brushType: 'lineX',
                    coordRange: ['2016-06-02', '2016-06-20'],
                    xAxisIndex: 0
                }
            ]
        });

    }, function errorCallback(response) {
        alert("不存在这支股票。");
    });
});

timeK.controller('monthKCtrl', function ($scope, $http) {
    $http({
        method: 'POST',
        url: '/api/history/days',
        data: {"code": "600121"}
    }).then(function successCallback(response) {
        var myChart = echarts.init(document.getElementById('monthKMain'));
        var rawData = response.data;
        console.log(rawData);
        var data = splitData(rawData);
        console.log(data);
        myChart.setOption(option = {
            backgroundColor: '#fff',
            animation: false,
            legend: {
                bottom: 10,
                left: 'center',
                data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                },
                backgroundColor: 'rgba(245, 245, 245, 0.8)',
                borderWidth: 1,
                borderColor: '#ccc',
                padding: 10,
                textStyle: {
                    color: '#000'
                },
                position: function (pos, params, el, elRect, size) {
                    var obj = {top: 10};
                    obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                    return obj;
                }
                // extraCssText: 'width: 170px'
            },
            axisPointer: {
                link: {xAxisIndex: 'all'},
                label: {
                    backgroundColor: '#777'
                }
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: false
                    },
                    brush: {
                        type: ['lineX', 'clear']
                    }
                }
            },
            brush: {
                xAxisIndex: 'all',
                brushLink: 'all',
                outOfBrush: {
                    colorAlpha: 0.1
                }
            },
            visualMap: {
                show: false,
                seriesIndex: 4,
                dimension: 2,
                pieces: [{
                    value: 1,
                    color: downColor
                }, {
                    value: -1,
                    color: upColor
                }]
            },
            grid: [
                {
                    left: '10%',
                    right: '8%',
                    height: '50%'
                },
                {
                    left: '10%',
                    right: '8%',
                    top: '63%',
                    height: '16%'
                }
            ],
            xAxis: [
                {
                    type: 'category',
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    splitLine: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                        z: 100
                    }
                },
                {
                    type: 'category',
                    gridIndex: 1,
                    data: data.categoryData,
                    scale: true,
                    boundaryGap : false,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false},
                    splitNumber: 20,
                    min: 'dataMin',
                    max: 'dataMax'
                    // axisPointer: {
                    //     label: {
                    //         formatter: function (params) {
                    //             var seriesValue = (params.seriesData[0] || {}).value;
                    //             return params.value
                    //             + (seriesValue != null
                    //                 ? '\n' + echarts.format.addCommas(seriesValue)
                    //                 : ''
                    //             );
                    //         }
                    //     }
                    // }
                }
            ],
            yAxis: [
                {
                    scale: true,
                    splitArea: {
                        show: true
                    }
                },
                {
                    scale: true,
                    gridIndex: 1,
                    splitNumber: 2,
                    axisLabel: {show: false},
                    axisLine: {show: false},
                    axisTick: {show: false},
                    splitLine: {show: false}
                }
            ],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 98,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
                    type: 'slider',
                    top: '85%',
                    start: 98,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'Dow-Jones index',
                    type: 'candlestick',
                    data: data.values,
                    itemStyle: {
                        normal: {
                            color: upColor,
                            color0: downColor,
                            borderColor: null,
                            borderColor0: null
                        }
                    },
                    tooltip: {
                        formatter: function (param) {
                            param = param[0];
                            return [
                                'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                'Open: ' + param.data[0] + '<br/>',
                                'Close: ' + param.data[1] + '<br/>',
                                'Lowest: ' + param.data[2] + '<br/>',
                                'Highest: ' + param.data[3] + '<br/>'
                            ].join('');
                        }
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: getMA(4, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: getMA(5, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: getMA(6, data),
                    smooth: true,
                    lineStyle: {
                        normal: {opacity: 0.5}
                    }
                },
                // {
                //     name: 'MA30',
                //     type: 'line',
                //     data: calculateMA(30, data),
                //     smooth: true,
                //     lineStyle: {
                //         normal: {opacity: 0.5}
                //     }
                // },
                {
                    name: 'Volume',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: data.volumes
                }
            ]
        }, true);

        // myChart.on('brushSelected', renderBrushed);

        // function renderBrushed(params) {
        //     var sum = 0;
        //     var min = Infinity;
        //     var max = -Infinity;
        //     var countBySeries = [];
        //     var brushComponent = params.brushComponents[0];

        //     var rawIndices = brushComponent.series[0].rawIndices;
        //     for (var i = 0; i < rawIndices.length; i++) {
        //         var val = data.values[rawIndices[i]][1];
        //         sum += val;
        //         min = Math.min(val, min);
        //         max = Math.max(val, max);
        //     }

        //     panel.innerHTML = [
        //         '<h3>STATISTICS:</h3>',
        //         'SUM of open: ' + (sum / rawIndices.length).toFixed(4) + '<br>',
        //         'MIN of open: ' + min.toFixed(4) + '<br>',
        //         'MAX of open: ' + max.toFixed(4) + '<br>'
        //     ].join(' ');
        // }

        myChart.dispatchAction({
            type: 'brush',
            areas: [
                {
                    brushType: 'lineX',
                    coordRange: ['2016-06-02', '2016-06-20'],
                    xAxisIndex: 0
                }
            ]
        });

    }, function errorCallback(response) {
        alert("不存在这支股票。");
    });
});
