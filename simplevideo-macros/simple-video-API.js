window.SimpleVideo = {
    Config: class Config {
        constructor(def, media) {
            Object.assign(this, def);

            this.controls ??= true;
            this.loop ??= false;
            this.autoplay ??= false;

            //make media non-iterable!
            Object.defineProperty(this, 'media', { value: media });

            this.set(this);
        }
        set(key, val) {
            //plain config object
            if (typeof key === 'object') {
                for (const k in key) this.set(k, key[k]);
                return;
            }

            if (key === 'speed') key = 'playbackRate';

            if (this.media instanceof Array) {
                //spread config to the child videos
                this.media.forEach(v => v.config.set(key, val))
            } else {
                //apply to video
                if (['autoplay', 'start', 'loop'].includes(key)) return;
                this.media.prop(key, val);
            }
            this[key] = val;
        }
    },
    Video: class Video {
        constructor(id, src, config, playlistID) {
            const vids = SimpleVideo.videos;

            if (typeof id !== 'string' || !id) throw new Error(`Improper video id, reading : '${id}'`);
            if (vids[id]) throw new Error(`Another video already exists for the '${id}' id`);

            this.id = id;

            this.elem = $('<video>').prop({ src, class: 'SimpleVideo', id });

            this.config = new SimpleVideo.Config(config, this.elem);

            if (playlistID) this.playlist = playlistID;

            vids[id] = this;
        }
        makeActive() {
            this.elem
                .on('ended', function () { $(this).trigger(':videoended') })
                .on('play', function () { $(this).trigger(':videoplay') })
                .on('pause', function () { $(this).trigger(':videopaused') });
            return this;
        }
        play() { this.elem[0].play() }
        pause() { this.elem[0].pause() }

        mute() { this.config.set('muted', true) }
        unmute() { this.config.set('muted', false) }

        toggleConfig(key) { this.config.set(key, !this.config[key]) }

        destroy() {
            delete SimpleVideo.videos[this.id];
        }
    },
    Playlist: class Playlist extends Array {
        constructor(id, list, config) {

            const { playlists: pl, videos: vids } = SimpleVideo, toInherit = ['mute', 'unmute', 'toggleConfig'];

            if (typeof id !== 'string' || !id) throw new Error(`Improper playlist id, reading : '${id}'`);
            if (pl[id]) throw new Error(`Another playlist already exists for the '${id}' id`);

            if (typeof list === 'string') list = list.split(' ');
            list = list.map((v, i) => vids[v] ? vids[v].toPlaylist(id, config) : new SimpleVideo.Video(id + '-' + i, v, config, id));

            super(...list);

            this.id = id;

            this.config = new SimpleVideo.Config(config, this);
            this.activeID = this.config.start ?? 0;

            toInherit.forEach(f => this[f] = SimpleVideo.Video.prototype[f]);

            this.active = this[this.activeID].makeActive();
            this.wrapper = $('<div>').attr({ class: `playlist-wrapper` }).append(this.active.elem);

            this.wrapper.on(':videoended', e => this.next());

            pl[id] = this;
        }

        play(i) {
            if (typeof i === 'number') {

                if (!this[i] && !this.config.loop) return;
                if (!this[i]) i = i < 0 ? this.length - 1 : i % this.length;

                const next = this[i].makeActive();

                this.active.elem.replaceWith(next.elem);
                this.active = next;
                this.activeID = i;
            }
            this.active.play();
        }
        pause() { this.active.pause() }

        playRandom() { this.play(Math.floor(this.length * Math.random())) }
        next() { this.play(this.activeID + 1) }
        prev() { this.play(this.activeID - 1) }

        add(vid) {
            this.push(vid);
            //apply playlist config to child vid
            vid.config.set(this.config);
        }
        destroy() {
            delete SimpleVideo.playlists[this.id];
            this.forEach(v => v.destroy());
        }
    },
    videos: {},
    playlists: {}
};