var pageMarked = 0;
var pageUnmarked = 0;

var justMap = new Map();

function newId(answerId){
	if(!justMap.has(answerId)){
		justMap.set(answerId,0);
	}
}

function loadMarkedAnswers(conceptId) {
	 loadGif("Marked");
	 ajax("/concept/"+conceptId+"/loadMarkedAnswers?page="+pageMarked, "markedAnswerBody");
	 unloadGif("Marked");
	 pageMarked++;
}

function loadUnmarkedAnswers(conceptId) {
	loadGif("Unmarked");
	ajax("/concept/"+conceptId+"/loadUnmarkedAnswers?page="+pageUnmarked, "unmarkedAnswerBody");
	unloadGif("Unmarked");
	pageUnmarked++;
}

function loadCorrectJust(conceptId, answerId){
	loadGif("Just");
	newId(answerId)
		
	var page = justMap.get(answerId);
	var urlPage = "/concept/"+conceptId+"/loadJust?answerId="+answerId+"&page="+ page;
	ajax(urlPage , "correctJust"+answerId);
	
	unloadGif("Just");
	page++;
	justMap.set(answerId, page);
}