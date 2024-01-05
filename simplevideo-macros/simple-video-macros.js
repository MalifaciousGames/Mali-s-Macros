/* Mali's SimpleVideo macros for Sugarcube */

Macro.add('video', {
    tags: ['onEnd', 'onStart', 'onPlay', 'onPause'],
    payToList: {
        onEnd: ':videoended',
        onStart: ':videostart',
        onPlay: ':videoplay',
        onPause: ':videopaused'
    },
    handler() {

        const [src, ...options] = this.args,
            config = options.find(o => typeof o === 'object') ?? {},
            events = this.self.payToList;

        options.filter(o => typeof o === 'string').forEach(o => config[o] = true);

        this.playlist = SimpleVideo.registry.playlists[src]?.setConfig(config) ?? new SimpleVideo.Playlist(config, src);

        const $wr = this.playlist.wrapper;

        this.payload.forEach((p, i) => {
            if (!i) return $wr.wiki(p.contents);
            $wr.on(events[p.name], e => $.wiki(p.contents));
        });

        $(this.output).append($wr);
    }
});

Macro.add(['mute', 'pause', 'play', 'volume', 'speed', 'videoConfig', 'fullscreen'], {
    handler() {

        //Traverse the parent chain to find the relevant playlist
        let playlist, parent = this.parent;
        while (!playlist && parent) {
            playlist = parent?.playlist;
            parent = parent.parent;
        };

        const n = this.name, active = playlist.active[0];

        if (!playlist) return this.error(`<<${this.name}>> macro only works inside a <<video>> block.`);

        switch (this.name) {
            case 'fullscreen':
                return playlist.wrapper[0].requestFullscreen();
            case 'videoConfig':
                return playlist.setConfig(this.args[0]);
            case 'play':
                if (this.args[0]) {
                    playlist.cycle(this.args[0] === 'next' ? 1 : -1);
                } else {
                    active.play();
                }
                break;
            case 'pause':
                return active[active.paused ? 'play' : 'pause']();
            case 'mute':
                return active.muted = !active.muted;
            case 'volume':
                let newVol = this.args[0];
                if (typeof this.args[0] === 'string') {
                    newVol = Math.clamp(0, active.volume + (this.args[0] === '-' ? -.1 : .1), 1);
                }
                playlist.setConfig({ volume: newVol })
        }
    }
});
