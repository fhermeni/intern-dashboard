module.exports = {

    newApplication : function(user, date, company, note, next) {
        if (empty("date", date, next) || empty("company", company, next) || !userExists(user, next)) {
            return
        }
        if (!applications.hasOwnProperty(user)) {
            applications[user] = []
        }
        var id = applications[user].length
        var app = {"id" : id, date : date, company : company, note : note, nbInterviews: 0, status : "open"}
        applications[user].push(app)
        next(null, app)
    },

    updateApplication : function(user, id, cnt, next) {
        if (!appExists(user, id, next)) {
            return
        }
        var app = applications[user][id]
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
        next(null)
    },

    getApplications : function(user, next) {
        if (!userExists(user, next)) {
            return
        }
        var res = applications[user]
        if (!res) {
            res = []
            applications[user] = res
        }
        next(null, res)
    },

    incInterview : function(user, id, next) {
        if (!appExists(user, id, next)) {
            return
        }
        applications[user][id].nbInterviews++
        next(null, applications[user][id].nbInterviews)
    },
    setStatus : function(user, id, st, next) {
        if (empty("status", st, next) || !appExists(user, id, next)) {
            return
        }
        if (st == "denied" || st == "granted" || st == "open") {
            applications[user][id].status = st;
            next(null, st)
        } else {
            next(new Error("Unsupported status '" + st + "'"))
        }
    },
    setNote : function(user, id, n, next) {
        if (!appExists(user, id, next)) {
            return
        }
        applications[user].id.note = n;
        next(null)
    },
    isRegistered : function(mail, password, next) {
        users.forEach(function(u) {
            if (u.login == mail && u.password == password) {
                next(null, u)
                return
            }
        })
    },
    listMajors : function() {
        var m = {}
        users.forEach(function (u) {
            if (u.hasOwnProperty("major")) {
                m[u.major] = true
            }
        })
        return Object.keys(m);
    },
    getMajor : function(m) {
        var students = []
        users.forEach(function (u) {
            if (u.hasOwnProperty("major")) {
                if (u.major == m) {
                    students.push(u)
                }
            }
        })
        return students
    },
    newUser : function(mail, p, major) {
        var id = users.length
        var u = {id : id, login: mail, password: p, major : major}
        users.push(u)
        return u
    }
}

var applications = []
nbApplications = 0;

var users = [
    {id :0, login: "fabien.hermenier@unice.fr", password: "foo", major: "CSSR"},
    {id :1, login: "fabien.hermenier@inria.fr", password: "bar", admin:true}
]


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
        if (id != undefined && id >= 0 && id < applications[user].length) {
            return true
        }
        next(new Error("Unknown application id '" + id + "'"))
    }
    return false
}