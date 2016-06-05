$(function() {
	var $base = $('head base').attr('href');
	$('#get_name_btn').click(function() {
		$.ajax($base+'name', {
			method:'GET', 
			success: function(data) {
				$('#name_field').val(data);
			}
		});
	})
	$('#set_name_btn').click(function() {
		var name = $('#name_field').val();
		$.ajax($base+'name', {
			method:'POST',
			data:'name=' + name
		})
	})
})