var pageMarked = 0;
var pageUnmarked = 0;
function loadMarkedQuestions(conceptId) {
    loadGif("Marked");
    ajax("/concept/"+conceptId+"/loadMarkedQuestions?page="+pageMarked, "markedQuestionsBody");
    unloadGif("Marked");
    pageMarked++;
}

function loadUnmarkedQuestions(conceptId) {
    loadGif("Unmarked");
    ajax("/concept/"+conceptId+"/loadUnmarkedQuestions?page="+pageUnmarked, "unmarkedQuestionsBody");
    unloadGif("Unmarked");
    pageUnmarked++;
}