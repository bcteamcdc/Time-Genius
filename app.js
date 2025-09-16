document.addEventListener('DOMContentLoaded', function () {
    const addSubjectButton = document.getElementById('add-subject');
    const addFreeDayButton = document.getElementById('add-free-day');
    const fillRandomButton = document.getElementById('fill-random');
    const resetFormButton = document.getElementById('reset-form');
    const scheduleForm = document.getElementById('schedule-form');
    const scheduleTable = document.getElementById('schedule-table');
    const downloadButton = document.getElementById('download-schedule');
    const errorMessage = document.getElementById('error-message');

    addSubjectButton.addEventListener('click', addSubject);
    addFreeDayButton.addEventListener('click', addFreeDay);
    fillRandomButton.addEventListener('click', fillRandom);
    resetFormButton.addEventListener('click', resetForm);
    scheduleForm.addEventListener('submit', generateSchedule);
    downloadButton.addEventListener('click', downloadSchedule);

    function addSubject() {
        const subjectsContainer = document.getElementById('subjects-container');
        const index = subjectsContainer.children.length;
        const subjectEntry = document.createElement('div');
        subjectEntry.classList.add('subject-entry');
        subjectEntry.innerHTML = `
            <label for="subject-${index}">Subject:</label>
            <input class="input" placeholder="Type Subject here...." type="text" id="subject-${index}" name="subject" required>
            <label for="priority-${index}">Priority (1-10):</label>
            <input class="input" placeholder="Type Priority(1-10) here...." type="number" id="priority-${index}" name="priority" min="1" max="10" required>
            <button type="button" class="remove-subject">Remove</button>
        `;
        subjectsContainer.appendChild(subjectEntry);

        subjectEntry.querySelector('.remove-subject').addEventListener('click', () => {
            subjectsContainer.removeChild(subjectEntry);
        });
    }

    function addFreeDay() {
        const freeDaysContainer = document.getElementById('free-days-container');
        const index = freeDaysContainer.children.length;

        if (index >= 7) {
            addFreeDayButton.style.display = 'none';
            return;
        }

        const freeDayEntry = document.createElement('div');
        freeDayEntry.classList.add('free-day-entry');
        freeDayEntry.innerHTML = `
            <label for="day-${index}">Day:</label>
            <select id="day-${index}" name="day">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            <label for="hours-${index}">Free Hours:</label>
            <input class="input" placeholder="Type Free Hours here...." type="number" id="hours-${index}" name="hours" min="0" max="24" required>
            <button type="button" class="remove-free-day">Remove</button>
        `;
        freeDaysContainer.appendChild(freeDayEntry);

        freeDayEntry.querySelector('.remove-free-day').addEventListener('click', () => {
            freeDaysContainer.removeChild(freeDayEntry);
            if (freeDaysContainer.children.length < 7) {
                addFreeDayButton.style.display = 'block';
            }
        });
    }

    function fillRandom() {
        const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
        const priorities = Array.from({ length: subjects.length }, () => Math.floor(Math.random() * 10) + 1);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const freeHours = Array.from({ length: days.length }, () => Math.floor(Math.random() * 5) + 1);

        resetForm();

        subjects.forEach((subject, index) => {
            if (index > 0) addSubject();
            document.getElementById(`subject-${index}`).value = subject;
            document.getElementById(`priority-${index}`).value = priorities[index];
        });

        days.forEach((day, index) => {
            if (index > 0) addFreeDay();
            document.getElementById(`day-${index}`).value = day;
            document.getElementById(`hours-${index}`).value = freeHours[index];
        });
    }

    function resetForm() {
        document.getElementById('subjects-container').innerHTML = `
            <div class="subject-entry">
                <label for="subject-0">Subject:</label>
                <input class="input" placeholder="Type Subject here...." type="text" id="subject-0" name="subject" required>
                <label for="priority-0">Priority (1-10):</label>
                <input class="input" placeholder="Type Priority(1-10) here...." type="number" id="priority-0" name="priority" min="1" max="10" required>
                <button type="button" class="remove-subject">Remove</button>
            </div>
        `;

        document.getElementById('free-days-container').innerHTML = `
            <div class="free-day-entry">
                <label for="day-0">Day:</label>
                <select id="day-0" name="day">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <label for="hours-0">Free Hours:</label>
                <input class="input" placeholder="Type Free Hours here...." type="number" id="hours-0" name="hours" min="0" max="24" required>
                <button type="button" class="remove-free-day">Remove</button>
            </div>
        `;
        addFreeDayButton.style.display = 'block';
        errorMessage.style.display = 'none'; // Hide error message on reset
    }

    function generateSchedule(event) {
        event.preventDefault();

        const subjects = Array.from(document.querySelectorAll('input[name="subject"]')).map(input => input.value);
        const priorities = Array.from(document.querySelectorAll('input[name="priority"]')).map(input => parseInt(input.value));
        const days = Array.from(document.querySelectorAll('select[name="day"]')).map(select => select.value);
        const hours = Array.from(document.querySelectorAll('input[name="hours"]')).map(input => parseInt(input.value));

        const schedule = [];
        const MIN_TIME = 30; // minimum time in minutes for each subject

        errorMessage.style.display = 'none'; // Hide error message before generating schedule

        let hasError = false;

        days.forEach((day, index) => {
            const totalFreeMinutes = hours[index] * 60;
            const totalPriority = priorities.reduce((sum, priority) => sum + priority, 0);
            const minRequiredMinutes = subjects.length * MIN_TIME;

            if (totalFreeMinutes < minRequiredMinutes) {
                errorMessage.textContent = `Insufficient free time on ${day}. Please reduce the number of subjects or increase the free hours.`;
                errorMessage.style.display = 'block';
                hasError = true;
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000); // Hide error message after 3 seconds
                return;
            }

            subjects.forEach((subject, subjectIndex) => {
                const time = (priorities[subjectIndex] / totalPriority) * totalFreeMinutes;
                const allocatedTime = Math.max(time, MIN_TIME);
                schedule.push({ day, subject, time: allocatedTime });
            });
        });

        if (hasError) return;

        const tbody = scheduleTable.querySelector('tbody');
        tbody.innerHTML = '';

        schedule.forEach(entry => {
            const row = tbody.insertRow();
            row.insertCell().textContent = entry.day;
            row.insertCell().textContent = entry.subject;
            const hours = Math.floor(entry.time / 60);
            const minutes = Math.round(entry.time % 60);
            const timeText = `${hours} hours ${minutes} minutes`;
            row.insertCell().textContent = timeText;

            // Add Start Now button
            const startNowButton = document.createElement('button');
            startNowButton.textContent = 'Start Now';
            startNowButton.addEventListener('click', () => startTimer(timeText));
            const buttonCell = row.insertCell();
            buttonCell.appendChild(startNowButton);
        });

        downloadButton.style.display = 'block';
    }

    function startTimer(timeText) {
        const [hours, minutes] = timeText.split(' hours ').map(part => parseInt(part));
        const totalMinutes = hours * 60 + minutes;
        window.location.href = `timer.html?time=${totalMinutes}`;
    }

    function downloadSchedule() {
        html2canvas(scheduleTable).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'schedule.png';
            link.click();
        });
    }
});
