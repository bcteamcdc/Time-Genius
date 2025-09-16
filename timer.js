        document.addEventListener('DOMContentLoaded', function () {
            const urlParams = new URLSearchParams(window.location.search);
            const timeInMinutes = parseInt(urlParams.get('time'), 10) || 0;  // Default to 0 if no time parameter is provided

            let totalSeconds = timeInMinutes * 60;
            let interval;
            let isPaused = false;

            const timerDisplay = document.getElementById('timer-display');
            const startButton = document.getElementById('start-timer');
            const pauseButton = document.getElementById('pause-timer');
            const resetButton = document.getElementById('reset-timer');

            function updateTimerDisplay() {
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }

            function startTimer() {
                if (interval) clearInterval(interval);
                isPaused = false;
                interval = setInterval(() => {
                    if (!isPaused && totalSeconds > 0) {
                        totalSeconds--;
                        updateTimerDisplay();
                    } else if (totalSeconds === 0) {
                        clearInterval(interval);
                        alert('Your Learning Time Is End');
                        playTone();
                    }
                }, 1000);
            }

            function pauseTimer() {
                isPaused = !isPaused;
                pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
            }

            function resetTimer() {
                const confirmReset = confirm('Are you sure you want to reset the timer?');
                if (confirmReset) {
                    if (interval) clearInterval(interval);
                    totalSeconds = timeInMinutes * 60;
                    updateTimerDisplay();
                    isPaused = false;
                    pauseButton.textContent = 'Pause';
                }
            }

            function playTone() {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.connect(audioContext.destination);
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                    audioContext.close();
                }, 2000);
            }

            startButton.addEventListener('click', startTimer);
            pauseButton.addEventListener('click', pauseTimer);
            resetButton.addEventListener('click', resetTimer);

            updateTimerDisplay();
        });