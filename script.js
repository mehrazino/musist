/* Global variables for playlist and player state */
var playlist = []; // Array to hold playlist URLs
var currentTrackIndex = 0; // Current track index in playlist
var audioPlayer = document.getElementById('musicPlayer'); // Main audio player element
var isRepeat = false; // Flag for repeat mode
var isRandom = false; // Flag for random mode
var isTransitioning = false; // Flag to prevent button flickering during track transitions

/* Load playlist from playlist.txt file */
function loadPlaylist() {
    fetch('playlist.txt')
        .then(response => response.text())
        .then(data => {
            playlist = data.trim().split('\n');
            if (playlist.length > 0) {
                loadTrack(0); // Load first track
            }
        });
}

/* Load a specific track by index */
function loadTrack(index) {
    if (index < playlist.length) {
        audioPlayer.src = playlist[index];
        audioPlayer.load();
    }
}

/* Toggle play/pause state */
function togglePlay() {
    var btn = document.querySelector('.play-text');
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0; // Reset click sound
    clickAudio.play();
    if (btn.textContent === '[play]') {
        btn.textContent = '[pause]';
        audioPlayer.play();
    } else {
        btn.textContent = '[play]';
        audioPlayer.pause();
    }
}

/* Update the track number display */
function updateTrackNumber() {
    document.querySelector('.track-number').textContent = '[' + (currentTrackIndex + 1) + ']';
}

/* Generate a random track index, avoiding consecutive repeats */
function getRandomIndex() {
    var newIndex;
    do {
        newIndex = Math.floor(Math.random() * playlist.length);
    } while (newIndex === currentTrackIndex && playlist.length > 1);
    return newIndex;
}

/* Advance to next track (used for auto-advancement when track ends) */
function nextTrack() {
    isTransitioning = true; // Prevent button flickering
    if (isRandom) {
        currentTrackIndex = getRandomIndex();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    updateTrackNumber();
    setTimeout(function() {
        audioPlayer.play();
        setTimeout(function() {
            isTransitioning = false; // Allow button updates after transition
        }, 500);
    }, 100);
}

/* Manually go to next track (user initiated) */
function nextTrackManual() {
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0;
    clickAudio.play();
    if (isRandom) {
        currentTrackIndex = getRandomIndex();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    updateTrackNumber();
    setTimeout(function() {
        audioPlayer.play();
    }, 100);
}

/* Manually go to previous track (user initiated) */
function prevTrack() {
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0;
    clickAudio.play();
    if (isRandom) {
        currentTrackIndex = getRandomIndex();
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    updateTrackNumber();
    setTimeout(function() {
        audioPlayer.play();
    }, 100);
}

/* Toggle repeat mode (loop current track) */
function toggleRepeat() {
    var btn = document.querySelector('.repeat-btn');
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0;
    clickAudio.play();
    // Disable random mode if active (mutually exclusive)
    if (isRandom) {
        isRandom = false;
        document.querySelector('.random-btn').classList.remove('active');
        document.querySelector('.random-btn').setAttribute('aria-pressed', 'false');
    }
    isRepeat = !isRepeat;
    if (isRepeat) {
        btn.classList.add('active');
        audioPlayer.loop = true;
        btn.setAttribute('aria-pressed', 'true');
    } else {
        btn.classList.remove('active');
        audioPlayer.loop = false;
        btn.setAttribute('aria-pressed', 'false');
    }
}

/* Event listeners for audio player state changes */
audioPlayer.addEventListener('ended', function() {
    if (!isRepeat) {
        setTimeout(function() {
            nextTrack(); // Auto-advance to next track
        }, 100);
    }
});

audioPlayer.addEventListener('pause', function() {
    if (!audioPlayer.ended && !isTransitioning) {
        document.querySelector('.play-text').textContent = '[play]';
    }
});

audioPlayer.addEventListener('play', function() {
    if (!isTransitioning) {
        document.querySelector('.play-text').textContent = '[pause]';
    }
});

/* Download the currently playing track */
function downloadCurrentTrack() {
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0;
    clickAudio.play();
    var trackUrl = playlist[currentTrackIndex].trim();
    var filename = trackUrl.split('/').pop();
    if (!filename) {
        filename = 'track.mp3'; // Fallback filename
    }
    // Decode URL to handle special characters properly
    filename = decodeURIComponent(filename);
    var link = document.createElement('a');
    link.href = trackUrl;
    link.download = filename;
    link.target = '_blank'; // Open in new tab if download fails
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* Toggle random playback mode */
function toggleRandom() {
    var btn = document.querySelector('.random-btn');
    var clickAudio = document.getElementById('clickSound');
    clickAudio.currentTime = 0;
    clickAudio.play();
    // Disable repeat mode if active (mutually exclusive)
    if (isRepeat) {
        isRepeat = false;
        document.querySelector('.repeat-btn').classList.remove('active');
        audioPlayer.loop = false;
        document.querySelector('.repeat-btn').setAttribute('aria-pressed', 'false');
    }
    isRandom = !isRandom;
    if (isRandom) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentTrackIndex = getRandomIndex();
        loadTrack(currentTrackIndex);
        updateTrackNumber();
        setTimeout(function() {
            audioPlayer.play(); // Start playing random track
        }, 100);
    } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    }
}

/* Keyboard event listener for play/pause, next, and previous */
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent scrolling
        var playBtn = document.querySelector('.play-text');
        flashButton(playBtn);
        pressEffect(playBtn);
        // Don't move focus for keyboard shortcuts, only for Tab navigation
        setTimeout(function() {
            togglePlay(); // Use existing togglePlay function
        }, 150);
    } else if (event.code === 'ArrowRight') {
        // Next track (available even in repeat mode for manual control)
        event.preventDefault();
        var nextBtn = document.querySelector('.control-btn:nth-child(3)');
        flashButton(nextBtn);
        pressEffect(nextBtn);
        // Don't move focus for keyboard shortcuts, only for Tab navigation
        setTimeout(function() {
            nextTrackManual();
        }, 150);
    } else if (event.code === 'ArrowLeft') {
        // Previous track (available even in repeat mode for manual control)
        event.preventDefault();
        var prevBtn = document.querySelector('.control-btn:nth-child(1)');
        flashButton(prevBtn);
        pressEffect(prevBtn);
        // Don't move focus for keyboard shortcuts, only for Tab navigation
        setTimeout(function() {
            prevTrack();
        }, 150);
    }
});

