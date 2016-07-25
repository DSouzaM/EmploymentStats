$(function() {
	var base = $('head base').attr('href');
	$('#get_data_btn').click(function() {
		$.ajax('http:' + base + 'byDate?date=' + $("#date").val(), {
			method:'GET', 
			success: function(data) {
				console.log(data);
				$('#text_area').val(JSON.stringify(data));
			}
		});
	});
});