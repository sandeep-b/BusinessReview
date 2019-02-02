$(document).ready(function() {

	$("#city-name").change(function () {
		var val = $(this).val();
		if (val == "Edinburgh") {
			$("#country-name").html("<option>U.K</option>");
		}else if(val=="Karlsruhe"){
			$("#country-name").html("<option>Germany</option>");
		}else if(val=="Montreal" || val=="Waterloo"){
			$("#country-name").html("<option>Canada</option>");
		}else if(val=="Pittsburgh" || val=="Charlotte" || val=="Urbana-Champaign" || val=="Phoenix" || val=="Las Vegas" || val=="Madison" || val=="Cleveland"){
			$("#country-name").html("<option>U.S</option>");
		}else if(val==""){
			$("#country-name").html("<option></option><option>U.K</option><option>Germany</option><option>Canada</option><option>US</option>")
		}
	});

	$("#country-name").change(function () {
		var val = $(this).val();
		if (val == "U.K") {
			$("#city-name").html("<option>Edinburgh</option>");
		}else if(val=="Germany"){
			$("#city-name").html("<option>Karlsruhe</option>");
		}else if(val=="Canada"){
			$("#city-name").html("<option>Waterloo</option><option>Montreal</option>");
		}else if(val=="US"){
			$("#city-name").html("<option>Pittsburgh</option><option>Charlotte</option><option>Urbana-Champaign</option><option>Phoenix</option><option>Las Vegas</option><option>Madison</option><option>Cleveland</option>");
		}else if(val==""){
			$("#city-name").html("<option></option><option>Edinburgh</option><option>Karlsruhe</option><option>Montreal</option><option>Waterloo</option><option>Pittsburgh</option><option>Charlotte</option><option>Urbana-Champaign</option><option>Phoenix</option><option>Las Vegas</option><option>Madison</option><option>Cleveland</option>");
		}
	});


});