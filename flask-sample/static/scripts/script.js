$(function() {
	var base = $('head base').attr('href');
	$('#get_name_btn').click(function() {
		$.ajax('http:' + base + 'name', {
			method:'GET', 
			success: function(data) {
				$('#name_field').val(data);
			}
		});
	});
	$('#set_name_btn').click(function() {
		var name = $('#name_field').val();
		$.ajax('http:' + base + 'name', {
			method:'POST',
			data:'name=' + name
		})
	});

	var sock = new WebSocket('ws:' + base + 'socket');
	sock.onopen = function() {
		console.log('Socket opened successfully.');
	}
	sock.onmessage = function(event) {
		console.log(event.data);
	}

})