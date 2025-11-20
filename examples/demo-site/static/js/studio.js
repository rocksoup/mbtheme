document.addEventListener("DOMContentLoaded", function() {
  let videos = document.querySelectorAll("video");

  videos.forEach(function (video) {
    let src = video.getAttribute("src");
    if (!src) {
      let source = video.querySelector("source[type='application/x-mpegURL'], source[type='application/vnd.apple.mpegURL']");
      if (source) {
        src = source.getAttribute("src");
      }
    }

    if (!src || src.indexOf(".m3u8") == -1) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari: native support
      video.src = src;
    }
    else if (window.Hls && Hls.isSupported()) {
      // Chrome and Firefox: hls.js
      let hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    }
    else {
      // very old browsers
      video.src = src;
    }
  });
});
