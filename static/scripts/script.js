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
	title: {},
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
		text: 'Employment over time'
	},
	legend: {
		enabled: false
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
			}, ...
		]
	}, ...
}
*/

function formatBarChartOptions(data, selections) {
	var options = $.extend(true, {}, columnChartDefaults);
	options.title.text = 'Employment on ' + getDateByCode(selections.date);
	var filter = selections.programs;

	// Iterate over the programs within each faculty, and grab the data
	var entries = [];
	for (facultyName in data) {
		var faculty = data[facultyName];
		var facultyColours = colours[facultyName]
		faculty.programs.forEach(function(entry) {
			if (_.isEmpty(filter) || _.contains(filter, entry.id)){
				entries.push({
					name: entry.name,
					numEmployed: {
						y: entry.employed,
						color: getColour(facultyColours.primary)
					},
					pctEmployed: {
						y: formatPercentage(entry.employed, entry.employed + entry.unemployed),
						color: getColour(facultyColours.secondary)
					}
				});
			}
		});
	}
	entries = _.sortBy(entries, function(entry) {
		return entry.numEmployed.y;
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
	options.title.text = 'Employment on ' + getDateByCode(selections.date);

	var sortedFaculties = _.sortBy(data, 'employed');
	var facultySeries = [];
	var drilldownSeries = [];
	// Iterate over each faculty
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

function formatLineChartOptions(data, selections) {
	var options = $.extend(true, {}, lineChartDefaults);
	var dateLabels = []
	var filter = selections.programs;
	var programSeries = {};

	// iterate over each faculty object
	for (facultyName in data) {
		faculty = data[facultyName]
		var facultyColours = colours[facultyName];
		if (_.isEmpty(dateLabels)) {
			dateLabels = _.keys(faculty);
		}
		// iterate over each date within faculty object
		for (dateCode in faculty) {
			var date = faculty[dateCode]
			// for each program within this faculty on a given date
			date.programs.forEach(function(program) {
				var programName = program.name;
				if (_.isEmpty(filter) || _.contains(filter, program.id)) {
					// if series is undefined for this program, create it
					if (_.isUndefined(programSeries[programName])) {
						programSeries[programName] = {
							data: [],
							name: programName,
							color:getColour(facultyColours.secondary),
							marker: {
								symbol: 'circle'
							}
						}
					}
					// add a new value to the program series for this date
					programSeries[programName].data.push({
						y: program.employed,
						color: getColour(facultyColours.primary)
					});
				}
			});
		}
	}

	// now, we have the data we want. simply add the series to options
	for (programName in programSeries) {
		options.series.push(programSeries[programName]);
	}
	options.xAxis.categories = _.map(dateLabels, getDateByCode);

	return options;
}

function formatGroupedLineChartOptions(data, selections) {
	var options = $.extend(true, {}, lineChartDefaults);
	var dateLabels = [];
	var facultySeriesObj = {}; // contains array of faculty counts, and object of programs with counts

	// iterate over each faculty object
	for (facultyName in data) {
		var faculty = data[facultyName];
		var facultyColours = colours[facultyName];
		if (_.isEmpty(dateLabels)) {
			dateLabels = _.keys(faculty);
		}

		facultySeriesObj[facultyName] = {
			data: [],
			name: facultyName,
			color: getColour(facultyColours.secondary),
			marker: {
				symbol: 'circle'
			},
			drilldown: facultyName,
			drilldownObj: {}
		}

		var facultySeries = facultySeriesObj[facultyName];
		var facultyDrilldowns = facultySeries.drilldownObj;
		// iterate over each date within faculty object
		for (dateCode in faculty) {
			var date = faculty[dateCode]

			// build faculty level series
			facultySeries.data.push({
				y: date.employed,
				color: getColour(facultyColours.primary),
				drilldown: facultyName
			});

			// for each program within this faculty on a given date
			date.programs.forEach(function(program) {
				var programName = program.name;

				// if drilldown series is undefined for this program, create it
				if (_.isUndefined(facultyDrilldowns[programName])) {
					facultyDrilldowns[programName] = {
						type: 'line',
						id: facultyName,
						data: [],
						name: programName,
						color: getColour(facultyColours.secondary),
						marker: {
							symbol: 'circle'
						},
						pointColor: getShadeOfColour(facultyColours.primary, 80)
					}
				}
				// add a new value to the drilldown series for this date
				facultyDrilldowns[programName].data.push({
					y: program.employed,
					color: facultyDrilldowns[programName].pointColor
				});

			});
		}
	}

	// format the drilldown series and add the faculty series to the options
	for (facultyName in facultySeriesObj) {
		var facultySeries = facultySeriesObj[facultyName];
		var drilldownSeries = facultySeries.drilldownObj;

		options.series.push(facultySeries);
		for (programName in drilldownSeries) {
			options.drilldown.series.push(drilldownSeries[programName]);
		}

	}
	options.xAxis.categories = _.map(dateLabels, getDateByCode);

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
	var $groupingDiv = $('.grouping-selection');
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
	var $programDiv = $('.program-selection');
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

	var $dateDiv = $('.date-selection');
	var $dateSelect = $dateDiv.find('#date-select');

	$dateSelect.val('');

	if(displayType !== 'day' || groupingType === '' || (groupingType === 'specific' && _.isEmpty(programs))) {
		$dateDiv.hide();
	} else {
		$dateDiv.show();
	}
}

function getSelections() {
	return {
			displayType: $('#display-type-select').val(),
			groupingType: $('#grouping-select').val(),
			programs: _.compact($('#program-select').val()),
			date: $('#date-select').val()
		};
}

// Returns whether or not the serialized query string is valid
function isValidQuery(){
	var displayType = $('#display-type-select').val();
	var groupingType = $('#grouping-select').val();
	var programs = _.compact($('#program-select').val());
	var date = $('#date-select').val();

	return ((displayType === 'day' && date !== '') || (displayType === 'time' && (groupingType === 'faculty' || !_.isEmpty(programs))));
}

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
			$.ajax('http:' + base + 'overTime', {
				method:'GET',
				success: $.proxy(function(data) {
					$('#chart').highcharts(generateChartOptions(data, this));
				}, selections)
			})
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