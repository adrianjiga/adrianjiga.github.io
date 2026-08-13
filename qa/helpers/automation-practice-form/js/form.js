(function () {
  "use strict";

  // ── Constants ───────────────────────────────────────────────────────────────

  const COUNTRY_CITIES = {
    Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
    France: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Nice"],
    Spain: ["Madrid", "Barcelona", "Seville", "Valencia", "Bilbao"],
    Italy: ["Rome", "Milan", "Naples", "Turin", "Florence"],
    Netherlands: [
      "Amsterdam",
      "Rotterdam",
      "The Hague",
      "Utrecht",
      "Eindhoven",
    ],
  };

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ── Utilities ───────────────────────────────────────────────────────────────

  function esc(s) {
    return String(s === null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── FormState ───────────────────────────────────────────────────────────────
  // Single responsibility: owns all transient form state.

  const FormState = {
    subjects: [],
    selectedCountry: "",
    selectedCity: "",
    selectedDOB: { day: "", monthName: "", year: "" },
    uploadedFileName: "",
  };

  // ── DatePicker ──────────────────────────────────────────────────────────────
  // Single responsibility: calendar popup — year init, day grid, day selection.

  const DatePicker = {
    init() {
      this._initYears();

      document
        .getElementById("dpMonth")
        .addEventListener("change", () => this._renderDays());
      document
        .getElementById("dpYear")
        .addEventListener("change", () => this._renderDays());

      document
        .getElementById("dateOfBirthInput")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          const popup = document.getElementById("datepickerPopup");
          if (popup.style.display === "none") {
            this._renderDays();
            popup.style.display = "block";
          } else {
            popup.style.display = "none";
          }
        });

      // Stop clicks inside the popup from bubbling to the document close handler.
      document
        .getElementById("datepickerPopup")
        .addEventListener("click", (e) => e.stopPropagation());
    },

    close() {
      document.getElementById("datepickerPopup").style.display = "none";
    },

    _initYears() {
      const sel = document.getElementById("dpYear");
      const cur = new Date().getFullYear();
      for (let y = 1900; y <= cur + 20; y++) {
        const opt = document.createElement("option");
        opt.value = opt.textContent = String(y);
        if (y === cur) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      }
    },

    _renderDays() {
      const month = parseInt(document.getElementById("dpMonth").value, 10);
      const year = parseInt(document.getElementById("dpYear").value, 10);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const grid = document.getElementById("dpDaysGrid");

      while (grid.children.length > 7) {
        grid.removeChild(grid.lastChild);
      }

      const firstWeekday = new Date(year, month, 1).getDay();
      for (let b = 0; b < firstWeekday; b++) {
        grid.appendChild(document.createElement("div"));
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const padded = String(d).padStart(2, "0");
        const cell = document.createElement("div");
        cell.className = "dayCell";
        cell.textContent = d;
        cell.dataset.day = padded;
        cell.dataset.month = month;
        cell.dataset.year = year;
        cell.setAttribute("data-cy", `day${padded}`);
        cell.addEventListener("click", () => this._pickDay(cell));
        grid.appendChild(cell);
      }
    },

    _pickDay(cell) {
      const padded = cell.dataset.day;
      const month = parseInt(cell.dataset.month, 10);
      const year = cell.dataset.year;
      FormState.selectedDOB = {
        day: padded,
        monthName: MONTH_NAMES[month],
        year,
      };
      document.getElementById("dateOfBirthInput").value =
        `${padded} ${MONTH_NAMES[month]} ${year}`;
      this.close();
    },
  };

  // ── SubjectsInput ───────────────────────────────────────────────────────────
  // Single responsibility: add/remove subject chips.

  const SubjectsInput = {
    init() {
      document
        .getElementById("subjectsInput")
        .addEventListener("keydown", (e) => {
          if (e.key !== "Enter") {
            return;
          }
          e.preventDefault();
          const val = e.target.value.trim();
          if (val) {
            FormState.subjects.push(val);
            e.target.value = "";
            this._render();
          }
        });
    },

    _render() {
      const container = document.getElementById("subjectsChips");
      container.innerHTML = "";
      FormState.subjects.forEach((s, i) => {
        const chip = document.createElement("span");
        chip.className = "subjectChip";
        chip.setAttribute("data-cy", `subjectChip${i}`);
        chip.innerHTML = `${esc(s)} <span class="remove" data-cy="removeSubject${i}" data-index="${i}">&#215;</span>`;
        chip.querySelector(".remove").addEventListener("click", (ev) => {
          FormState.subjects.splice(parseInt(ev.target.dataset.index, 10), 1);
          this._render();
        });
        container.appendChild(chip);
      });
    },
  };

  // ── LocationSelector ────────────────────────────────────────────────────────
  // Single responsibility: cascading country / city dropdowns.

  const LocationSelector = {
    init() {
      document.getElementById("state").addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = document.getElementById("stateMenu");
        menu.style.display = menu.style.display === "none" ? "block" : "none";
        document.getElementById("cityMenu").style.display = "none";
      });

      document.querySelectorAll("[data-state-idx]").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          this._selectCountry(
            parseInt(el.dataset.stateIdx, 10),
            el.textContent.trim(),
          );
        });
      });

      document.getElementById("city").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!FormState.selectedCountry) {
          return;
        }
        const menu = document.getElementById("cityMenu");
        menu.style.display = menu.style.display === "none" ? "block" : "none";
        document.getElementById("stateMenu").style.display = "none";
      });
    },

    closeAll() {
      document.getElementById("stateMenu").style.display = "none";
      document.getElementById("cityMenu").style.display = "none";
    },

    _selectCountry(idx, name) {
      FormState.selectedCountry = name;
      FormState.selectedCity = "";

      const stateDisp = document.getElementById("stateDisplay");
      stateDisp.textContent = name;
      stateDisp.className = "selectValue";
      document.getElementById("stateMenu").style.display = "none";

      const cityDisp = document.getElementById("cityDisplay");
      cityDisp.textContent = "Select City";
      cityDisp.className = "selectPlaceholder";

      const cityMenu = document.getElementById("cityMenu");
      cityMenu.innerHTML = "";
      (COUNTRY_CITIES[name] || []).forEach((city) => {
        const opt = document.createElement("div");
        opt.className = "selectOption";
        // "The Hague" -> cityOptionTheHague. Cities arrive capitalised already, so the only
        // work is removing the spaces; lower-casing would flatten the camel humps.
        opt.setAttribute("data-cy", `cityOption${city.replace(/\s+/g, "")}`);
        opt.textContent = city;
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          FormState.selectedCity = city;
          cityDisp.textContent = city;
          cityDisp.className = "selectValue";
          cityMenu.style.display = "none";
        });
        cityMenu.appendChild(opt);
      });
    },
  };

  // ── Validator ───────────────────────────────────────────────────────────────
  // Single responsibility: validate required fields and apply error styling.

  const ERR_COLOR = "rgb(220, 53, 69)";

  const Validator = {
    validate() {
      let valid = true;

      ["firstName", "lastName", "userNumber"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          this._markError(el);
          valid = false;
        } else {
          this._clearError(el);
        }
      });

      const checked = document.querySelector('input[name="gender"]:checked');
      for (let i = 1; i <= 3; i++) {
        const lbl = document.querySelector(`label[for="genderRadio${i}"]`);
        if (!checked) {
          this._markError(lbl);
          valid = false;
        } else {
          this._clearError(lbl);
        }
      }

      // Validate date of birth — must be selected via the date picker
      const dobInput = document.getElementById("dateOfBirthInput");
      if (!FormState.selectedDOB.day) {
        this._markError(dobInput);
        valid = false;
      } else {
        this._clearError(dobInput);
      }

      return valid;
    },

    _markError(el) {
      el.style.borderColor = ERR_COLOR;
      el.style.borderStyle = "solid";
      el.style.borderWidth = "1px";
    },

    _clearError(el) {
      el.style.borderColor = "";
      el.style.borderStyle = "";
      el.style.borderWidth = "";
    },
  };

  // ── SuccessModal ────────────────────────────────────────────────────────────
  // Single responsibility: render and toggle the confirmation modal.

  const SuccessModal = {
    show(rows) {
      document.getElementById("resultTbody").innerHTML = rows
        .map(
          (r, i) =>
            `<tr data-cy="resultRow${i}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`,
        )
        .join("");
      document.getElementById("successModal").style.display = "flex";
    },

    close() {
      document.getElementById("successModal").style.display = "none";
    },
  };

  // ── App ─────────────────────────────────────────────────────────────────────
  // Single responsibility: bootstrap and top-level event wiring.

  const App = {
    init() {
      DatePicker.init();
      SubjectsInput.init();
      LocationSelector.init();

      document
        .getElementById("uploadPicture")
        .addEventListener("change", (e) => {
          FormState.uploadedFileName = e.target.files?.[0]?.name ?? "";
        });

      document
        .getElementById("submit")
        .addEventListener("click", () => this._submit());

      document
        .querySelector('[data-cy="closeModalBtn"]')
        .addEventListener("click", () => SuccessModal.close());

      // Global click closes all open overlays (datepicker, dropdowns).
      document.addEventListener("click", () => {
        DatePicker.close();
        LocationSelector.closeAll();
      });
    },

    _submit() {
      if (!Validator.validate()) {
        return;
      }

      const gender = document.querySelector('input[name="gender"]:checked');
      const hobbies = [];
      if (document.getElementById("hobbiesCheckbox1").checked) {
        hobbies.push("Sports");
      }
      if (document.getElementById("hobbiesCheckbox2").checked) {
        hobbies.push("Reading");
      }
      if (document.getElementById("hobbiesCheckbox3").checked) {
        hobbies.push("Music");
      }

      const fname = document.getElementById("firstName").value.trim();
      const lname = document.getElementById("lastName").value.trim();
      const dob = FormState.selectedDOB.day
        ? `${FormState.selectedDOB.day} ${FormState.selectedDOB.monthName},${FormState.selectedDOB.year}`
        : "";
      const stateCity =
        FormState.selectedCountry && FormState.selectedCity
          ? `${FormState.selectedCountry} ${FormState.selectedCity}`
          : "";

      SuccessModal.show([
        ["Student Name", [fname, lname].filter(Boolean).join(" ")],
        ["Student Email", document.getElementById("userEmail").value.trim()],
        ["Gender", gender ? gender.value : ""],
        ["Mobile", document.getElementById("userNumber").value.trim()],
        ["Date of Birth", dob],
        ["Subjects", FormState.subjects.join(", ")],
        ["Hobbies", hobbies.join(", ")],
        ["Picture", FormState.uploadedFileName],
        ["Address", document.getElementById("currentAddress").value.trim()],
        ["State and City", stateCity],
      ]);
    },
  };

  App.init();
})();
