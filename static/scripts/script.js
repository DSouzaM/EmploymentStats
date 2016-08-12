var excludedFaculties = ['ALL'];
// need to provide xAxis categories and series data.
var columnChartDefaults = {
	chart: {
		type: 'column'
	},
	title: {},
	xAxis: {},
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
		shared: true
	},
	plotOptions: {
		column: {
			grouping: false,
			shadow: false
		}
	},
	series: []
};


function getDateByCode(code) {
	return $('#date-select').children('[value='+code+']').text();
}
function formatBarChartData(data) {
	data = _.sortBy(data, 'employed');
	var programs = [];
	var numEmployed = [];
	var pctEmployed = [];
	data.forEach(function(entry) {
		programs.push(entry.faculty + ' ' + entry.program);
		numEmployed.push(entry.employed);
		pctEmployed.push(Math.round((entry.employed/(entry.employed + entry.unemployed))*10000)/100);
	});
	return {
		programs: programs,
		numEmployed: numEmployed,
		pctEmployed: pctEmployed
	};
}
function formatGroupedBarChartData(data) {

}


function generateBarChartOptions(data, selections) {
	var options = $.extend(true, {}, columnChartDefaults);
	options.title.text = 'Employment on ' + getDateByCode(selections.date);
	
	var formatted;
	switch(selections.groupingType) {
		case 'all':
			formatted = formatBarChartData(data);
			break;
		case 'faculty':
			formatted = formatGroupedBarChartData(data);
			break;
		case 'specific':
			var specificData = data.filter(function(entry) {
				return _.contains(selections.programs, entry.id);
			});
			formatted = formatBarChartData(specificData);
	}


	
	options.xAxis.categories = formatted.programs;
	options.series.push({
		name: '# employed',
		color: 'rgba(0,210,255,1)',
		data: formatted.numEmployed,
		yAxis: 0,
		pointPadding: 0.2
	});
	options.series.push({
		name: '% employed',
		color: 'rgba(148,236,255,0.6)',
		data: formatted.pctEmployed,
		yAxis: 1
	});
	return options;
}

function generateChartOptions(data, selections) {
	if (selections.displayType === 'day') {
		return generateBarChartOptions(data, selections);
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

	$programSelect.val('');

	if (groupingType !== 'specific') {
		$programDiv.hide();
		return;
	}

	$programDiv.show();
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