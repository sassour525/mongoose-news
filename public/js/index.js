$(document).ready(function() {
    //click event to kick off the scraping
    $('#scrape-news-button').on('click', function() {
        $.get('/scrape', function(data) {
            location.reload();
        });
    });

    //click event to save an article
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
            location.reload();
        });
    });

});