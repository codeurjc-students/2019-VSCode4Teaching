var conceptMap = new Map();

function newId(chapterId){
	if(!conceptMap.has(chapterId)){
		conceptMap.set(chapterId,0);
	}
}

function loadConcepts(chapterId){    
    $(document).ready(function (){
    	loadGif("Concept"+chapterId);
    	newId(chapterId); //Add new chapterId to the map and set initial values
    	
    	var page = conceptMap.get(chapterId);
        var urlPage = "/loadConcepts?chapterId="+chapterId+"&page="+ page;
        ajax(urlPage, "concepts"+chapterId);
        
        unloadGif("Concept"+chapterId);
        page++;
        conceptMap.set(chapterId, page);
	});
}