/* Apply press effect (translateY) to button */
function pressEffect(btn) {
    if (btn) {
        btn.style.transform = 'translateY(2px)';
        setTimeout(function() {
            btn.style.transform = '';
        }, 150);
    }
}

/* Flash button background to indicate press (keyboard or click) */
function flashButton(element) {
    var btn;
    if (typeof element === 'string') {
        btn = document.querySelector(element);
    } else {
        btn = element;
    }
    if (btn && !btn.classList.contains('flashing')) {
        btn.classList.add('flashing');
        var originalBg = btn.style.backgroundColor;
        var originalColor = btn.style.color;
        btn.style.backgroundColor = '#00FF00';
        btn.style.color = 'black';
        setTimeout(function() {
            btn.style.backgroundColor = originalBg;
            btn.style.color = originalColor;
            btn.classList.remove('flashing');
        }, 150);
    }
}

/* Global flag to track if tab navigation is active */
var tabNavigationActive = false;

/* Add click event listeners with visual feedback for keyboard/tab navigation */
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to all buttons for flash effect
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            flashButton(btn);
            pressEffect(btn);
        });
        // Remove focus and hover states on touch devices after interaction
        btn.addEventListener('touchend', function() {
            if ('ontouchstart' in window) {
                btn.blur();
                // Force remove any lingering hover/active states
                btn.style.backgroundColor = '';
                btn.style.color = '';
                // Also reset any CSS class-based active states, but only for non-toggle buttons
                if (!btn.classList.contains('repeat-btn') && !btn.classList.contains('random-btn')) {
                    btn.classList.remove('active');
                }
            }
        });
    });

    // Add tab key detection to activate focus navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            tabNavigationActive = true;
        }
    });

    // Reset tab navigation when mouse or touch is used
    document.addEventListener('mousedown', function() {
        tabNavigationActive = false;
        // Remove all focus styles when mouse is used
        var focusableElements = document.querySelectorAll('button, a');
        focusableElements.forEach(function(elem) {
            elem.blur();
        });
    });

    // Additional touch handling for mobile devices
    document.addEventListener('touchstart', function() {
        tabNavigationActive = false;
        var focusableElements = document.querySelectorAll('button, a');
        focusableElements.forEach(function(elem) {
            elem.blur();
        });
    });

    // Handle Enter key on focused elements
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            var focusedElement = document.activeElement;
            if (focusedElement && (focusedElement.tagName === 'BUTTON' || focusedElement.tagName === 'A')) {
                event.preventDefault();
                flashButton(focusedElement);
                pressEffect(focusedElement);
                setTimeout(function() {
                    focusedElement.click();
                }, 150);
            }
        }
    });
});

/* Initialize playlist on page load */
window.onload = loadPlaylist;