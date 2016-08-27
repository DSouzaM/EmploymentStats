var colours = {
	AHS: {
		primary: {
			r: 0,
			g: 127,
			b: 138,
			a: 1
		},
		secondary: {
			r: 0,
			g: 154,
			b: 166,
			a: 0.5
		}
	},
	ARTS: {
		primary: {
			r: 172,
			g: 97,
			b: 0,
			a: 1
		},
		secondary: {
			r: 233,
			g: 131,
			b: 0,
			a: 0.5
		}
	},
	ENG: {
		primary: {
			r: 87,
			g: 6,
			b: 140,
			a: 1
		},
		secondary: {
			r: 204,
			g: 170,
			b: 255,
			a: 0.5
		}
	},
	ENV: {
		primary: {
			r: 116,
			g: 120,
			b: 0,
			a: 1
		},
		secondary: {
			r: 182,
			g: 191,
			b: 0,
			a: 0.5
		}
	},
	MATH: {
		primary: {
			r: 224,
			g: 36,
			b: 154,
			a: 1
		},
		secondary: {
			r: 225,
			g: 136,
			b: 221,
			a: 0.5
		}
	},
	SCI: {
		primary: {
			r: 0,
			g: 115,
			b: 207,
			a: 1
		},
		secondary: {
			r: 119,
			g: 187,
			b: 255,
			a: 0.5
		}
	}
}
// colours referenced from https://uwaterloo.ca/brand-guidelines-and-tools/visual-identity/digital-colour-palette

var columnChartDefaults = {
	chart: {
		marginTop: 30,
		backgroundColor: '#f5f5f5',
		type: 'column',
		events: {
			drilldown: function(e) {
	            var chart = this,
	            drilldowns = chart.userOptions.drilldown.series,
	            series = [];
	            chart.xAxis[0].names = [];
	            e.preventDefault();
	            Highcharts.each(drilldowns, function(drilldownSeries, i) {
	                if (drilldownSeries.id === e.point.drilldown) {
	                    chart.addSingleSeriesAsDrilldown(e.point, drilldownSeries);
	                }
	            });
	            chart.applyDrilldown();
	        }
		}
	},
	lang: {
		drillUpText: 'Return to Faculty view'
	},
	title: {
		text: null
	},
	legend: {
		enabled: false
	},
	xAxis: {
		type: 'category'
	},
	yAxis: [{
		title: {
			text: 'Number of students employed'
		}
	}, {
		title: {
			text: 'Percentage of students employed'
		},
		min: 0,
		max: 100,
		opposite: true
	}],
	tooltip: {
		shared: true,
		formatter: function() {
			return '<b>' + this.points[0].key + '</b><br>' + this.points[0].y + ' students employed (' + this.points[1].y + '%)';
		}
	},
	plotOptions: {
		column: {
			grouping: false,
			shadow: false
		}
	},
	series: [],
	drilldown: {
		drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                }
            }
	},
	credits: false
};


var lineChartDefaults = {
	chart: {
		marginTop: 30,
		backgroundColor: '#f5f5f5',
		type: 'line',
		events: {
			drilldown: function(e) {
	            var chart = this,
	            drilldowns = chart.userOptions.drilldown.series,
	            series = [];
	            chart.xAxis[0].names = [];
	            e.preventDefault();
	            Highcharts.each(drilldowns, function(drilldownSeries, i) {
	                if (drilldownSeries.id === e.point.drilldown) {
	                    chart.addSingleSeriesAsDrilldown(e.point, drilldownSeries);
	                }
	            });
	            chart.applyDrilldown();
	        }
		}
	},
	title: {
		text: null
	},
	legend: {
		enabled: true
	},
	xAxis: {},
	yAxis: {
		title: {
			text: 'Number of students employed'
		}
	},
	tooltip: {
		formatter: function() {
			return '<b>' + this.series.name + ' • ' + this.key + '</b><br>' + this.point.y + ' students employed';
		}
	},
	series: [],
	drilldown: {
		series: [],
		drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: 0
                }
            }
	},
	credits: false
};

function getDateByCode(code) {
	return $('#date-select').children('[value='+code+']').text();
}
function formatPercentage(num, denom) {
	return Math.round((num/denom)*10000)/100;
}

function getColour(rgba) {
	return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')';
}

function getShadeOfColour(rgba, d) {
	var nr = Math.round(rgba.r+Math.random()*d - d/2); //  +/- (d/2)
	var ng = Math.round(rgba.g+Math.random()*d - d/2);
	var nb = Math.round(rgba.b+Math.random()*d - d/2);
	return 'rgba(' + nr + ',' + ng + ',' + nb + ','+ rgba.a + ')';
}


