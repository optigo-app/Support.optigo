const fakeGuestUser = {
  id: 1004,
  firstname: "Greg",
  lastname: "Guest",
  role: "guest",
  roleid: 0,
  designation: "Visitor",
  customerCode: "guest000",
  firmname: ""
}

const fakeClientUser = {
  id: 1003,
  firstname: "Cathy",
  lastname: "Client",
  role: "client",
  roleid: 3,
  designation: "Client Representative",
  customerCode: "cli003",
  firmname: "Client Inc"
}
const fakeEmployeeUser = {
  id: 1002,
  firstname: "Evan",
  lastname: "Employee",
  role: "employee",
  roleid: 2,
  designation: "Support Engineer",
  customerCode: "emp002",
  firmname: "TechSupport Ltd"
}

const fakeAdminUser = {
  id: 1001,
  firstname: "Alice",
  lastname: "Admin",
  role: "admin",
  roleid: 1,
  designation: "System Administrator",
  customerCode: "admin001",
  firmname: "AdminCorp"
}

export {fakeGuestUser, fakeClientUser, fakeEmployeeUser, fakeAdminUser}