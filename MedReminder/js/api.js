const API_patients_URL =
    "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/patients";

const API_medications_URL =
    "https://69f9a6bcc509a40d3aa2ef52.mockapi.io/api/v1/medications";

const API_schedules_URL =
    "https://6a14718d6c7db8aac05489f6.mockapi.io/api/v1/schedules";

// LOAD DATA

async function loadData() {

    try {

        const [patients, meds, schedules]
            = await Promise.all([

                fetch(API_patients_URL)
                    .then(res => res.json()),

                fetch(API_medications_URL)
                    .then(res => res.json()),

                fetch(API_schedules_URL)
                    .then(res => res.json())

            ]);

        // NẾU CÓ SELECT THÌ RENDER

        if (
            document.getElementById("patientSelect")
        ) {

            renderSelect(
                "patientSelect",
                patients
            );
        }

        if (
            document.getElementById("medSelect")
        ) {

            renderSelect(
                "medSelect",
                meds
            );
        }

        // RENDER LỊCH

        renderSchedules(
            schedules,
            patients,
            meds
        );

    } catch (error) {

        console.log(error);

        alert("Không thể tải dữ liệu!");
    }
}

// RENDER SELECT

function renderSelect(id, data) {

    const select =
        document.getElementById(id);

    if (!select) return;

    select.innerHTML = data.map(item => `

        <option value="${item.id}">
            ${item.name}
        </option>

    `).join("");
}

// XÓA LỊCH

async function deleteSchedule(id) {

    try {

        await fetch(

            `${API_schedules_URL}/${id}`,

            {
                method: "DELETE"
            }

        );

        await loadData();

    } catch (error) {

        console.log(error);

        alert("Xóa thất bại!");
    }
}

// EXPORT GLOBAL

window.loadData = loadData;

window.renderSelect = renderSelect;

window.deleteSchedule = deleteSchedule;