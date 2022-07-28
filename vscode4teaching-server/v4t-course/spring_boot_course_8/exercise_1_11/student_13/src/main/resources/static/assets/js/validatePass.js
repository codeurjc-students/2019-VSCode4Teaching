function validatePass() {
  var x = document.forms["form"]["password"].value;
  if (x == "") {
    alert("Se requiere una contraseña");
    return false;
  }
}