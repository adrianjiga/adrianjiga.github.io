(function () {
  'use strict';

  // ── Constants ───────────────────────────────────────────────────────────────

  const STORAGE_KEY = 'webtables_data';

  const DEFAULT_RECORDS = [
    { firstName: 'Cierra', lastName: 'Vega',    age: '39', email: 'cierra@example.com', salary: '10000', department: 'Insurance'  },
    { firstName: 'Alden',  lastName: 'Cantrell', age: '45', email: 'alden@example.com',  salary: '12000', department: 'Compliance' },
    { firstName: 'Kierra', lastName: 'Gentry',  age: '29', email: 'kierra@example.com', salary: '2000',  department: 'Legal'      },
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
          : DEFAULT_RECORDS.map(r => ({ ...r }));
      } catch {
        this.records = DEFAULT_RECORDS.map(r => ({ ...r }));
      }
    },

    save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records)); } catch {}
    },

    add(record)           { this.records.push(record);        this.save(); },
    update(index, record) { this.records[index] = record;     this.save(); },
    remove(index)         { this.records.splice(index, 1);    this.save(); },

    filter(text) {
      if (!text) return this.records.slice();
      const q      = text.toLowerCase();
      const FIELDS = ['firstName', 'lastName', 'age', 'email', 'salary', 'department'];
      return this.records.filter(r =>
        FIELDS.some(k => String(r[k]).toLowerCase().includes(q))
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
      const el = document.getElementById('rows-per-page-sel');
      return el ? parseInt(el.value, 10) : 10;
    },

    getTotalPages(count) {
      return Math.max(1, Math.ceil(count / this.getPageSize()));
    },

    clampToTotal(totalPages) {
      this.currentPage = Math.min(Math.max(1, this.currentPage), totalPages);
    },

    slice(items) {
      const size  = this.getPageSize();
      const start = (this.currentPage - 1) * size;
      return items.slice(start, start + size);
    },
  };

  // ── Renderer ────────────────────────────────────────────────────────────────
  // Single responsibility: builds HTML strings and writes to the DOM.

  const Renderer = {
    esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    rowHtml(row, pos, dataIdx) {
      const e = v => this.esc(v);
      return `
        <tr data-cy="table-row-${pos}">
          <td data-cy="cell-first-name-${pos}">${e(row.firstName)}</td>
          <td data-cy="cell-last-name-${pos}">${e(row.lastName)}</td>
          <td data-cy="cell-age-${pos}">${e(row.age)}</td>
          <td data-cy="cell-email-${pos}">${e(row.email)}</td>
          <td data-cy="cell-salary-${pos}">${e(row.salary)}</td>
          <td data-cy="cell-department-${pos}">${e(row.department)}</td>
          <td data-cy="cell-actions-${pos}">
            <span id="edit-record-${pos}"   title="Edit"   class="action-icon" data-cy="edit-btn-${pos}"   data-idx="${dataIdx}">&#9998;</span>
            <span id="delete-record-${pos}" title="Delete" class="action-icon" data-cy="delete-btn-${pos}" data-idx="${dataIdx}">&#10005;</span>
          </td>
        </tr>`;
    },

    modalHtml(title, record) {
      const e = v => this.esc(v);
      return `
        <div data-cy="registration-modal">
          <div class="modal-header">
            <h5 id="registration-form-modal" data-cy="modal-title">${e(title)}</h5>
          </div>
          <div class="modal-body">
            <div class="field-group"><label>First Name</label> <input id="firstName"  data-cy="modal-first-name"  type="text" value="${e(record.firstName  || '')}" /></div>
            <div class="field-group"><label>Last Name</label>  <input id="lastName"   data-cy="modal-last-name"   type="text" value="${e(record.lastName   || '')}" /></div>
            <div class="field-group"><label>Email</label>      <input id="userEmail"  data-cy="modal-email"       type="text" value="${e(record.email      || '')}" /></div>
            <div class="field-group"><label>Age</label>        <input id="age"        data-cy="modal-age"         type="text" value="${e(record.age        || '')}" /></div>
            <div class="field-group"><label>Salary</label>     <input id="salary"     data-cy="modal-salary"      type="text" value="${e(record.salary     || '')}" /></div>
            <div class="field-group"><label>Department</label> <input id="department" data-cy="modal-department"  type="text" value="${e(record.department || '')}" /></div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" data-cy="modal-cancel-btn">Close</button>
            <button id="submit"        data-cy="modal-submit-btn">Submit</button>
          </div>
        </div>`;
    },

    renderTable(filtered) {
      document.getElementById('table-body').innerHTML = Pagination
        .slice(filtered)
        .map((row, i) => this.rowHtml(row, i + 1, DataStore.records.indexOf(row)))
        .join('');

      // Re-bind action icons after every innerHTML replacement
      document.querySelectorAll('.action-icon[data-idx]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.dataset.idx, 10);
          if (el.title === 'Edit')   Modal.open(idx);
          if (el.title === 'Delete') { DataStore.remove(idx); App.render(); }
        });
      });
    },

    renderPagination(totalPages) {
      document.getElementById('current-page-num').textContent    = Pagination.currentPage;
      document.getElementById('total-pages-display').textContent = totalPages;
      document.querySelector("[data-cy='prev-page-btn']").disabled = Pagination.currentPage <= 1;
      document.querySelector("[data-cy='next-page-btn']").disabled = Pagination.currentPage >= totalPages;
    },
  };

  // ── Modal ───────────────────────────────────────────────────────────────────
  // Single responsibility: registration form modal lifecycle.

  const Modal = {
    editingIndex: -1,

    open(dataIdx) {
      this.editingIndex = dataIdx;
      const record = dataIdx >= 0 ? DataStore.records[dataIdx] : {};
      this._show('Registration Form', record);
    },

    _show(title, record) {
      document.getElementById('wt-modal-overlay')?.remove();

      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id        = 'wt-modal-overlay';
      overlay.setAttribute('data-cy', 'modal-overlay');
      overlay.innerHTML = Renderer.modalHtml(title, record);

      overlay.querySelector("[data-cy='modal-submit-btn']").addEventListener('click', () => this._submit());
      overlay.querySelector("[data-cy='modal-cancel-btn']").addEventListener('click', () => this.close());

      document.body.appendChild(overlay);
    },

    close() {
      document.getElementById('wt-modal-overlay')?.remove();
    },

    _submit() {
      const record = {
        firstName:  document.getElementById('firstName').value,
        lastName:   document.getElementById('lastName').value,
        email:      document.getElementById('userEmail').value,
        age:        document.getElementById('age').value,
        salary:     document.getElementById('salary').value,
        department: document.getElementById('department').value,
      };
      if (this.editingIndex >= 0) DataStore.update(this.editingIndex, record);
      else                        DataStore.add(record);
      this.close();
      App.render();
    },
  };

  // ── App ─────────────────────────────────────────────────────────────────────
  // Single responsibility: bootstrap, event wiring, and top-level render cycle.

  const App = {
    searchText: '',

    init() {
      DataStore.load();
      this._bindEvents();
      this.render();
    },

    render() {
      const filtered   = DataStore.filter(this.searchText);
      const totalPages = Pagination.getTotalPages(filtered.length);
      Pagination.clampToTotal(totalPages);
      Renderer.renderTable(filtered);
      Renderer.renderPagination(totalPages);
    },

    _bindEvents() {
      document.getElementById('searchBox').addEventListener('input', e => {
        this.searchText    = e.target.value;
        Pagination.currentPage = 1;
        this.render();
      });

      // The change event resets the page and re-renders.
      // render() calls Pagination.getPageSize() which reads the select value
      // directly from the DOM, so the correct page size is always used.
      document.getElementById('rows-per-page-sel').addEventListener('change', () => {
        Pagination.currentPage = 1;
        this.render();
      });

      document.getElementById('addNewRecordButton').addEventListener('click', () => Modal.open(-1));

      document.querySelector("[data-cy='prev-page-btn']").addEventListener('click', () => {
        if (Pagination.currentPage > 1) { Pagination.currentPage--; this.render(); }
      });

      document.querySelector("[data-cy='next-page-btn']").addEventListener('click', () => {
        const total = Pagination.getTotalPages(DataStore.filter(this.searchText).length);
        if (Pagination.currentPage < total) { Pagination.currentPage++; this.render(); }
      });
    },
  };

  App.init();
})();
