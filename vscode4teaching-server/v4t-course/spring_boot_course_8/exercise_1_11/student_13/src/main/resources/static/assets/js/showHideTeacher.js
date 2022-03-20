function showJustification(incorrectId, defaultJustificationClass, marked, id) {
  //Id only necessary if marked is true
  if (document.getElementById(incorrectId).checked) {
    var justifications = document.getElementsByClassName(
      defaultJustificationClass
    );
    for (var i = 0; i < justifications.length; i++) {
      justifications[i].style.display = "block";
    }
    if (marked) $("#showMoreBtnJustMarked" + id).show();
  } else {
    var justifications = document.getElementsByClassName(
      defaultJustificationClass
    );
    for (var i = 0; i < justifications.length; i++) {
      justifications[i].style.display = "none";
    }
    if (marked) {
      $("#showMoreBtnJustMarked" + id).hide();
    }
  }
}
function showError(invalidId) {
  if (document.getElementById(invalidId).checked) {
    var z = $("#" + invalidId);
    var a = z.parent().parent();
    var b = a.siblings(".errorAnswer");
    b.show();
  } else {
    var z = $("#" + invalidId);
    var a = z.parent().parent();
    var b = a.siblings(".errorAnswer");
    b.hide();
  }
}

function showJustificationFieldAddModal() {
  if (document.getElementById("incorrectAddModal").checked) {
    document.getElementById("addJustificationInModal").style.display = "block";
  } else {
    document.getElementById("addJustificationInModal").style.display = "none";
  }
}

function showJustificationErrorFieldAddModal() {
  if (document.getElementById("invalidAddModal").checked) {
    document.getElementById("errorAddModal").style.display = "block";
  } else {
    document.getElementById("errorAddModal").style.display = "none";
  }
}

function showJustificationErrorNewJust(id) {
  if (document.getElementById("invalidAddNewJustification"+id).checked) {
    document.getElementById("errorNewJust"+id).style.display = "block";
  } else {
    document.getElementById("errorNewJust"+id).style.display = "none";
  }
}