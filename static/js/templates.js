(function () {
var root = this, exports = {};

// The jade runtime:
var jade = exports.jade=function(exports){Array.isArray||(Array.isArray=function(arr){return"[object Array]"==Object.prototype.toString.call(arr)}),Object.keys||(Object.keys=function(obj){var arr=[];for(var key in obj)obj.hasOwnProperty(key)&&arr.push(key);return arr}),exports.merge=function merge(a,b){var ac=a["class"],bc=b["class"];if(ac||bc)ac=ac||[],bc=bc||[],Array.isArray(ac)||(ac=[ac]),Array.isArray(bc)||(bc=[bc]),ac=ac.filter(nulls),bc=bc.filter(nulls),a["class"]=ac.concat(bc).join(" ");for(var key in b)key!="class"&&(a[key]=b[key]);return a};function nulls(val){return val!=null}return exports.attrs=function attrs(obj,escaped){var buf=[],terse=obj.terse;delete obj.terse;var keys=Object.keys(obj),len=keys.length;if(len){buf.push("");for(var i=0;i<len;++i){var key=keys[i],val=obj[key];"boolean"==typeof val||null==val?val&&(terse?buf.push(key):buf.push(key+'="'+key+'"')):0==key.indexOf("data")&&"string"!=typeof val?buf.push(key+"='"+JSON.stringify(val)+"'"):"class"==key&&Array.isArray(val)?buf.push(key+'="'+exports.escape(val.join(" "))+'"'):escaped&&escaped[key]?buf.push(key+'="'+exports.escape(val)+'"'):buf.push(key+'="'+val+'"')}}return buf.join(" ")},exports.escape=function escape(html){return String(html).replace(/&(?!(\w+|\#\d+);)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},exports.rethrow=function rethrow(err,filename,lineno){if(!filename)throw err;var context=3,str=require("fs").readFileSync(filename,"utf8"),lines=str.split("\n"),start=Math.max(lineno-context,0),end=Math.min(lines.length,lineno+context),context=lines.slice(start,end).map(function(line,i){var curr=i+start+1;return(curr==lineno?"  > ":"    ")+curr+"| "+line}).join("\n");throw err.path=filename,err.message=(filename||"Jade")+":"+lineno+"\n"+context+"\n\n"+err.message,err},exports}({});


// create our folder objects

// 404.jade compiled template
exports["404"] = function tmpl_404(locals) {
    var buf = [];
    buf.push('<h1>' + jade.escape(null == (jade.interp = 'Not Found') ? '' : jade.interp) + '</h1><div>' + jade.escape(null == (jade.interp = 'Sorry, the page you are looking for does not exist.') ? '' : jade.interp) + '</div>');
    return buf.join('');
};

// 500.jade compiled template
exports["500"] = function tmpl_500(locals) {
    var buf = [];
    var locals_ = locals || {}, error = locals_.error;
    buf.push('<!DOCTYPE html><html><head><title>' + jade.escape(null == (jade.interp = '500 Error') ? '' : jade.interp) + '</title></head><body><h1>' + jade.escape(null == (jade.interp = 'The Server Encountered and Error') ? '' : jade.interp) + '</h1><div>' + jade.escape(null == (jade.interp = error) ? '' : jade.interp) + '</div></body></html>');
    return buf.join('');
};

// application_line.jade compiled template
exports["application_line"] = function tmpl_application_line(locals) {
    var buf = [];
    var locals_ = locals || {}, id = locals_.id, status = locals_.status, date = locals_.date, company = locals_.company, nbInterviews = locals_.nbInterviews;
    buf.push('<tr' + jade.attrs({
        id: 'app-' + id,
        'class': ['app-' + status]
    }, {
        id: true,
        'class': true
    }) + '><td>' + jade.escape((jade.interp = date) == null ? '' : jade.interp) + '</td><td>' + jade.escape((jade.interp = company) == null ? '' : jade.interp) + '</td><td><a' + jade.attrs({
        onclick: 'showEditModal(' + id + ')',
        title: 'Edit',
        'class': ['action_button']
    }, {
        onclick: true,
        title: true
    }) + '><i class="glyphicon glyphicon-pencil"></i></a><a' + jade.attrs({
        onclick: 'addInterview(' + id + ')',
        title: 'New interview',
        'class': ['action_button']
    }, {
        onclick: true,
        title: true
    }) + '><span' + jade.attrs({ id: 'interviews-' + id }, { id: true }) + '>' + jade.escape((jade.interp = nbInterviews) == null ? '' : jade.interp) + '</span><i class="glyphicon glyphicon-briefcase"></i></a><a' + jade.attrs({
        onclick: 'setStatus(' + id + ',\'open\')',
        title: 'Set pending',
        'class': ['action_button']
    }, {
        onclick: true,
        title: true
    }) + '><i class="glyphicon glyphicon-question-sign action_button"></i></a><a' + jade.attrs({
        onclick: 'setStatus(' + id + ',\'denied\')',
        title: 'Set rejected',
        'class': ['action_button']
    }, {
        onclick: true,
        title: true
    }) + '><i class="glyphicon glyphicon-remove-sign action_button"></i></a><a' + jade.attrs({
        onclick: 'setStatus(' + id + ',\'granted\')',
        title: 'Set granted!',
        'class': ['action_button']
    }, {
        onclick: true,
        title: true
    }) + '><i class="glyphicon glyphicon-ok-sign"></i></a></td></tr>');
    return buf.join('');
};


// attach to window or export with commonJS
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = exports;
} else if (typeof define === "function" && define.amd) {
    define(exports);
} else {
    root.templatizer = exports;
}

})();