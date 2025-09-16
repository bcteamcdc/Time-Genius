document.addEventListener("DOMContentLoaded", () => {
    const freeDaysContainer = document.getElementById("free-days-container");
    const subjectsContainer = document.getElementById("subjects-container");
    const addSubjectButton = document.getElementById("add-subject");
    const fillRandomButton = document.getElementById("fill-random");
    const resetFormButton = document.getElementById("reset-form");
    const scheduleForm = document.getElementById("schedule-form");
    const scheduleTable = document.getElementById("schedule-table").getElementsByTagName("tbody")[0];
    const downloadScheduleButton = document.getElementById("download-schedule");
    const errorMessage = document.getElementById("error-message");
    let subjectCounter = 1;

    addSubjectButton.addEventListener("click", () => {
        const newSubjectEntry = document.createElement("div");
        newSubjectEntry.classList.add("subject-entry");
        newSubjectEntry.innerHTML = `
            <label for="subject-${subjectCounter}">Subject:</label>
            <input class="input" placeholder="Type Subject here...." type="text" id="subject-${subjectCounter}" name="subject" required>
            <label for="priority-${subjectCounter}">Priority (1-10):</label>
            <input class="input" placeholder="Type Priority(1-10) here...." type="number" id="priority-${subjectCounter}" name="priority" min="1" max="10" required>
            <button type="button" class="remove-subject">Remove</button>
        `;
        subjectsContainer.appendChild(newSubjectEntry);
        subjectCounter++;
    });

    subjectsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-subject")) {
            event.target.parentNode.remove();
        }
    });

    fillRandomButton.addEventListener("click", () => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const subjects = ["Math", "Science", "English", "History", "Geography", "Art", "Music"];
        const randomFreeDay = () => days[Math.floor(Math.random() * days.length)];
        const randomFreeHours = () => Math.floor(Math.random() * 6) + 1;
        const randomSubject = () => subjects[Math.floor(Math.random() * subjects.length)];
        const randomPriority = () => Math.floor(Math.random() * 10) + 1;

        const freeDaysEntries = freeDaysContainer.getElementsByClassName("free-day-entry");
        for (let i = 0; i < freeDaysEntries.length; i++) {
            freeDaysEntries[i].querySelector("[name='day']").value = randomFreeDay();
            freeDaysEntries[i].querySelector("[name='hours']").value = randomFreeHours();
        }

        const subjectEntries = subjectsContainer.getElementsByClassName("subject-entry");
        for (let i = 0; i < subjectEntries.length; i++) {
            subjectEntries[i].querySelector("[name='subject']").value = randomSubject();
            subjectEntries[i].querySelector("[name='priority']").value = randomPriority();
        }
    });

    resetFormButton.addEventListener("click", () => {
        scheduleForm.reset();
        scheduleTable.innerHTML = "";
        errorMessage.style.display = "none";
        downloadScheduleButton.style.display = "none";
    });

    scheduleForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const freeDays = [];
        const subjects = [];
        let totalFreeHours = 0;
        let totalPriority = 0;

        freeDaysContainer.querySelectorAll(".free-day-entry").forEach(entry => {
            const day = entry.querySelector("[name='day']").value;
            const hours = parseInt(entry.querySelector("[name='hours']").value, 10);
            freeDays.push({ day, hours });
            totalFreeHours += hours;
        });

        subjectsContainer.querySelectorAll(".subject-entry").forEach(entry => {
            const subject = entry.querySelector("[name='subject']").value;
            const priority = parseInt(entry.querySelector("[name='priority']").value, 10);
            subjects.push({ subject, priority });
            totalPriority += priority;
        });

        if (totalPriority === 0 || totalFreeHours === 0) {
            showError("Please enter both free hours and subjects with priorities.");
            return;
        } else if (subjects.length * 0.5 > totalFreeHours) {
            showError("Too many subjects for the available free time. Please increase your free time or reduce the number of subjects.");
            return;
        } else {
            errorMessage.style.display = "none";
        }

        scheduleTable.innerHTML = "";

        // Calculate initial whole hours allocation with a minimum of 30 minutes (0.5 hours)
        let allocatedHours = subjects.map(sub => ({
            subject: sub.subject,
            priority: sub.priority,
            hours: Math.max(0.5, Math.floor((sub.priority / totalPriority) * totalFreeHours * 2) / 2)  // Rounds to nearest 0.5
        }));

        // Calculate the remaining hours to be distributed
        let allocatedTotalHours = allocatedHours.reduce((acc, sub) => acc + sub.hours, 0);
        let remainingHours = totalFreeHours - allocatedTotalHours;

        // Distribute remaining hours based on priority
        allocatedHours.sort((a, b) => b.priority - a.priority);
        for (let i = 0; remainingHours > 0 && i < allocatedHours.length; i++) {
            allocatedHours[i].hours += 0.5;
            remainingHours -= 0.5;
        }

        freeDays.forEach(day => {
            let remainingDayHours = day.hours;
            let subIndex = 0;
            while (remainingDayHours > 0 && subIndex < allocatedHours.length) {
                if (allocatedHours[subIndex].hours > 0) {
                    const hoursToAllocate = Math.min(remainingDayHours, allocatedHours[subIndex].hours);
                    const row = document.createElement("tr");
                    const hours = Math.floor(hoursToAllocate);
                    const minutes = (hoursToAllocate - hours) * 60;
                    row.innerHTML = `
                        <td>${day.day}</td>
                        <td>${allocatedHours[subIndex].subject}</td>
                        <td>${hours} hours ${minutes} minutes</td>
                    `;
                    scheduleTable.appendChild(row);
                    allocatedHours[subIndex].hours -= hoursToAllocate;
                    remainingDayHours -= hoursToAllocate;
                }
                subIndex++;
            }
        });

        downloadScheduleButton.style.display = "block";
    });

    downloadScheduleButton.addEventListener("click", () => {
        html2canvas(scheduleTable).then(canvas => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = "schedule.png";
            link.click();
        });
    });

    function showError(message) {
        errorMessage.innerText = message;
        errorMessage.style.display = "block";
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 3000);
    }
});
