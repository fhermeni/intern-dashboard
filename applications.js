module.exports = {

    newApplication : function(user, date, company, note, next) {
        if (empty("date", date, next) || empty("company", company, next) || !userExists(user, next)) {
            return
        }
        var id = applications.length
        var app = {"id" : id, date : date, company : company, note : note, nbInterviews: 0, status : "open", userId : user}
        applications.push(app)
        ping(user)
        next(null, app)
    },

    updateApplication : function(user, id, cnt, next) {
        if (!appExists(user, id, next)) {
            return
        }
        var app = applications[id]
        if (cnt.hasOwnProperty("note")) {
            app.note = cnt.note
        }
        if (cnt.hasOwnProperty("date")) {
            if (cnt.date.length == 0) {
                next(new Error("The date is required"))
                return
            }
            app.date = cnt.date
        }
        if (cnt.hasOwnProperty("company")) {
            if (cnt.company.length == 0) {
                next(new Error("Company is required"))
                return
            }
            app.company = cnt.company
        }
        ping(user)
        next(null)
    },

    getApplications : function(user, next) {
        if (!userExists(user, next)) {
            return
        }
        res = []
        applications.forEach(function (app) {
            if (app.userId == user) {
                res.push(app)
            }
        })
        next(null, res)
    },
    getAllApplications : function(next) {
        next(null, applications)
    },
    getAllUsers : function(next) {
        next(null, users)
    },
    incInterview : function(user, id, next) {
        if (!appExists(user, id, next)) {
            return
        }
        applications[id].nbInterviews++
        ping(user)
        next(null, applications[id].nbInterviews)
    },

    setStatus : function(user, id, st, next) {
        if (empty("status", st, next) || !appExists(user, id, next)) {
            return
        }
        if (st == "denied" || st == "granted" || st == "open") {
            applications[id].status = st;
            ping(user)
            next(null, st)
        } else {
            next(new Error("Unsupported status '" + st + "'"))
        }
    },
    setNote : function(user, id, n, next) {
        if (!appExists(user, id, next)) {
            return
        }
        applications[id].note = n;
        ping(user)
        next(null)
    },
    isRegistered : function(mail, password, next) {
        users.forEach(function(u) {
            if (u.email == mail && u.password == password) {
                next(null, u)
                return
            }
        })
    },
    newUser : function(login, mail, p, major) {
        var id = users.length
        var u = {id : id, username : login, email: mail, password: p, major : major}
        users.push(u)
        ping(id)
        return u
    }
}

var applications = []

var users = [{id : 0,
    username: "Fabien Hermenier", password: "foo", email:"fabien.hermenier@unice.fr", major:"CSSR"}]


function empty(id, x, next) {
    if (x == undefined ||  x.length == 0) {
        next(new Error("Missing parameter for '" + id + "'"), null)
        return true;
    }
    return false
}

function userExists(userId, next) {
    if (userId != undefined && userId >= 0 && userId < users.length) {
        return true;
    }
    next(new Error("Unknown user '" + userId + "'"))
    return false
}

function appExists(user, id, next) {
    if (userExists(user, next)) {
        if (id == undefined || id < 0 || id > applications.length) {
            next(new Error("Unknown application id '" + id + "'"))
            return false
        }
        app = applications[id]
        if (app.userId != user) {
            next(new Error("Permission denied. This is not your application"))
            return false
        }

    }
    return true
}

function ping(uId) {
    users[uId].lastUpdate = new Date().getTime()
}