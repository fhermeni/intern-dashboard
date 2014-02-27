var students = []
var applications = []
var majors = []
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
})

function getMajors() {
    $.get("/majors/", function(data) {
        var buf = ""
        data.forEach(function (m) {
            buf += '<li><a onclick="loadMajor(\'' + m + '\')">' + m + '</a></li>'
            majors.push(m)
        })
        //buf += "<li><a href='loadMajors()'><i>All</i></a></li>"
        $("#majors").html(buf)
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}

function categorizeStudents() {
    var nbGranted = 0
    var nbPendingInterviews = 0
    var nbOpen = 0
    var nbRejected = 0

    applications = []
    students.forEach(function (s) {
        $.ajax({
                type:'GET',
                async: false,
                url:'/users/' + s.id + '/'
            }).done(function(apps) {
            if (!applications.hasOwnProperty(s.id)) {
                applications[s.id] = []
            }
            apps.forEach(function (a) {
                applications[s.id].push(a)
            })
            }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
    })


    applications.forEach(function (userApps){
            var granted = false
            var rejected = 0
            var opened = 0
            var pendingInterviews = 0
            userApps.forEach(function (app) {
                if (app.status == "granted") {
                    granted = true
                    return false
                } else if (app.status == "open") {
                    if (app.nbInterviews > 0) {
                        pendingInterviews++
                    } else {
                        opened++;
                    }
                } else if (app.status == "denied") {
                    rejected++
                }
            })
            //Now we classify the users
            if (granted) {
                nbGranted++
            } else if (pendingInterviews > 0) {
                nbPendingInterviews++;
            } else if (opened > 0) {
                nbOpen++
            } else {
                nbRejected++
            }
    })

    //And we draw a nice progress bar
    console.log(applications.length)
    var stats = {
                 waiting : Math.round((nbOpen / students.length) * 100),
                 pending : Math.round((nbPendingInterviews / students.length) * 100),
                 granted : Math.round((nbGranted / students.length) * 100)
    }
    stats.rejected  = 100 - stats.waiting - stats.pending - stats.granted
    console.log(stats)
    console.log(templatizer.student_progress_bar(stats))
    $("#student-progress").html(templatizer.student_progress_bar(stats))

    //And the student table
    var buf = ""
    var i = 0
    applications.forEach(function (userApps){
        var granted = false
        var rejected = 0
        var opened = 0
        var pendingInterviews = 0
        var login = students[i++].login
        userApps.forEach(function (app) {
            if (app.status == "granted") {
                granted = true
                return false
            } else if (app.status == "open") {
                if (app.nbInterviews > 0) {
                    pendingInterviews++
                } else {
                    opened++;
                }
            } else if (app.status == "denied") {
                rejected++
            }
        })
        //Now we classify the user
        var style = "rejected"
        if (granted) {
            style = "granted"
        } else if (pendingInterviews > 0) {
            style = "pending"
        } else if (opened > 0) {
            style = "open"
        }
        buf += "<tr class='status-" + style + "'><td><span class='checkbox'><input type='checkbox'/><label>" + login + "</label></span></td></tr>"
    })
    $("#studentTable").html(buf)

}

function loadMajor(m) {
    students = []
    $.get("/majors/" + m, function(data) {
        students = data
        categorizeStudents()
    }).fail(function(data) {$("#err").html("<div class='alert alert-danger'>" + data.responseText + "</div>")})
}

$( document ).ready(function () {
    getMajors()
})