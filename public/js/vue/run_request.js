var run_request = new Vue({
    el: '#run_request'
    ,
    data: {
        anonymous: false
        ,auto_view: false
        ,domain: {
            name: ''
        }
        ,request: {
            status: 'init'
        }
        ,domain_display: []
        ,id_domain: -1
        ,id_request: -1
        ,password_clipboard: false
        ,redirect_done: false
        ,redirect_display_done: false
        ,request_done: false
        ,view: ''
        ,view_password: false
    }
    ,
    methods: {
        subscribe_domain_info: function(url, id_domain) {
            var parent=this;
            var ws = new WebSocket(url);
            ws.onopen = function(event) { ws.send('machine_info/'+id_domain) };
            ws.onclose = function() {
                parent.subscribe_domain_info(url, id_domain);
            };

            ws.onmessage = function(event) {
                var data = JSON.parse(event.data);
                parent.domain = data;
                for ( var i=0;i<data.hardware.display.length; i++ ) {
                    if (typeof(parent.domain_display) == 'undefined'
                        || typeof(parent.domain_display[i]) == 'undefined') {
                        parent.domain_display[i]= {};
                    }
                    var display = data.hardware.display[i];
                    display.display=display.driver+"://"+display.ip+":"+display.port;
                    var keys = Object.keys(display);
                    for ( var n_key=0 ; n_key<keys.length ; n_key++) {
                        var field=keys[n_key];
                        if (typeof(parent.domain_display[i][field]) == 'undefined'
                            || parent.domain_display[i][field] != display[field]) {
                            parent.domain_display[i][field] = display[field];
                        }
                    }
                }
                if (data.is_active && parent.request.status == 'done') {
                    //$scope.redirect();
                    if (parent.auto_view && !parent.redirected_display_done && parent.domain_display[0]
                        && !parent.domain_display[0].password) {
                        location.href='/machine/display/'+parent.domain_display[0].driver+"/"
                            +parent.domain.id+".vv";
                        parent.redirected_display_done=true;
                    }
                }
            }
        }
        ,
        subscribe_request: function(url, id_request) {
            console.log("subscribe request "+url+" "+id_request);
            var parent=this;
            this.id_request=id_request;
            this.id_domain=0;
            var already_subscribed_to_domain = false;
            var ws = new WebSocket(url);
            ws.onopen = function(event) { ws.send('request/'+id_request) };
            ws.onclose = function() {
                parent.subscribe_request(url, id_request);
            };

            ws.onmessage = function(event) {
                var data = JSON.parse(event.data);
                parent.request = data;
                parent.request_done = data.status == 'done';
                //console.log(parent.request_done);
                if ( data.id_domain && ! already_subscribed_to_domain ) {
                    already_subscribed_to_domain = true;
                    parent.id_domain=data.id_domain;
                    parent.subscribe_domain_info(url, data.id_domain);
                }
            }
        }
        ,
        copy_password: function(driver) {
            this.view_password=true;
            console.log("copy-password "+driver);
            var copyTextarea = document.querySelector('.js-copytextarea-'+driver);
            if (copyTextarea) {
                    copyTextarea.select();
                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Copying text command was ' + msg);
                        this.password_clipboard=successful;
                    } catch (err) {
                        console.log('Oops, unable to copy');
                    }

            }

        }
        ,
        redirect: function() {
            if (!this.redirect_done) {
                setTimeout(function() {
                    if(typeof $_anonymous != "undefined" && $_anonymous){
                        window.location.href="/anonymous";
                    }
                    else {
                        window.location.href="/logout";
                    }
                }, 180 * 1000);
                this.redirect_done = true;
            }
        }
        ,
        init: function( url, id_request) {
            this.subscribe_request(url, id_request);
        }
    }
});
console.log("run request vue loaded");
