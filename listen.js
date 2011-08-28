   var IsMacChrome = navigator.userAgent.indexOf('Mac') != -1 &&
        navigator.userAgent.indexOf('Chrome') != -1;
    
    var samplerate = 48000, channel = 1, stream_length = 4096;

    var sinwave = function(frequency) {
        this.phase = 0.0;
        this.phaseStep = frequency / samplerate;
    };

    sinwave.prototype.next = function() {
        var retval = Math.sin(2 * Math.PI * this.phase);
        this.phase += this.phaseStep;
        return retval;
    };


    var StreamGenerator = function() {
        this.gen1  = new sinwave(440);
        this.gen2  = new sinwave(660);
        this.phase = new sinwave(880);
    };

    StreamGenerator.prototype.next = function() {
        var stream = [];
        var i, imax;
        var g1 = this.gen1, g2 = this.gen2;
        var v1 = this.phase.next() / 2.0 + 0.5, v2 = 1.0 - v1;
        for (i = 0, imax = stream_length; i < imax; i++) {
            stream[i] = (g1.next() * v1 + g2.next() * v2);
        }
        return stream;
    };


    /**
     * Audio Data API用のプレイヤー (Firefox 5.0-)
     */
    var MozPlayer = null;
    if (typeof new Audio().mozSetup === 'function') {
        MozPlayer = function() {
            this.audio = new Audio();
            this.audio.mozSetup(channel, samplerate);
            this.timerId = null;
            this.isPlaying = false;
        };

        MozPlayer.prototype.play = function(gen) {
            var self = this;

            if (this.timerId === null) {
                this.timerId = setInterval(function() {
                    var s = new Float32Array(gen.next());
                    self.audio.mozWriteAudio(s);
                }, stream_length / samplerate * 1000);
            }
            this.isPlaying = true;
        };

        MozPlayer.prototype.stop = function() {
            if (this.timerId !== null) {
                clearInterval(this.timerId);
            }
            this.isPlaying = false;
        };
    }


    /**
     * Web Audio API用のプレイヤー (Chrome, Safari)
     */
    var WebkitPlayer = null;
   // if (!IsMacChrome && typeof webkitAudioContext === 'function') {

        WebkitPlayer = function() {
            this.context = new webkitAudioContext();
            this.node = this.context.createJavaScriptNode(stream_length, 1, channel);
            this.isPlaying = false;
        };

        WebkitPlayer.prototype.play = function(gen) {
            var self = this;
            this.node.onaudioprocess = function(event) {
                var data = event.outputBuffer.getChannelData(0);
                var s = gen.next();
                var i = data.length;
                while (i--) data[i] = s[i];
            };
            this.node.connect(this.context.destination);
            this.isPlaying = true;
        };

        WebkitPlayer.prototype.stop = function() {
            this.node.disconnect();
            this.isPlaying = false;
        };
   // }


    /**
     * Audioタグを使うプレイヤー (Chrome, Firefox, Opera)
     */
    var HTML5AudioPlayer = null;
    if (typeof Audio === 'function') {
        HTML5AudioPlayer = function() {
            this.audio = null;
            this.timerId = null;
            this.isPlaying = false;
        };

        HTML5AudioPlayer.prototype.wavheader = function(samples) {
            var waveBytes = samples * channel * 2,
                l1 = waveBytes - 8,
                l2 = l1 - 36,
                retval = String.fromCharCode(
                    0x52, 0x49, 0x46, 0x46, // 'RIFF'
                    (l1 >>  0) & 0xFF, (l1 >>  8) & 0xFF,
                    (l1 >> 16) & 0xFF, (l1 >> 24) & 0xFF,
                    0x57, 0x41, 0x56, 0x45, // 'WAVE'
                    0x66, 0x6D, 0x74, 0x20, // 'fmt '
                    0x10, 0x00, 0x00, 0x00, // byte length
                    0x01, 0x00, // linear pcm
                    channel, 0x00, // channel
                    (samplerate >>  0) & 0xFF,
                    (samplerate >>  8) & 0xFF,
                    (samplerate >> 16) & 0xFF,
                    (samplerate >> 24) & 0xFF,
                    ((samplerate*channel*2) >>  0) & 0xFF,
                    ((samplerate*channel*2) >>  8) & 0xFF,
                    ((samplerate*channel*2) >> 16) & 0xFF,
                    ((samplerate*channel*2) >> 24) & 0xFF,
                    0x04, 0x00, // block size
                    0x10, 0x00, // 16bit
                    0x64, 0x61, 0x74, 0x61, //'data'
                    (l2 >>  0) & 0xFF, (l2 >>  8) & 0xFF,
                    (l2 >> 16) & 0xFF, (l2 >> 24) & 0xFF);
            return retval;
        };

        HTML5AudioPlayer.prototype.play = function(gen) {
            var self = this;
            var itercount = 20;

            if (this.timerId === null) {
                this.timerId = setInterval(function() {
                    var bytes = [], s, x, wav;
                    var i, imax, j, jmax;
                    for (i = 0, imax = itercount; i < imax; i++) {
                        s = gen.next();
                        for (j = 0, jmax = s.length; j < jmax; j++) {
                            x = (s[j] * 32767.0) >> 0;
                            bytes.push(String.fromCharCode(x & 0xFF, (x >> 8) & 0xFF));
                        }
                    }
                    wav = btoa(self.wavheader(bytes.length) + bytes.join(''));
                    self.audio = new Audio("data:audio/wav;base64," + wav);
                    self.audio.play();
                }, stream_length * itercount / samplerate * 1000);
            }
            this.isPlaying = true;
        };

        HTML5AudioPlayer.prototype.stop = function() {
            if (this.timerId !== null) {
                clearInterval(this.timerId);
            }
            if (this.audio !== null) {
                this.audio.pause();
                this.audio = null;
            }
            this.isPlaying = false;
        };
    }

    var RadioStreamGenerator = function(samples) {
        this.stream = samples;
    };

    RadioStreamGenerator.prototype.next = function() {
    	console.log(this.stream.length);
        return this.stream;
    };

$( function() {
    
    var player = new MozPlayer;
    var socket = io.connect();
    socket.on('podcast', function(from, samples) {
    	console.log(player);
        player.play(new RadioStreamGenerator(samples));
    });

});