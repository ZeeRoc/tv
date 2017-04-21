(function(win, dom, undefined) {

    'use strict'

    var ThreatView = function(type) {
        this.serverConfig = {
            type: 'http',
            ip: '192.168.223.66',
            port: 8000,
            router: '/query'
        };
        this.type = type;
        this.chart = null;
        this.mapPoint = [];
        this.mapLine = [];
        this.init.apply(this);
        this.geoCoord = {};
        this.level = ['skyblue', 'yellow', 'orange', 'red'];

    }

    ThreatView.prototype = {

        ajax: function(options) {

            options = options || {};

            options.type = (options.type || "GET").toUpperCase();

            options.dataType = options.dataType || "json";

            var arr = [];

            for (var name in options.data) {

                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(options.data[name]));

            }
            arr.push(("cache=" + Math.random()).replace(".", ""));

            var params = arr.join("&");

            if (window.XMLHttpRequest) {

                var xhr = new XMLHttpRequest();

            } else {

                var xhr = new ActiveXObject('Microsoft.XMLHTTP');

            }
            xhr.onreadystatechange = function() {

                if (xhr.readyState == 4) {

                    var status = xhr.status;

                    if (status >= 200 && status < 300) {

                        options.success && options.success(xhr.responseText, xhr.responseXML);

                    } else {

                        options.error && options.error(status);

                    }
                }
            }

            if (options.type == "GET") {

                xhr.open("GET", options.url + "?" + params, true);

                xhr.send(null);

            } else if (options.type == "POST") {

                xhr.open("POST", options.url, true);

                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xhr.send(params);
            }

        },
        data_driver: function(type) {

            var _self = this;

            switch (type) {
                case 'citys':
                    return Mock.mock({
                        'rank': [{
                            'citys': '@city',
                            'count': '@integer(10,100)'
                        }]
                    }).rank;
                    // break;
                case 'threaten':
                    return Mock.mock({
                        'threat': [{
                            'threat': '@cword("Trojan、Adware、Backdoor、Hacktool、Heuristic、TrojanDownloader", 3, 5)',
                            'count': '@integer(10,100)'
                        }]
                    }).threat;
                    // break;
                case 'threat':
                    return Mock.mock({
                        'threat': [{
                            'time': '@date("yyyy-MM-dd HH:mm:ss")',
                            'origins': '@city',
                            'ip': '@ip',
                            'target': '@city',
                            'protocol': '@protocol',
                            'port': '@integer(1000,9999)'
                        }]
                    }).threat;
                    // break;
            }
        },
        ip_generator: function(type, ip, port, router) {
            return type + '://' + ip + ':' + port + router;
        },
        generate_data: function(type) {

            var _self = this;

            _self.ajax({
                url: _self.ip_generator(_self.serverConfig.type, _self.serverConfig.ip, _self.serverConfig.port, _self.serverConfig.router),
                type: "POST",
                data: {
                    timestamp: new Date().getTime(),
                    type: type
                },
                dataType: "json",
                success: function(response) {

                    var data = JSON.parse(response),

                        addr_rank = data.country_rank || data.region_rank,

                        threat = data.threat,

                        v_type_rank = data.vtype_rank,

                        sec = setInterval(function() {

                            for (var threat_item in threat[0]) {

                                if (threat[0].length > 0) {

                                    _self.threat(threat[0][threat_item], _self.type)

                                    _self.add_point(threat[0][threat_item].city, threat[0][threat_item].vtype, threat[0][threat_item].longitude, threat[0][threat_item].latitude);

                                }
                            }
                            for (var city_rank in addr_rank) {

                                if (addr_rank[0] != null) {

                                    _self.citys_rank(addr_rank[0], _self.type);

                                }
                            }
                            for (var v_type in v_type_rank) {

                                if (v_type_rank[0] != null) {

                                    _self.threaten_rank(v_type_rank[0], _self.type);

                                }
                            }

                            threat.shift();
                            addr_rank.shift();
                            v_type_rank.shift();

                            if (threat.length == 0) {

                                clearInterval(sec)

                                _self.generate_data(_self.type);

                            }

                        }, 1000)
                    document.querySelector('.loading-data').style.display = 'none';

                },
                error: function(status) {
                    document.querySelector('.loading-data').style.display = 'block';
                    // console.log(status);
                    _self.init();
                }
            });
        },
        init: function() {

            var _self = this;

            _self.draw_map(_self.map_config(_self.type));

            _self.generate_data(_self.type);


            // setInterval(function() {

            //     console.log(_self.data_driver('citys')[0].citys)

            //     _self.add_line(_self.data_driver('citys')[0].citys, _self.data_driver('citys')[0].citys);

            // }, 100)

            setInterval(function() {

                _self.current_time();

            }, 1)
        },
        set_threat_color: function(threat) {
            var _self = this;
            var color_code = 0;

            switch (threat) {
                case 'Trojan':
                case 'Adware':
                case 'Backdoor':
                case 'HackTool':
                case 'Heuristic':
                case 'TrojanDownloader':
                    color_code = 0;
                    break;
                case 'DDoS':
                case 'Spyware':
                    color_code = 1;
                    break;
                case 'Virus':
                case 'Worm':
                    color_code = 2;
                    break;
                case 'Rootkit':
                case 'Exploit':
                    color_code = 3;
                    break;
            }

            return color_code;
        },
        map_config: function(type) {

            if (type == 'china') {

                return {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    legend: {
                        show: false,
                        orient: 'vertical',
                        x: 40,
                        y: 600,
                        itemWidth: 100,
                        itemHeight: 30,
                        data: ['World'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    dataRange: {
                        min: 0,
                        max: 3,
                        show: false,
                        calculable: true,
                        // color: ['#c9302c', '#ec971f', '#5bc0de', '#337ab7', 'rgba(0,0,0,0)'],
                        color: ['red', 'orange', 'yellow', 'skyblue'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: [{
                        name: 'World',
                        type: 'map',
                        roam: true,
                        hoverable: false,
                        mapType: 'china',
                        mapLocation: {
                            'x': 100,
                            'y': -10
                        },
                        itemStyle: {
                            normal: {
                                borderColor: 'lightskyblue',
                                borderWidth: 0.8,
                                areaStyle: {
                                    color: 'rgba(40,40,40,0)'
                                }
                            }
                        },
                        data: [
                            // { name: '北京', value: Math.round(Math.random() * 3) },
                            // { name: '天津', value: Math.round(Math.random() * 3) },
                            // { name: '上海', value: Math.round(Math.random() * 3) },
                            // { name: '广东', value: Math.round(Math.random() * 3) },
                            // { name: '台湾', value: Math.round(Math.random() * 3) },
                            // { name: '香港', value: Math.round(Math.random() * 3) },
                            // { name: '澳门', value: Math.round(Math.random() * 3) }
                        ]
                    }]
                };
            } else {
                return {
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    legend: {
                        show: false,
                        orient: 'vertical',
                        x: 40,
                        y: 600,
                        itemWidth: 100,
                        itemHeight: 30,
                        data: ['Rootkit、Exploit', 'Virus、Worm', 'DDoS、Spyware', 'Trojan、Adware、Backdoor、Hacktool、Heuristic、TrojanDownloader'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    dataRange: {
                        min: 0,
                        max: 3,
                        show: false,
                        calculable: true,
                        color: ['red', 'orange', 'yellow', 'skyblue'],
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    series: [{
                        name: 'Rootkit、Exploit',
                        type: 'map',
                        roam: true,
                        hoverable: false,
                        mapType: 'world',
                        mapLocation: {
                            'x': 200,
                            'y': 50
                        },
                        itemStyle: {
                            normal: {
                                borderColor: 'lightskyblue',
                                borderWidth: 0.8,
                                areaStyle: {
                                    color: 'rgba(40,40,40,0)'
                                }
                            }
                        },
                        data: []
                    }]

                }
            }
        },
        add_point: function(data, threat, x, y) {

            var _self = this;

            _self.mapPoint.push(data);

            _self.chart.addMarkPoint(0, {

                symbol: 'circle',
                symbolSize: function(v) {
                    return 10 + v / 10
                        // return 2
                },
                effect: {
                    show: true,
                    shadowBlur: 0,
                    loop: false,
                    period: 6,
                    scaleSize: 3
                },
                itemStyle: {
                    normal: {
                        label: {
                            show: false
                        }
                    },
                    emphasis: {
                        borderWidth: 0,
                        label: {
                            show: false
                        }
                    }
                },
                data: [{
                    name: data,
                    geoCoord: [x, y],
                    value: _self.set_threat_color(threat)
                }]
            });

            if (_self.chart._option.series[0].markPoint.data.length > 10000) {

                for (var i = 0; i < 10000; i++) {

                    _self.del_point();

                }

                _self.mapPoint = [];

                _self.chart._option.series[0].markPoint.data = [];

                _self.chart.refresh();
            }
        },
        del_point: function() {
            var _self = this,

                delName = _self.mapPoint.shift() || '';

            _self.chart.delMarkPoint(0, delName);

            return delName;

        },
        add_line: function(origin, target) {
            console.log(origin, target)
            var _self = this;

            _self.mapLine.push(origin + ' > ' + target);

            _self.chart.addMarkLine(0, {

                symbol: 'emptyCircle',
                clickable: false,
                smooth: true,
                effect: {
                    show: true,
                    scaleSize: 2,
                    period: 2,
                    color: 'red',
                    shadowBlur: 10
                },
                itemStyle: {
                    normal: {
                        borderWidth: 2,
                        label: {
                            show: false
                        },
                        lineStyle: {
                            color: 'rgba(0,0,0,0)'
                        }
                    }
                },
                data: [
                    [{ name: origin, smoothness: 0 }, { name: target, value: 100 }]
                ]

            });
        },
        del_line: function() {
            var _self = this,

                delName = _self.mapLine.shift() || '';

            _self.chart.delMarkLine(0, delName);

        },
        draw_map: function(option) {

            var _self = this;

            require.config({
                paths: {
                    echarts: './scripts'
                }
            });
            require(
                [
                    'echarts',
                    'echarts/chart/map'
                ],
                function(map) {
                    _self.chart = map.init(dom.getElementById('map-container'));
                    _self.chart.setOption(option);
                }
            );

        },
        threat: function(data, type) {
            var _self = this;

            var tpl = '';

            var threatCount = dom.getElementById('threat').children.length;
            if (type == 'china' && !i18n[data.city]) {
                return;
            };
            if (threatCount > 7) {
                dom.getElementById('threat').removeChild(dom.getElementById('threat').firstChild);
            };

            var date = data.datetime.substr(0, 4) + '/' + data.datetime.substr(4, 2) + '/' + data.datetime.substr(6, 2) + ' ' + data.datetime.substr(8, 2) + ':' + data.datetime.substr(10, 2) + ':' + data.datetime.substr(12, 2);
            (type == 'world' ? data.country : (i18n[data.city] ? i18n[data.city] : data.city))
            tpl += '<tr style="color:' + _self.level[_self.set_threat_color(data.vtype)] + '"><td>' + date + '</td>';
            tpl += '<td>' + data.ip + '</td>';
            tpl += '<td>' + (type == 'world' ? data.country : (i18n[data.city] ? i18n[data.city] : data.city)) + '</td>';
            tpl += '<td>' + data.vtype + '</td>';
            tpl += '<td>[' + data.longitude + '，' + data.latitude + ']</td></tr>';

            dom.getElementById('threat').innerHTML += tpl;
        },
        citys_rank: function(rank, type) {
            var _self = this;

            var tpl = '';

            var timer = 0;

            for (var rank_item in rank) {
                if (type == 'china' && !i18n[rank_item]) {
                    continue;
                }
                tpl += '<tr><td>' + (timer + 1) + '</td>';
                tpl += (type == 'china' ? '<td>●</td>' : '<td><img width=24 src="images/counties/' + translate[rank_item] + '.png" /></td>');
                tpl += (type == 'china' ? '<td>' + regions[rank_item] + '</td>' : '<td>' + rank_item + '</td>');
                tpl += '<td>' + rank[rank_item] + '</td></tr>';
                timer++;
                if (timer > 9) break;
            }

            dom.getElementById('citysRank').innerHTML = tpl;

        },
        threaten_rank: function(threat, type) {

            var _self = this;

            var tpl = '';

            var timer = 0;

            for (var threat_item in threat) {
                tpl += '<tr><td>' + (timer + 1) + '</td>';
                tpl += '<td>●</td>';
                tpl += '<td>' + threat_item + '</td>';
                tpl += '<td>' + threat[threat_item] + '</td></tr>';
                timer++;
                if (timer > 9) break;
            }
            dom.getElementById('threatenRank').innerHTML = tpl;
        },
        current_time: function() {

            var _self = this,

                Now = new Date(),

                date = {

                    year: Now.getFullYear(),

                    month: Now.getMonth() + 1,

                    day: Now.getDate(),

                    hours: Now.getHours(),

                    minutes: Now.getMinutes(),

                    seconds: Now.getSeconds(),

                    milliSeconde: Now.getMilliseconds()
                },

                year = dom.getElementById('year'),

                month = dom.getElementById('month'),

                day = dom.getElementById('day'),

                hours = dom.getElementById('hours'),

                minutes = dom.getElementById('minutes'),

                seconds = dom.getElementById('seconds'),

                milliSeconde = dom.getElementById('milliSeconde');


            year.innerHTML = date.year;

            month.innerHTML = (date.month < 10 ? '0' + date.month : date.month);

            day.innerHTML = (date.day < 10 ? '0' + date.day : date.day);

            hours.innerHTML = (date.hours < 10 ? '0' + date.hours : date.hours);

            minutes.innerHTML = (date.minutes < 10 ? '0' + date.minutes : date.minutes);

            seconds.innerHTML = (date.seconds < 10 ? '0' + date.seconds : date.seconds);

            milliSeconde.innerHTML = (Math.floor(date.milliSeconde / 10) < 10 ? '0' + Math.floor(date.milliSeconde / 10) : Math.floor(date.milliSeconde / 10));;
        },
        throw_error: function(msg) {

            throw new Error(msg);

        }
    }

    win.ThreatView = ThreatView;

})(window, document, undefined);