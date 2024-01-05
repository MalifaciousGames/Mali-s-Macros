/* Mali's SimpleVideo API */

window.SimpleVideo = {

    registry: {
        media: {},
        playlists: {}
    },

    initVid(src) {
        return $('<video>').prop({
            src: src,
            class: 'SimpleVideo',
            autoplay: false
        }).on('error', function (e) {
            const errorView = $('<div>').attr({
                class: 'error-view videoError'
            }).text(`The url "${src}" could not be loaded.`);

            $(this).replaceWith(errorView);

        });
    },
    register(id, src, config) {
        if (Array.isArray(src)) {//is a whole playlist
            return this.registry.playlists[id] = new this.Playlist(config, src);
        }
        this.registry.media[id] = this.initVid(src);
    },
    Playlist: class Playlist extends Array {
        constructor(config, list) {

            if (typeof list === 'string') {
                list = list.split(' ');
            }

            super(...list.map(vid => SimpleVideo.registry.media[vid] ?? SimpleVideo.initVid(vid)));

            this.isPlaying = false;
            this.config = {};
            this.setConfig(config);

            this.change(0);

            if (this.autoplay) {//do ony init
                this.play();
            }

            if (this.counter) {
                //build counter elem
            }
            this.wrapper = $('<div>').attr({ class: `SimpleVideo-wrapper` }).append(this.active);
        }
        add(vid) {
            const $vid = SimpleVideo.registry.media[vid] ?? SimpleVideo.initVid(vid);
            $vid.prop(this.config); //pass playlist config
            this.push($vid);
        }
        setConfig(config) {
            if (config) {
                //Separate autoplay from other options to stop the video from all playing in the background
                for (const k in config) {
                    k === 'autoplay' || k === 'counter' || k === 'loop' ? this[k] = true : this.config[k] = config[k];
                }
            }

            this.forEach(v => v.prop(this.config));
            return this;
        }
        change(i, play) {

            const next = this.at(this.activeID = i);

            if (this.active) {
                this.active.replaceWith(next);
            }

            this.active = next;

            next.on('ended', e => {
                this.isPlaying = false;
                this.trigger(':videoended');
                this.cycle(1);
            })
                .on('play', e => {
                    this.trigger(this.isPlaying ? ':videoplay' : ':videostart')
                    this.isPlaying = true;
                })
                .on('pause', e => this.trigger(':videopaused'));

            if (play || this.autoplay) next[0].play();
        }
        trigger(ev) {//trigger special events on the wrapper
            const event = { type: ev, wrapper: this.wrapper[0], video: this.active[0] };
            this.wrapper.trigger(event);
        }
        cycle(i) {
            let newActive = this.activeID + i;

            if (this.loop) {
                newActive %= this.length;
            }

            if (!this.at(newActive)) return false;

            this.change(newActive);
        }
        play(i) {
            if (i != null) {
                if (!this[i]) return false;
                this.change(i);
            }

            this.active[0].play();
        }
    }
};

/* End of the SimpleVideo API */