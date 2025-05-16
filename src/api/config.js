const BASE_URL = "http://172.174.98.154:5000/api";

const API = {
  // 🔐 Auth
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  GET_USER_PROFILE: `${BASE_URL}/user/me`,

  // 👤 Employee APIs
  FETCH_ALL_EMPLOYEES: `${BASE_URL}/employees`,
  FETCH_ALL_EMPLOYEES1: `${BASE_URL}/employees/employees`, // consider renaming for clarity
  GET_EMPLOYEE_BY_ID: (empId) => `${BASE_URL}/employees/${empId}`,

  // 🕒 Timesheet APIs
  TIMESHEET_REPORT: `${BASE_URL}/timesheet/report`,
  TIMESHEET_ADD_BATCH: `${BASE_URL}/timesheet/add-batch`,
  UPDATE_TIMESHEET_BATCH: `${BASE_URL}/timesheet/update-entry`,
  DELETE_TIMESHEET_ENTRY: (id) => `${BASE_URL}/timesheet/delete-entry/${id}`,
  DELETE_TIMESHEET_ENTRY_BY_ID: (id) => `${BASE_URL}/timesheet/delete-entry-by-id/${id}`,
  GET_TIMESHEET_BY_WEEK: (empId, weekStartDate) =>
    `${BASE_URL}/timesheet/week/${empId}/${weekStartDate}`,
  GET_CLIENTS_BY_BILLABLE: (billable) => `${BASE_URL}/timesheet/companies?billable=${billable}`,
  GET_PROJECTS_BY_COMPANY: (companyId) => `${BASE_URL}/timesheet/projects/${companyId}`,

  // 🏢 Company & Project Management
  FETCH_MANAGE_CLIENTS: `${BASE_URL}/manageclients`,
  GET_CLIENT_BY_ID: (company_id) => `${BASE_URL}/manageclients/${company_id}`,

  GET_COMPANIES_BY_BILLABLE: (isBillable) =>
    `${BASE_URL}/timesheet/companies?billable=${isBillable}`,
  GET_PROJECTS_BY_COMPANY: (companyId) =>
    `${BASE_URL}/timesheet/projects/${companyId}`, // for timesheet only
  CLIENT_PROJECTS: `${BASE_URL}/dashboard/client-projects`,

  // 🛠️ Full Project Management APIs (for ManageProjects.jsx)
  PROJECTS_BY_COMPANY: (companyId) => `${BASE_URL}/projects/company/${companyId}`, // ✅ get projects by company
  GET_ALL_PROJECTS: `${BASE_URL}/projects`, // ✅ create project (POST)
  GET_PROJECT_BY_SOW_ID: (sowId) => `${BASE_URL}/projects/${sowId}`, // ✅ update (PUT) and delete (DELETE)
  FETCH_PROJECT_DETAILS: (sowId) => `${BASE_URL}/projects/${sowId}`,
  FETCH_TASKS_BY_PROJECT: (sowId) => `${BASE_URL}/projects/${sowId}/tasks`,
  FETCH_EMPLOYEES_BY_PROJECT: (sowId) => `${BASE_URL}/projects/${sowId}/employees`,

  // 🔄 Project Subcategories & Tasks
  GET_AREAS_BY_PROJECT: (projectId) => `${BASE_URL}/timesheet/areas/${projectId}`,
  GET_TASK_AREAS_BY_PROJECT_AND_WORKAREA: (sowId, workArea) =>
    `${BASE_URL}/timesheet/task-areas/${sowId}/${encodeURIComponent(workArea)}`,

  // 📊 Metrics (Dashboard)
  TOTAL_PROJECTS: `${BASE_URL}/metrics/total-projects`,
  ACTIVE_PROJECTS: `${BASE_URL}/metrics/active-projects`,
  CLIENTS: `${BASE_URL}/metrics/clients`,
  EMPLOYEES_ASSIGNED: `${BASE_URL}/metrics/employees-assigned`,
  AVG_HOURS_BILLED: `${BASE_URL}/metrics/avg-hours-billed`,

  // 🧠 OpenAI (SOW Generation)

  OPENAI_GENERATE_SOW_HTML: `${BASE_URL}/openai/generate-preview-doc`,
  OPENAI_EDIT_DOC: `${BASE_URL}/openai/edit-doc`,
  OPENAI_SAVE_FINAL_DOC: `${BASE_URL}/openai/save-edited-doc`,
  OPENAI_DOWNLOAD_FINAL_DOC: `${BASE_URL}/openai/download-edited-doc`,

  OPENAI_GENERATE_MSA_HTML: `${BASE_URL}/openai/generate-preview-msa`,
  OPENAI_SAVE_MSA_DOC: `${BASE_URL}/openai/save-edited-msa-doc`,
  OPENAI_DOWNLOAD_MSA_DOC: `${BASE_URL}/openai/download-edited-msa-doc`,

  GET_ADMINS_BY_COMPANY: `${BASE_URL}/admins/company`,
  ADD_COMPANY_ADMIN: `${BASE_URL}/admins/company/add`,
  DELETE_COMPANY_ADMIN: `${BASE_URL}/admins/company`,
  GET_ALL_COMPANY_ADMINS: `${BASE_URL}/admins/all-admins`,
  FETCH_ADMIN_EMPLOYEES: `${BASE_URL}/admins/employees`,
};

export default API;
