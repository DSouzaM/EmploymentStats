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
				labels.push(facultyKey + " " + programKey);
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

function updateDataSelector(displayType) {
	var $dataDiv = $('.data-selection');
	var $dataSelect = $dataDiv.find('#data-type-select');

	$dataDiv.hide();
	if (displayType === "") {
		return;
	}
	$dataSelect.val("");
	var $allFacultiesOption = $dataSelect.find('option[value="all"]')
	if (displayType === 'time') {
		$allFacultiesOption.hide();
	} else {
		$allFacultiesOption.show();
	}
	$dataDiv.show();
}

function updateSpecificProgramSelector() {
	var $programDiv = $('.program-selection');
	var $programSelect = $programDiv.find('#program-select');

	$programDiv.hide();
	$programSelect.val('');
	$programDiv.show();
}

function updateDateSelector(){
	console.log('updateDateSelector()');
}

$(function() {
	var base = $('head base').attr('href');
	var transformedData = {};

	$('#get_data_btn').click(function() {
		$.ajax('http:' + base + 'byDate?date=' + $('#date').val(), {
			method:'GET', 
			success: function(data) {
				//console.log(data);
				transformedData = transformData(data);
				var myChart = new Chart($('#chart'), transformedData);

				$('#text_area').val(JSON.stringify(data));
			}
		});
	});

	$('#display-type-select').on('change', function() {
		updateDataSelector($(this).val());
	})

	$('#data-type-select').on('change', function() {
		var displayType = $('#display-type-select').val();
		var dataType = $(this).val();
		if (displayType === 'day') {
			if (dataType !== '') {
				if (dataType === 'specific') {
					updateSpecificProgramSelector();
				}
				updateDateSelector();
			} 
		}
	})





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