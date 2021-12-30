// copyValue()
// Focuses into given input, selects its value and copies it to OS clipboard.
const copyValue = (input, copyButton) => {
    input.focus();
    input.setSelectionRange(0, input.value.length);
    if (!navigator.clipboard) {
        document.execCommand("copy");
    } else {
        navigator.clipboard.writeText(input.value).then(function () {
            copyButton.innerHTML = "Copied!";
        });
    }
};

// restoreStatus()
// Returns the Copy button and input to its "disabled" state.
const restoreStatus = (input, copyButton) => {
    input.blur();
    copyButton.innerHTML = "Copy";
};

// Event triggering: there are two ways to copy the code: using the button or clicking into the input
document.getElementById("codeCopyBtn").addEventListener("click", (evt) => copyValue(evt.target.previousElementSibling, evt.target));
document.getElementById("givenCodeInput").addEventListener("focus", (evt) => copyValue(evt.target, evt.target.nextElementSibling));

// Event triggering: when the given input loses the focus, the initial state is restored
document.getElementById("givenCodeInput").addEventListener("blur", (evt) => restoreStatus(evt.target, evt.target.nextElementSibling));
