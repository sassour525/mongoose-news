$(document).ready(function() {
    $('#scrape-news-button').on('click', function() {
        $.get('/scrape', function(data) {
            $.get('/', function(data) {

            });
        });
    });

    $('.save-article-button').on('click', function() {
        var thisId = $(this).attr("data-value");
        $.ajax({
            method: 'POST',
            url: '/saveArticle',
            data: {
                articleId: thisId
            }
        }).done(function(data){
            console.log(data);
        });
    });

});