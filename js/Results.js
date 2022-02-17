function createTable(data) {
    var array = parseResult(data)
    /*
    var content = "";
    array.forEach(function(row) {
        content += "<tr>";
        row.forEach(function(cell) {
            content += "<td>" + cell + "</td>" ;
        });
        content += "</tr>";
    });
    document.getElementById("bodyDinamico").innerHTML = content;*/
    refreshTable();
}

function refreshTable(){
    var array = JSON.parse(localStorage.getItem("Lista"));
    //console.log(array);
    var content = "";
    let obj = document.getElementById("txtFiltro").value;
    console.log(obj);
    array.forEach(function(row) {
        var content1 = "<tr>";
        var valido = true;
        row.forEach(function(cell) {
            content1 += "<td>" + cell + "</td>" ;
        });
        content1 += "</tr>";
        if(content1.indexOf(obj) == -1)
            valido = false;
        if(valido)
            content+=content1;
    });
    document.getElementById("bodyDinamico").innerHTML = content;
}

function parseResult(result) {
    //console.log(result);
    var resultArray = [];
    result.split("\n").forEach(function(row) {
        var rowArray = [];
        row.split(",").forEach(function(cell) {
            rowArray.push(cell);
        });
        resultArray.push(rowArray);
    });
    localStorage.setItem("Lista", JSON.stringify(resultArray));
    return resultArray;
}


function Filtrar(evt){
    alert(evt);
  }