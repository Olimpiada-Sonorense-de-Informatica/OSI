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
    var array = window.sessionStorage.getItem("Lista");
    console.log(array);
    var arrayN = array.filter(element => function (){
        console.log(element);
    })
    var content = "";
    array.forEach(function(row) {
        content += "<tr>";
        row.forEach(function(cell) {
            content += "<td>" + cell + "</td>" ;
        });
        content += "</tr>";
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
    window.sessionStorage.setItem("Lista", resultArray);
    return resultArray;
}