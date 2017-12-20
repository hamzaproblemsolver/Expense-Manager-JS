$(function () {
    var today = new Date();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    max = yyyy+'-'+mm+'-'+today.getDate();
    min = yyyy+'-'+mm+'-01';

    console.log(max+" "+min);

    $("#date").attr("max", max);
    $("#date").attr("min", min);
});