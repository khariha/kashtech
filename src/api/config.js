// src/api/config.js
const BASE_URL = "http://172.174.98.154/:5000/api";

const API = {
  TIMESHEET_REPORT: `${BASE_URL}/timesheet/report`,
  FETCH_PROJECT_DETAILS: (sowId) => `${BASE_URL}/projects/${sowId}`,
  FETCH_TASKS_BY_PROJECT: (sowId) => `${BASE_URL}/projects/${sowId}/tasks`,
  FETCH_EMPLOYEES_BY_PROJECT: (sowId) => `${BASE_URL}/projects/${sowId}/employees`,
  FETCH_ALL_EMPLOYEES1: `${BASE_URL}/employees/employees`,
  TIMESHEET_ADD_BATCH: `${BASE_URL}/timesheet/add-batch`,
  FETCH_ALL_EMPLOYEES: `${BASE_URL}/employees`,
  FETCH_MANAGE_CLIENTS: `${BASE_URL}/manageclients`,
  AUTH_LOGIN: `${BASE_URL}/auth/login`,
  GET_USER_PROFILE: `${BASE_URL}/user/me`,
  GET_COMPANIES_BY_BILLABLE: (isBillable) => `${BASE_URL}/timesheet/companies?billable=${isBillable}`,
  GET_PROJECTS_BY_COMPANY: (companyId) => `${BASE_URL}/timesheet/projects/${companyId}`,
  GET_AREAS_BY_PROJECT: (projectId) => `${BASE_URL}/timesheet/areas/${projectId}`,
  TOTAL_PROJECTS: `${BASE_URL}/metrics/total-projects`,
  ACTIVE_PROJECTS: `${BASE_URL}/metrics/active-projects`,
  CLIENTS: `${BASE_URL}/metrics/clients`,
  EMPLOYEES_ASSIGNED: `${BASE_URL}/metrics/employees-assigned`,
  AVG_HOURS_BILLED: `${BASE_URL}/metrics/avg-hours-billed`,
  PROJECTS_BY_COMPANY: (companyId) => `${BASE_URL}/projects/company/${companyId}`,
  GET_PROJECT_BY_SOW_ID: (sowId) => `${BASE_URL}/projects/${sowId}`,
  GET_ALL_PROJECTS: `${BASE_URL}/projects`,
  GET_EMPLOYEE_BY_ID: (empId) => `${BASE_URL}/employees/${empId}`,
  GET_CLIENT_BY_ID: (company_id) => `${BASE_URL}/manageclients/${company_id}`,
  CLIENT_PROJECTS: `${BASE_URL}/dashboard/client-projects`,

};

export default API;
