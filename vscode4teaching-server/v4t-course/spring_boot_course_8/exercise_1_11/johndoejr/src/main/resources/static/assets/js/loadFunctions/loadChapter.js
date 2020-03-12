var chapters = 0;

function loadChapters(){
    console.log('chapters');
	$(document).ready(function (){
    	loadGif("Chapters");
        var urlPage = "/loadChapters?page="+ chapters;
        ajax(urlPage, "Chapters");
        unloadGif("Chapters");
        chapters++;
    });
}

