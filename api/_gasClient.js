const REQUIRED_ENV = 'GAS_WEB_APP_URL';

export const getGasUrl = () => {
  const gasUrl = process.env[REQUIRED_ENV];

  if (!gasUrl) {
    throw new Error(`${REQUIRED_ENV} is not configured`);
  }

  return gasUrl;
};

export const sanitizeEmployees = (employees = []) =>
  employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    contractTime: employee.contractTime,
    department: employee.department,
  }));
