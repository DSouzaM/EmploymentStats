var colours = {
	AHS: {
		primary: 'rgba(0,127,138,1)',
		secondary: 'rgba(0,154,166,0.5)'
	},
	ARTS: {
		primary: 'rgba(172,97,0,1)',
		secondary: 'rgba(233,131,0,0.5)'
	},
	ENG: {
		primary: 'rgba(87,6,140,1)',
		secondary: 'rgba(204,170,255,0.5)'
	},
	ENV: {
		primary: 'rgba(116,120,0,1)',
		secondary: 'rgba(182,191,0,0.5)'
	},
	MATH: {
		primary: 'rgba(224,36,154,1)',
		secondary: 'rgba(255,136,221,0.5)'
	},
	SCI: {
		primary: 'rgba(0,115,207,1)',
		secondary: 'rgba(119,187,255,0.5)'
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


function getDateByCode(code) {
	return $('#date-select').children('[value='+code+']').text();
}
function formatPercentage(num, denom) {
	return Math.round((num/denom)*10000)/100;
}
function formatBarChartOptions(data, selections) {
	var options = $.extend(true, {}, columnChartDefaults);
	options.title.text = 'Employment on ' + getDateByCode(selections.date);
	var filter = selections.programs;

	var entries = [];
	for (facultyName in data) {
		var faculty = data[facultyName];
		faculty.programs.forEach(function(entry) {
			if (_.isEmpty(filter) || _.contains(filter, entry.id)){
				entries.push({
					name: entry.name,
					numEmployed: {y: entry.employed, color: colours[facultyName].primary},
					pctEmployed: {y: formatPercentage(entry.employed, entry.employed + entry.unemployed), color: colours[facultyName].secondary}
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
	var entries = [];
	var drilldownSeries = [];
	sortedFaculties.forEach(function(faculty) {
		// aggregate Faculty objects
		entries.push({
			numEmployed: {
				y: faculty.employed,
				color: colours[faculty.name].primary,
				name: faculty.name,
				drilldown: faculty.name
			},
			pctEmployed: {
				y: formatPercentage(faculty.employed, faculty.employed + faculty.unemployed),
				color: colours[faculty.name].secondary,
				name: faculty.name,
				drilldown: faculty.name
			}
		});

		// aggregate Programs objects for drilldown
		var programs = [];
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
					color: facultyColours.primary
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
					color: facultyColours.secondary
				};
			}),
			yAxis: 1
		});
	});

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
	options.drilldown.series = drilldownSeries;
	return options;
}



function generateChartOptions(data, selections) {
	if (selections.displayType === 'day') {
		if (selections.groupingType === 'faculty') {
			return formatGroupedBarChartOptions(data, selections);
		}
		return formatBarChartOptions(data, selections);
	} else {
		// generate line chart options
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
	$.ajax('http:' + base + 'byDate?date=' + selections.date, {
		method:'GET',
		success: $.proxy(function(data) {
			var options;
			$('#chart').highcharts(generateChartOptions(data, this));
		},selections)
	});
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