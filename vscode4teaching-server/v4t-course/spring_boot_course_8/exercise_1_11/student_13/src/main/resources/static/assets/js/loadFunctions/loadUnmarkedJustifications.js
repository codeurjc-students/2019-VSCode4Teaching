var numPageUnmarkedJust = 0;
function loadUnmarkedJustifications(gifDiv, urlPage, contentId) {
    loadGif(gifDiv);
    ajax(urlPage + "?page=" + numPageUnmarkedJust ,contentId);
    unloadGif(gifDiv);
    numPageUnmarkedJust++;
}