/*
Bar chart data object format:
{
	faculty: {
		employed: int,
		unemployed: int,
		name: string,
		programs: [
			{
					employed: int,
					unemployed: int,
					name: string,
					id: string
			},
			...
		]
	},
	...
}
*/
function formatBarChartOptions(data, selections) {
	var options = $.extend(true, {}, columnChartDefaults);
	var filter = selections.programs;

	// Iterate over each faculty object
	var entries = [];
	for (facultyName in data) {
		var faculty = data[facultyName];
		var facultyColours = colours[facultyName]
		// Iterate over each program object
		faculty.programs.forEach(function(program) {
			if (_.isEmpty(filter) || _.contains(filter, program.id)){
				entries.push({
					name: program.name,
					numEmployed: {
						y: program.employed,
						color: getColour(facultyColours.primary)
					},
					pctEmployed: {
						y: formatPercentage(program.employed, program.employed + program.unemployed),
						color: getColour(facultyColours.secondary)
					}
				});
			}
		});
	}
	entries = _.sortBy(entries, function(program) {
		return program.numEmployed.y;
	});

	options.xAxis.categories = _.pluck(entries, 'name');
	options.series.push({
		name: '# employed',
		data: _.pluck(entries, 'numEmployed'),
		yAxis: 0,
		pointPadding: 0.15
	});
	options.series.push({
		name: '% employed',
		data: _.pluck(entries, 'pctEmployed'),
		yAxis: 1
	});
	return options;
}

function formatGroupedBarChartOptions(data, selections) {
	var options = $.extend(true, {}, columnChartDefaults);

	var sortedFaculties = _.sortBy(data, 'employed');
	var facultySeries = [];
	var drilldownSeries = [];
	// Iterate over each faculty object
	sortedFaculties.forEach(function(faculty) {
		var facultyColours = colours[faculty.name];
		// Add faculty-level series info
		facultySeries.push({
			numEmployed: {
				y: faculty.employed,
				color: getColour(facultyColours.primary),
				name: faculty.name,
				drilldown: faculty.name
			},
			pctEmployed: {
				y: formatPercentage(faculty.employed, faculty.employed + faculty.unemployed),
				color: getColour(facultyColours.secondary),
				name: faculty.name,
				drilldown: faculty.name
			}
		});

		// Add program-level series info
		var programs = [];
		// Store programs in intermediate object so they can be sorted after being built
		faculty.programs.forEach(function(program) {
			programs.push({
				name: program.name,
				numEmployed: program.employed,
				pctEmployed: formatPercentage(program.employed, program.employed + program.unemployed)
			})
		});
		var sortedPrograms = _.sortBy(programs, 'numEmployed');
		var facultyColours = colours[faculty.name];
		drilldownSeries.push({
			id: faculty.name,
			type: 'column',
			name: '# employed',
			data: _.map(sortedPrograms, function(program) {
				return {
					name: program.name,
					y: program.numEmployed,
					color: getColour(facultyColours.primary)
				};
			}),
			yAxis: 0,
			pointPadding: 0.15
		});
		drilldownSeries.push({
			id: faculty.name,
			type: 'column',
			name: '% employed',
			data: _.map(sortedPrograms, function(program) {
				return {
					name: program.name,
					y: program.pctEmployed,
					color: getColour(facultyColours.secondary)
				};
			}),
			yAxis: 1
		});
	});

	options.series.push({
		name: '# employed',
		data: _.pluck(facultySeries, 'numEmployed'),
		yAxis: 0,
		pointPadding: 0.15
	});
	options.series.push({
		name: '% employed',
		data: _.pluck(facultySeries, 'pctEmployed'),
		yAxis: 1
	});
	options.drilldown.series = drilldownSeries;
	return options;
}


/*
Line chart data object format:
{
	dates: [...],
	employment: {
		faculty: {
			name: string,
			data: [...],
			programs: {
				program: {
					name: string,
					id: string,
					data: [...]
				},
				...
			}
		},
		...
	}
}
*/
function formatLineChartOptions(data, selections) {
	var options = $.extend(true, {}, lineChartDefaults);
	var dateLabels = _.map(data.dates, getDateByCode);
	var employment = data.employment;
	var programSeries = [];
	var filter = selections.programs;

	// Iterate over each faculty object
	for (facultyName in employment) {
		var faculty = employment[facultyName];
		var facultyColours = colours[facultyName];

		// Iterate over each program within faculty object
		for (programName in faculty.programs) {
			var program = faculty.programs[programName];

			if (_.isEmpty(filter) || _.contains(filter, program.id)) {
				var pointColor = getShadeOfColour(facultyColours.primary, 80);
				programSeries.push({
					data: _.map(program.data, function(employed) {
						return {
							y: employed,
							color: pointColor
						}
					}),
					name: program.name,
					color: getColour(facultyColours.secondary),
					marker: {
						symbol: 'circle'
					}
				});
			}
		}
	}

	options.series = programSeries;
	options.xAxis.categories = dateLabels;
	return options;
}

