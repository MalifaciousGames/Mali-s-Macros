Macro.add('video', {
    tags: ['onEnd', 'onStart', 'onPlay', 'onPause'],
    eventPayload: {
        onEnd: ':videoended',
        onStart: ':videostart',
        onPlay: ':videoplay',
        onPause: ':videopaused'
    },
    count: 0,
    handler() {
        const [src, ...options] = this.args, config = options.find(o => typeof o === 'object');
        const { playlists: pl, videos: vids } = SimpleVideo;
        let $wr, vid;

        if (pl[src]) {
            //Existing playlist
            vid = pl[src];
            $wr = vid.wrapper;

        } else {
            if (vids[src]) {
                //Existing video
                vid = vids[src];
            } else {
                //Define new video
                vid = new SimpleVideo.Video(`macro-${this.name}-${this.count++}`, src);
            }
            $wr = $(`<div>`).append(vid.elem);
        }

        //Apply macro-level config
        vid.config.set(config);

        $wr.addClass(`macro-${this.name}`);

        //Used by children to access the video!
        this.media = { wrapper: $wr, vid };

        this.payload.forEach((p, i) => {
            if (!i) return $wr.wiki(p.contents);
            $wr.on(this.self.eventPayload[p.name], e => $.wiki(p.contents));
        });

        if (vid.config.autoplay) vid.play();

        $wr.appendTo(this.output);
    }
});

Macro.add(['mute', 'pause', 'play', 'volume', 'speed', 'videoConfig', 'fullscreen'], {
    handler() {

        //Traverse the parent chain to find the relevant playlist
        let media, parent = this.parent;
        while (!media && parent) {
            media = parent?.media;
            parent = parent.parent;
        };

        if (!media) return this.error(`<<${this.name}>> macro only works inside a <<video>> block.`);
        const n = this.name, { vid, wrapper } = media;

        switch (this.name) {
            case 'mute': return vid.toggleConfig('muted');
            case 'pause': return vid.pause();
            case 'play':
                if (this.args[0] === 'prev') return vid.prev();
                if (this.args[0] === 'next') return vid.next();
                return vid.play();
            case 'fullscreen': return wrapper[0].requestFullscreen();
            case 'prev': return vid.prev();
            case 'next': return vid.next();
        };

        //volume/speed should receive special treatment
        /*
         <<speed number>> => set to
        <<speed +/->> => +/- .1
    
    
    */

        /*switch (this.name) {
      case 'fullscreen':
            playlist.wrapper[0].requestFullscreen();
        break;
      case 'videoConfig':
        playlist.setConfig(this.args[0]);
        break;
      case 'play':
        
        if (this.args[0]) {
            playlist.cycle(this.args[0] === 'next' ? 1 : -1);
        } else {
            active.play();
        }
        break;
      case 'volume':
        let newVol = this.args[0];
        if (typeof this.args[0] === 'string') {
            newVol = Math.clamp(0, active.volume + (this.args[0] === '-' ? -.1 : .1), 1);
        }
        playlist.setConfig({volume : newVol})
        break;
    }*/

    }
});
