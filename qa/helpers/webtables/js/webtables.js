(function () {
  "use strict";

  // ── Constants ───────────────────────────────────────────────────────────────

  const STORAGE_KEY = "webtables_data";

  const DEFAULT_RECORDS = [
    {
      id: "default-1",
      firstName: "Cierra",
      lastName: "Vega",
      age: "39",
      email: "cierra@example.com",
      salary: "10000",
      department: "Insurance",
    },
    {
      id: "default-2",
      firstName: "Alden",
      lastName: "Cantrell",
      age: "45",
      email: "alden@example.com",
      salary: "12000",
      department: "Compliance",
    },
    {
      id: "default-3",
      firstName: "Kierra",
      lastName: "Gentry",
      age: "29",
      email: "kierra@example.com",
      salary: "2000",
      department: "Legal",
    },
  ];

  // ── DataStore ───────────────────────────────────────────────────────────────
  // Single responsibility: owns all record data and persistence logic.

  const DataStore = {
    records: [],

    load() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        this.records = stored
          ? JSON.parse(stored)
          : DEFAULT_RECORDS.map((r) => ({ ...r }));
      } catch {
        this.records = DEFAULT_RECORDS.map((r) => ({ ...r }));
      }
      // Migrate any records that were saved without an id
      this.records.forEach((r) => {
        if (!r.id) {
          r.id = crypto.randomUUID();
        }
      });
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
      } catch {
        /* empty */
      }
    },

    add(record) {
      this.records.push({ id: crypto.randomUUID(), ...record });
      this.save();
    },
    update(index, record) {
      this.records[index] = record;
      this.save();
    },
    remove(index) {
      this.records.splice(index, 1);
      this.save();
    },

    filter(text) {
      if (!text) {
        return this.records.slice();
      }
      const q = text.toLowerCase();
      const FIELDS = [
        "firstName",
        "lastName",
        "age",
        "email",
        "salary",
        "department",
      ];
      return this.records.filter((r) =>
        FIELDS.some((k) => String(r[k]).toLowerCase().includes(q)),
      );
    },
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  // Single responsibility: page state and slice calculations.
  //
  // getPageSize() reads the select value from the DOM on every call.
  // This means render() always uses the value currently visible in the UI,
  // regardless of whether a change event fired correctly — fixing the
  // rows-per-page bug where stale module-level state caused wrong slice sizes.

  const Pagination = {
    currentPage: 1,

    getPageSize() {
      const el = document.getElementById("rows-per-page-sel");
      return el ? parseInt(el.value, 10) : 10;
    },

    getTotalPages(count) {
      return Math.max(1, Math.ceil(count / this.getPageSize()));
    },

    clampToTotal(totalPages) {
      this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    },

    slice(items) {
      const size = this.getPageSize();
      const start = (this.currentPage - 1) * size;
      return items.slice(start, start + size);
    },
  };

  // ── Renderer ────────────────────────────────────────────────────────────────
  // Single responsibility: builds HTML strings and writes to the DOM.

  const Renderer = {
    esc(s) {
      return String(s === null ? "" : s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    rowHtml(row, pos) {
      const e = (v) => this.esc(v);
      return `
        <tr data-cy="tableRow${pos}">
          <td data-cy="cellFirstName${pos}">${e(row.firstName)}</td>
          <td data-cy="cellLastName${pos}">${e(row.lastName)}</td>
          <td data-cy="cellAge${pos}">${e(row.age)}</td>
          <td data-cy="cellEmail${pos}">${e(row.email)}</td>
          <td data-cy="cellSalary${pos}">${e(row.salary)}</td>
          <td data-cy="cellDepartment${pos}">${e(row.department)}</td>
          <td data-cy="cellActions${pos}">
            <span id="edit-record-${pos}"   title="Edit"   class="action-icon" data-cy="editBtn${pos}"   data-id="${e(row.id)}">&#9998;</span>
            <span id="delete-record-${pos}" title="Delete" class="action-icon" data-cy="deleteBtn${pos}" data-id="${e(row.id)}">&#10005;</span>
          </td>
        </tr>`;
    },

    modalHtml(title, record) {
      const e = (v) => this.esc(v);
      return `
        <div data-cy="registrationModal">
          <div class="modal-header">
            <h5 id="registration-form-modal" data-cy="modalTitle">${e(title)}</h5>
          </div>
          <div class="modal-body">
            <div class="field-group"><label>First Name</label> <input id="firstName"  data-cy="modalFirstName"  type="text" value="${e(record.firstName || "")}" /></div>
            <div class="field-group"><label>Last Name</label>  <input id="lastName"   data-cy="modalLastName"   type="text" value="${e(record.lastName || "")}" /></div>
            <div class="field-group"><label>Email</label>      <input id="userEmail"  data-cy="modalEmail"       type="text" value="${e(record.email || "")}" /></div>
            <div class="field-group"><label>Age</label>        <input id="age"        data-cy="modalAge"         type="text" value="${e(record.age || "")}" /></div>
            <div class="field-group"><label>Salary</label>     <input id="salary"     data-cy="modalSalary"      type="text" value="${e(record.salary || "")}" /></div>
            <div class="field-group"><label>Department</label> <input id="department" data-cy="modalDepartment"  type="text" value="${e(record.department || "")}" /></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" data-cy="modalCancelBtn">Close</button>
            <button id="submit"        data-cy="modalSubmitBtn">Submit</button>
          </div>
        </div>`;
    },

    renderTable(filtered) {
      // All user data is escaped via esc() in rowHtml before assignment
      document.getElementById("table-body").innerHTML = Pagination.slice(
        // safe: all values run through esc()
        filtered,
      )
        .map((row, i) => this.rowHtml(row, i + 1))
        .join("");
    },

    renderPagination(totalPages) {
      document.getElementById("current-page-num").textContent =
        Pagination.currentPage;
      document.getElementById("total-pages-display").textContent = totalPages;
      document.querySelector("[data-cy='prevPageBtn']").disabled =
        Pagination.currentPage <= 1;
      document.querySelector("[data-cy='nextPageBtn']").disabled =
        Pagination.currentPage >= totalPages;
    },
  };

  // ── Modal ───────────────────────────────────────────────────────────────────
  // Single responsibility: registration form modal lifecycle.

  const Modal = {
    editingIndex: -1,

    open(dataIdx) {
      this.editingIndex = dataIdx;
      const record = dataIdx >= 0 ? DataStore.records[dataIdx] : {};
      this._show("Registration Form", record);
    },

    _show(title, record) {
      document.getElementById("wt-modal-overlay")?.remove();

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.id = "wt-modal-overlay";
      overlay.setAttribute("data-cy", "modalOverlay");
      overlay.innerHTML = Renderer.modalHtml(title, record);

      overlay
        .querySelector("[data-cy='modalSubmitBtn']")
        .addEventListener("click", () => this._submit());
      overlay
        .querySelector("[data-cy='modalCancelBtn']")
        .addEventListener("click", () => this.close());

      document.body.appendChild(overlay);
    },

    close() {
      document.getElementById("wt-modal-overlay")?.remove();
    },

    _submit() {
      const record = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("userEmail").value,
        age: document.getElementById("age").value,
        salary: document.getElementById("salary").value,
        department: document.getElementById("department").value,
      };
      if (this.editingIndex >= 0) {
        DataStore.update(this.editingIndex, record);
      } else {
        DataStore.add(record);
      }
      this.close();
      App.render();
    },
  };

  // ── App ─────────────────────────────────────────────────────────────────────
  // Single responsibility: bootstrap, event wiring, and top-level render cycle.

  const App = {
    searchText: "",

    init() {
      DataStore.load();
      this._bindEvents();
      this.render();
    },

    render() {
      const filtered = DataStore.filter(this.searchText);
      const totalPages = Pagination.getTotalPages(filtered.length);
      Pagination.clampToTotal(totalPages);
      Renderer.renderTable(filtered);
      Renderer.renderPagination(totalPages);
    },

    _bindEvents() {
      // Event delegation for table actions — one listener instead of N listeners re-bound on every render
      document.getElementById("table-body").addEventListener("click", (e) => {
        const icon = e.target.closest(".action-icon[data-id]");
        if (!icon) {
          return;
        }
        const id = icon.dataset.id;
        const idx = DataStore.records.findIndex((r) => r.id === id);
        if (idx === -1) {
          return;
        }
        if (icon.title === "Edit") {
          Modal.open(idx);
        }
        if (icon.title === "Delete") {
          DataStore.remove(idx);
          this.render();
        }
      });

      document.getElementById("searchBox").addEventListener("input", (e) => {
        this.searchText = e.target.value;
        Pagination.currentPage = 1;
        this.render();
      });

      // The change event resets the page and re-renders.
      // render() calls Pagination.getPageSize() which reads the select value
      // directly from the DOM, so the correct page size is always used.
      document
        .getElementById("rows-per-page-sel")
        .addEventListener("change", () => {
          Pagination.currentPage = 1;
          this.render();
        });

      document
        .getElementById("addNewRecordButton")
        .addEventListener("click", () => Modal.open(-1));

      document
        .querySelector("[data-cy='prevPageBtn']")
        .addEventListener("click", () => {
          if (Pagination.currentPage > 1) {
            Pagination.currentPage--;
            this.render();
          }
        });

      document
        .querySelector("[data-cy='nextPageBtn']")
        .addEventListener("click", () => {
          const total = Pagination.getTotalPages(
            DataStore.filter(this.searchText).length,
          );
          if (Pagination.currentPage < total) {
            Pagination.currentPage++;
            this.render();
          }
        });
    },
  };

  App.init();
})();
