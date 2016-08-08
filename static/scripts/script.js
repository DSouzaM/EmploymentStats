var excludedFaculties = ['ALL'];


var customTooltips = function(tooltip) {
	// Tooltip Element
	var tooltipEl = $('#chartjs-tooltip');
	if (!tooltipEl[0]) {
		$('body').append('<div id="chartjs-tooltip"></div>');
		tooltipEl = $('#chartjs-tooltip');
	}
	// Hide if no tooltip
	if (!tooltip.opacity) {
		tooltipEl.css({
			opacity: 0
		});
		$('.chartjs-wrap canvas').each(function(index, el) {
		    $(el).css('cursor', 'default');
		});
		return;
	}
	$(this._chart.canvas).css('cursor', 'pointer');
	// Set caret Position
	tooltipEl.removeClass('above below no-transform');
	if (tooltip.yAlign) {
		tooltipEl.addClass(tooltip.yAlign);
	} else {
		tooltipEl.addClass('no-transform');
	}
	// Set Text
	if (tooltip.body) {
		var innerHtml = [
			(tooltip.beforeTitle || []).join('\n'), (tooltip.title || []).join('\n'), (tooltip.afterTitle || []).join('\n'), (tooltip.beforeBody || []).join('\n'), (tooltip.body || []).join('\n'), (tooltip.afterBody || []).join('\n'), (tooltip.beforeFooter || [])
			.join('\n'), (tooltip.footer || []).join('\n'), (tooltip.afterFooter || []).join('\n')
		];
		tooltipEl.html(innerHtml.join('\n'));
	}
	// Find Y Location on page
	var top = 0;
	if (tooltip.yAlign) {
		if (tooltip.yAlign == 'above') {
			top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
		} else {
			top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
		}
	}
	var position = $(this._chart.canvas)[0].getBoundingClientRect();
	// Display, position, and set styles for font
    tooltipEl.css({
        opacity: 1,
        width: tooltip.width ? (tooltip.width + 'px') : 'auto',
        left: position.left + tooltip.x + 'px',
        top: position.top + top + 'px',
        fontFamily: tooltip._fontFamily,
        fontSize: tooltip.fontSize,
        fontStyle: tooltip._fontStyle,
        padding: tooltip.yPadding + 'px ' + tooltip.xPadding + 'px',
    });
};


function transformData(data) {
	var labels = [];
	var dataPoints = [];
	for (var facultyKey in data) {
		if ($.inArray(facultyKey, excludedFaculties) == -1) { // not an exception
			for (var programKey in data[facultyKey]) {
				labels.push(facultyKey + ' ' + programKey);
				var dp = data[facultyKey][programKey];
				var employed = parseInt(dp.employed);
				var unemployed = parseInt(dp.unemployed);
				dataPoints.push(employed/(unemployed+employed)*100);
			}
		}
	}
	return {
		type:'bar',
		data: {
			labels: labels,
			datasets:[{
				label: '# Employed',
				data: dataPoints
			}]
		},
		tooltips: {
			enabled: false,
			custom: customTooltips
		}
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

// Returns whether or not the serialized query string is valid
function isValidQuery(){
	var displayType = $('#display-type-select').val();
	var groupingType = $('#grouping-select').val();
	var programs = _.compact($('#program-select').val());
	var date = $('#date-select').val();

	return ((displayType === 'day' && date !== '') || (displayType === 'time' && (groupingType === 'faculty' || !_.isEmpty(programs))));
}

$(function() {
	var base = $('head base').attr('href');
	var transformedData = {};

	$('#get_data_btn').click(function() {
		$.ajax('http:' + base + 'byDate?date=' + $('#date-select').val(), {
			method:'GET', 
			success: function(data) {
				//console.log(data);
				transformedData = transformData(data);
				var myChart = new Chart($('#chart'), transformedData);

				$('#text_area').val(JSON.stringify(data));
			}
		});
	});

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
					console.log('Form is ready to be sent to the backend: ' + $('form select').serialize());
				}

			default:
				break;
		}
	});

	/*var myChart = new Chart($("#chart"), {
		type:'bar',
		data: {
	        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	        datasets: [{
	            label: '# of Votes',
	            data: [12, 19, 3, 5, 2, 3],
	            backgroundColor: [
	                'rgba(255, 99, 132, 0.2)',
	                'rgba(54, 162, 235, 0.2)',
	                'rgba(255, 206, 86, 0.2)',
	                'rgba(75, 192, 192, 0.2)',
	                'rgba(153, 102, 255, 0.2)',
	                'rgba(255, 159, 64, 0.2)'
	            ],
	            borderColor: [
	                'rgba(255,99,132,1)',
	                'rgba(54, 162, 235, 1)',
	                'rgba(255, 206, 86, 1)',
	                'rgba(75, 192, 192, 1)',
	                'rgba(153, 102, 255, 1)',
	                'rgba(255, 159, 64, 1)'
	            ],
	            borderWidth: 1
	        }]
    	}
	});*/
});