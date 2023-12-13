// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyBhDyy-uWtvbZSnQrCFFubX02CwznIPYp8",
    authDomain: "bac-2012.firebaseapp.com",
    projectId: "bac-2012",
    storageBucket: "bac-2012.appspot.com",
    messagingSenderId: "1080877923320",
    appId: "1:1080877923320:web:41d0cfb6b3cb7da530740d",
    measurementId: "G-75BX9SCCLV"
};
firebase.initializeApp(firebaseConfig);

// Firestore reference
var db = firebase.firestore();

// Specify the user ID
var userId = "1001";

// Initialize currentYear and currentMonth
var currentYear = new Date().getFullYear();
var currentMonth = new Date().getMonth();

// Fetch absence and presence dates from Firestore for the entire year
var absenceDates = [];
var presenceDates = [];

db.collection("users").doc(userId).collection("absences").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let dateParts = doc.id.split("-");
        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]) - 1;
        let day = parseInt(dateParts[2]);
        absenceDates.push(new Date(year, month, day));
    });

    return db.collection("users").doc(userId).collection("presences").get();
}).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        let dateParts = doc.id.split("-");
        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]) - 1;
        let day = parseInt(dateParts[2]);
        presenceDates.push(new Date(year, month, day));
    });

    class Calendar {
        constructor(year, month) {
            this.year = year;
            this.month = month;
            this.daysInMonth = new Date(year, month + 1, 0).getDate();
            this.firstDay = new Date(year, month, 1).getDay();
        }

        generateCalendarBody() {
            document.getElementById("calendarBody").innerHTML = "";

            for (let i = 0; i < 6; i++) {
                const row = document.createElement("tr");

                for (let j = 0; j < 7; j++) {
                    const date = i * 7 + j + 1 - this.firstDay;

                    if (date < 1 || date > this.daysInMonth) {
                        // Empty cell
                        const cell = document.createElement("td");
                        cell.classList.add("neutral");
                        row.appendChild(cell);
                        continue;
                    }

                    const cell = document.createElement("td");
                    cell.textContent = date;

                    const currentDate = new Date(this.year, this.month, date);

                    if (isAbsent(currentDate)) {
                        cell.classList.add("absent");
                    } else if (isPresent(currentDate)) {
                        cell.classList.add("present");
                    }

                    row.appendChild(cell);
                }

                document.getElementById("calendarBody").appendChild(row);
            }
        }
    }

    function isAbsent(date) {
        return absenceDates.some(absenceDate => 
            absenceDate.getUTCFullYear() === date.getUTCFullYear() &&
            absenceDate.getUTCMonth() === date.getUTCMonth() &&
            absenceDate.getUTCDate() === date.getUTCDate()
        );
    }

    function isPresent(date) {
        return presenceDates.some(presenceDate => 
            presenceDate.getUTCFullYear() === date.getUTCFullYear() &&
            presenceDate.getUTCMonth() === date.getUTCMonth() &&
            presenceDate.getUTCDate() === date.getUTCDate()
        );
    }

    function generateCalendar(year, month) {
        const calendar = new Calendar(year, month);

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthYearString = `${monthNames[calendar.month]} ${calendar.year}`;
        
        document.getElementById('month').textContent = monthYearString;

        calendar.generateCalendarBody();
    }

    generateCalendar(currentYear, currentMonth);

    // Event listeners for previous and next buttons
    document.getElementById("prevBtn").addEventListener("click", () => {
        currentMonth = (currentMonth - 1 + 12) % 12;
        currentYear -= currentMonth === 11 ? 1 : 0;
        generateCalendar(currentYear, currentMonth);
    });

    document.getElementById("nextBtn").addEventListener("click", () => {
        currentMonth = (currentMonth + 1) % 12;
        currentYear += currentMonth === 0 ? 1 : 0;
        generateCalendar(currentYear, currentMonth);
    });
});
