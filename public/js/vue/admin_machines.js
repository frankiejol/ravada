var admin_machines = new Vue({
    el: '#admin_machines'
    ,
    data: {
        check_netdata: false
        ,bases: []
        ,bases_public: []

        ,download_done: false
        ,download_working: false

        ,list_machines: {}
        ,list_machines_time: 0

        ,modal_machine: {}

        ,pingbe_fail: false

        ,refresh_modal_base: 0
        ,requests: []

        ,show_machine: {}
        ,show_modal_prepare_base:false
        ,show_requests: false
        ,show_clones: {}

        ,with_cd: false

        ,ws_connected: false
        ,ws_fail: false
    }
    ,
    methods: {
        can_remove_base: function(machine) {
            return machine.is_base > 0 && machine.has_clones == 0 && machine.is_locked ==0;
        }
        ,
        can_prepare_base: function(machine) {
            return machine.is_base == 0 && machine.is_locked ==0;
        }
        ,

        init_netdata: function() {
        }
        ,
        open_modal_prepare_base: function(machine){
            var self = this;
            this.with_cd = false;
            this.modal_machine=machine;
            if (machine.is_base) {
                this.$refs['modal_remove_base'].show()
            } else {
                this.$refs['modal_prepare_base'].show()
            }
            if (!machine.info) {
                fetch("/machine/info/"+machine.id+".json")
                    .then(response => ( response.json()))
                    .then(data => { this.modal_machine.info = data;
                        console.log(data.cdrom);
                        self.refresh_modal_base++;
                    });
            }
        }
        ,
        _remove_from_bases(id) {
            var bases2 = [];
            for (var i=0; i<this.bases.length; i++) {
                if (this.bases[i] != id) {
                    bases2.push(this.bases[i]);
                }
            }
            this.bases = bases2;
        }
        ,
        _remove_from_publics(id) {
            var bases2 = [];
            for (var i=0; i<this.bases_public.length; i++) {
                if (this.bases_public[i] != id) {
                    bases2.push(this.bases_public[i]);
                }
            }
            this.bases_public = bases2;
        }

        ,
        cancel_modal_prepare_base: function(ok){
            this.$refs['modal_prepare_base'].hide()
            if ( !ok ) {
                this.modal_machine.is_base = this.modal_machine.is_base_old;
                this._remove_from_bases(this.modal_machine.id);
            }
        }
        ,
        cancel_modal_remove_base: function(ok){
            this.$refs['modal_remove_base'].hide()
            if ( !ok ) {
                this.modal_machine.is_base = this.modal_machine.is_base_old;
                this.bases.push(this.modal_machine.id);
            }
        }
        ,
        has_cdrom: function() {
            return this.modal_machine && this.modal_machine.info
                && this.modal_machine.info.cdrom && this.modal_machine.info.cdrom.length>0;
        }
        ,
        request: function(request, args) {
            var options = {
                method: "POST"
                ,headers: { "Content-Type": "application/json" }
                ,body: JSON.stringify(args)
            };
            fetch('/request/'+request+'/', options)
            .then(response => response.json())
            .then(data => (this.id_request = data.id));
            ;
        }
        ,
        subscribe_list_machines: function(url) {
            var self = this;
            this.ws_connected = false;
            setTimeout(function() {
                if (!this.ws_connected) {
                    this.ws_fail = true;
                }
            }, 5 * 1000);
            var ws = new WebSocket(url);
            ws.onopen    = function (event) {
                self.ws_connected = true ;
                self.ws_fail = false;
                ws.send('list_machines_tree');
            };
            ws.onclose = function() {
                ws = new WebSocket(url);
            };
            ws.onmessage = function (event) {
                self.list_machines_time++;
                var data = JSON.parse(event.data);

                var mach;
                if (Object.keys(self.list_machines).length != data.length) {
                    self.list_machines = {};
                }
                for (var i=0, iLength = data.length; i<iLength; i++){
                    mach = data[i];
                    if (typeof self.list_machines[i] == 'undefined'
                        || self.list_machines[i].id != mach.id
                        || self.list_machines[i].date_changed != mach.date_changed
                    ){
                        var show=false;
                        if (mach._level == 0 ) {
                            mach.show=true;
                        }
                        if (self.show_machine[mach.id]) {
                            mach.show = self.show_machine[mach.id];
                        } else if(mach.id_base && self.show_clones[mach.id_base]) {
                            mach.show = true;
                        }
                        if (typeof self.show_clones[mach.id] == 'undefined') {
                            self.show_clones[mach.id] = false;
                        }
                        mach.is_base = !!mach.is_base;
                        mach.is_base_old= mach.is_base;
                        if (mach.is_base && self.bases.indexOf(mach.id)<0) {
                            self.bases.push(mach.id);
                        }
                        if (!mach.is_base && self.bases.indexOf(mach.id)>0) {
                            self._remove_from_bases(mach.id);
                        }
                        if (mach.is_public && self.bases_public.indexOf(mach.id)<0) {
                            self.bases_public.push(mach.id);
                        }
                        if (!mach.is_public && self.bases_public.indexOf(mach.id)>0) {
                            self._remove_from_publics(mach.id);
                        }

                        self.list_machines[i] = mach;
                    }
                }
            }
        }
        ,
        subscribe_list_requests: function(url) {
            var self = this;
            this.show_requests = false;
            var ws = new WebSocket(url);
            ws.onopen    = function (event) { ws.send('list_requests') };
            ws.onclose = function() {
                ws = new WebSocket(url);
            };

            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                self.requests = data;
                download_done=false;
                download_working =false;
                for (var i = 0; i < data.length; i++){
                    if ( data[i].command == 'download') {
                        if (data[i].status == 'done') {
                            self.download_done=true;
                        } else {
                            self.download_working=true;
                        }
                    }
                }

            }
        }
        ,
        subscribe_ping_backend: function(url) {
            var self = this;
            var ws = new WebSocket(url);
            ws.onopen = function(event) { ws.send('ping_backend') };
            ws.onmessage = function(event) {
                var data = JSON.parse(event.data);
                self.pingbe_fail = !data;
            };
        }
        ,
        subscribe_all: function(url) {
            this.subscribe_list_machines(url);
            this.subscribe_list_requests(url);
            this.subscribe_ping_backend(url);
        }
        ,
        set_show_clones: function(id, show) {
            this.show_clones[id] = show;
            for (var [key, mach ] of Object.entries(this.list_machines)) {
                if (mach.id_base == id) {
                    mach.show = show;
                    this.show_machine[mach.id] = mach.show;
                    if ( !mach.show) {
                        this.set_show_clones(mach.id, false);
                    }
                }
            }
        }
        ,
        toggle_public: function(machine) {
            var set=0;
            if (machine.is_public) {
                machine.is_public=false;
                this._remove_from_publics(machine.id);
            } else {
                set=1;
                machine.is_public=true;
                this.bases_public.push(machine.id);
            }
            fetch("/machine/public/"+machine.id+"/"+set)
                    .then(response => ( response.json()))

        }
        ,
        toggle_show_clones: function(id) {
            this.show_clones[id] = !this.show_clones[id];
            // Hack to refresh
            this.show_requests = !this.show_requests; // This is a hack ! TODO
            for (var [key, mach ] of Object.entries(this.list_machines)) {
                if (mach.id_base == id) {
                    mach.show = this.show_clones[id];
                    this.show_machine[mach.id] = mach.show;
                    if ( !mach.show) {
                        this.set_show_clones(mach.id, false);
                    }
                }
            }
            // second part of the hack to refresh
            this.show_requests = !this.show_requests; // This is a hack ! TODO

        }
    }
});
