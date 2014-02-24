/*
* Author: Fabien Hermenier
*/

function newApplication() {
    console.log("send new application")
    application = {
        company : $("#companyInput").val(),
        description : $("#descInput").val(),
        date : $("#dateInput").val()
    }
    $.post("rest/applications", application, function(data) {
        id = document.getElementById("applications");
        tr = id.insertRow("-1");
        tr.setAttribute("id", "app-" + data.id)
        var x = {};
        x.application = data
        jade.render(tr, "application_line", x)
    }).fail(function(data) {console.log(data)});
}

function addInterview(id) {
    $.ajax({
        type:'PUT',
        url:'rest/applications/' + id + "/interviews"
    }).done(function(data, textStatus, jqXHR) {console.log(textStatus); console.log("data=" + data);$("#interviews-" + id).html(data)})
      .fail(function(xhr, status, jqXhr) {console.log("denied " + status)});
}

function setStatus(id, status) {
    $.ajax({
        type:'PUT',
        url:'rest/applications/' + id + "/status",
        data : {status : status}
    }).done(function(data, textStatus, jqXHR) {
        $("#app-" + id).removeClass("app-denied app-granted app-open")
        $("#app-" + id).addClass("app-"+status)
    })
     .fail(function(xhr, status, jqXhr) {console.log(status)});
}