class Camera
{
    constructor()
    {
        this.isEnabled = false;
        this.isCreated = false;
        this.canvas = null;
        this.video = null;
        this.stream = null;
        this.ctx = null;
        this.updateCallback = null;
        // reference to animation returned by requestAnimationFrame()
        this.animation = null; 
    }

    create(target)
    {
        if (this.isCreated) return;
        if (target == undefined) {
            console.error('Target is undefined', target);
            return;
        }
        this.canvas = target;
        // create Video Element
        const domElement = document.createElement('video');
        // required to work in iOS 11 & up:
        domElement.setAttribute('playsinline', '');
    
        navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: false 
        })
        .then(stream => {
            try {
                if ('srcObject' in domElement) {
                    domElement.srcObject = stream;
                } else {
                    domElement.src = window.URL.createObjectURL(stream);
                }
                this.stream = stream;
                this.isCreated = true;
            } catch (err) {
                domElement.src = stream;
            }
        }, console.log);
    
        const videoEl = document.body.appendChild(domElement);
        videoEl.loadedmetadata = false;
        // set width and height onload metadata
        domElement.addEventListener('loadedmetadata', _ => {
            domElement.play();
            if (domElement.width) {
                videoEl.width = domElement.width;
                videoEl.height = domElement.height;
            } else {
                videoEl.width = domElement.videoWidth;
                videoEl.height = domElement.videoHeight;
            }
            this.canvas.width = videoEl.width;
            this.canvas.height = videoEl.height;
            videoEl.loadedmetadata = true;
        });
    
        videoEl.style.display = 'none';
        this.video = videoEl;
        this.ctx = this.canvas.getContext('2d');
    }

    step()
    {
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        if (this.updateCallback)
        {
            this.updateCallback(this.ctx);
        }
        this.animation = requestAnimationFrame(this.step.bind(this));
    }

    start()
    {
        if (this.animation) return;
        requestAnimationFrame(this.step.bind(this));
    }

    stop()
    {
        if (!this.animation) return;
        cancelAnimationFrame(this.animation);
        this.animation = null;
    }

    setUpdateCallback(callback)
    {
        this.updateCallback = callback;
    }

    getDataUrl()
    {
        return this.canvas.toDataURL();
    }

    remove()
    {
        if (!this.isCreated) return;
        document.body.removeChild(this.video);
        this.isCreated = false;
        this.stream.getTracks().forEach(t => t.stop());
    }
}