function formatGroupedLineChartOptions(data, selections) {
	var options = $.extend(true, {}, lineChartDefaults);
	var dateLabels = _.map(data.dates, getDateByCode);
	var employment = data.employment;
	var facultySeries = [];
	var drilldownSeries = [];

	// iterate over each faculty object
	for (facultyName in employment) {
		var faculty = employment[facultyName];
		var facultyColours = colours[facultyName];
		var pointColor = getColour(facultyColours.primary);
		var lineColor = getColour(facultyColours.secondary);

		facultySeries.push({
			data: _.map(faculty.data, function(employed){
				return {
					y: employed,
					color: pointColor,
					drilldown: facultyName
				}
			}),
			name: facultyName,
			color: lineColor,
			marker: {
				symbol: 'circle'
			}
		});

		// Iterate over each program within faculty object
		for (programName in faculty.programs) {
			var program = faculty.programs[programName];
			var drilldownPointColor = getShadeOfColour(facultyColours.primary, 80);

			drilldownSeries.push({
				type: 'line',
				data: _.map(program.data, function(employed) {
					return {
						y: employed,
						color: drilldownPointColor
					}
				}),
				name: programName,
				id: facultyName,
				marker: {
					symbol: 'circle'
				},
				color: lineColor
			});
		}
	}

	options.series = facultySeries;
	options.drilldown.series = drilldownSeries;
	options.xAxis.categories = dateLabels;
	return options;
}


function generateChartOptions(data, selections) {
	if (selections.displayType === 'day') {
		if (selections.groupingType === 'faculty') {
			return formatGroupedBarChartOptions(data, selections);
		}
		return formatBarChartOptions(data, selections);
	} else {
		if (selections.groupingType === 'faculty') {
			return formatGroupedLineChartOptions(data,selections);
		}
		return formatLineChartOptions(data, selections);
	}
}

// Resets selector for grouping type and adds "All Faculty" option if enabled for the given display type
function updateGroupingSelector() {
	var $displaySelect = $('#display-type-select');
	var displayType = $displaySelect.val();
	var $groupingDiv = $('#grouping-selection');
	var $groupingSelect = $groupingDiv.find('#grouping-select');

	$groupingSelect.val('');
	$groupingDiv.hide();
	if (displayType === '') {
		return;
	}

	var $allFacultiesOption = $groupingSelect.find('option[value="all"]')
	if (displayType === 'time') {
		if ($groupingSelect.val() === 'all') {
			$groupingSelect.val('');
		}
		$allFacultiesOption.hide();
	} else {
		$allFacultiesOption.show();
	}
	$groupingDiv.show();
}

// Resets selector for selecting specific programs
function updateSpecificProgramSelector() {
	var $groupingSelect = $('#grouping-select');
	var groupingType = $groupingSelect.val();
	var $programDiv = $('#program-selection');
	var $programSelect = $programDiv.find('#program-select');

	$programSelect.val('').trigger('chosen:updated');

	if (groupingType !== 'specific') {
		$programDiv.hide();
		return;
	}

	$programDiv.show();
	$programSelect.chosen();
}

function updateDateSelector(){
	var $displaySelect = $('#display-type-select');
	var displayType = $displaySelect.val();
	var $groupingSelect = $('#grouping-select');
	var groupingType = $groupingSelect.val();
	var $programSelect = $('#program-select');
	var programs = _.compact($programSelect.val());

	var $dateDiv = $('#date-selection');
	var $dateSelect = $dateDiv.find('#date-select');

	$dateSelect.val('');

	if(displayType !== 'day' || groupingType === '' || (groupingType === 'specific' && _.isEmpty(programs))) {
		$dateDiv.hide();
	} else {
		$dateDiv.show();
	}
}

// Returns an object containing the values of each dropdown
function getSelections() {
	return {
		displayType: $('#display-type-select').val(),
		groupingType: $('#grouping-select').val(),
		programs: _.compact($('#program-select').val()),
		date: $('#date-select').val()
	};
}

// Returns whether or not the serialized query string is valid
function isValidQuery() {
	var s = getSelections();
	return ((s.displayType === 'day' && s.date !== '') || (s.displayType === 'time' && (s.groupingType === 'faculty' || !_.isEmpty(s.programs))));
}

// Makes an AJAX call to the backend to retrieve data, and updates the chart with the correct data
function updateChart() {
	var base = $('head base').attr('href');
	var selections = getSelections();
	switch(selections.displayType) {
		case 'day':
			$.ajax('http:' + base + 'byDate?date=' + selections.date, {
				method:'GET',
				success: $.proxy(function(data) {
					$('#chart').highcharts(generateChartOptions(data, this));
				},selections)
			});
			break;
		case 'time':
			var data = JSON.parse($('#over-time').text());
			$('#chart').highcharts(generateChartOptions(data,selections))

	}
}

$(function() {
	$('#chart-data-options select').on('change', function() {
		switch(this.id) {
			case 'display-type-select':
				updateGroupingSelector();
			case 'grouping-select':
				updateSpecificProgramSelector();
			case 'program-select':
				updateDateSelector();
			case 'date-select':
				if (isValidQuery()) {
					updateChart();
				}
			default:
				break;
		}
	});
});