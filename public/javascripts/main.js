$(function(){
  var source = $("#search-results").html();
  var dataTemplate = Handlebars.compile(source);
  $results = $('#results')

  $('#search').on('keyup', function(e){
    if(e.keyCode === 13) {
      var parameters = { search: $(this).val() };
      $.get('/searching', parameters, function(data){
        if (data instanceof Array) {
          $results.html(dataTemplate({resultsArray:data}));
        } else {
          $results.html(data);
        };
      });
    };
  });
  $('#results').on('click', '.save-btn', function() {
    var jobTitle = $(this).next('a').text()
    var jobURL = $(this).next('a').attr('href')
    console.log(jobTitle, jobURL)
    var parameters = { title: jobTitle, url: jobURL };
    console.log(parameters)
    $.get( '/save', parameters, function(data) {
      console.log("whee!")
    });
  });
});