function confirmation(){
    var result = confirm("¿Está seguro de eliminar la opción seleccionada?");
    if(result){
    	return true;
    }
    else{
    	return false;
    }
}