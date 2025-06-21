export const departmentsNames = {
  Support: ["Amit", "Priya", "Ravi"],
  Testing: ["Neha", "Arjun", "Kiran", "Prachi", "Lalit", "Isha"],
  Documentation: ["Sanya", "Sonal", "Ajay", "Trisha", "Manish", "Deepti", "Varun"],
  Developer: ["Vikram", "Rhea", "Kabir"],
  Management: ["Suresh", "Anjali", "Omkar", "Seema", "Tushar", "Lavanya", "Arvind", "Garima", "Hitesh"],
};

export const forwardOptions = Object.entries(departmentsNames).flatMap(([designation, people]) => people.map((person) => ({ designation, person })));

export const getStatusColor = (status) => {
  switch (status) {
    case "Solved":
      return { label: "Solved", color: "success" };
    case "Delivered":
      return { label: "Delivered", color: "info" };
    case "Support tracking":
      return { label: "Support tracking", color: "warning" };
    case "Assign to testing":
      return { label: "Assign to testing", color: "primary" };
    case "Waiting for developer":
      return { label: "Waiting for developer", color: "default" };
    case "Waiting for tester":
      return { label: "Waiting for tester", color: "default" };
    case "Developer tracking":
      return { label: "Developer tracking", color: "warning" };
    case "Maintenance done":
      return { label: "Maintenance done", color: "success" };
    case "Permanant solution pending":
      return { label: "Permanant solution pending", color: "error" };
    case "Temporary solution given":
      return { label: "Temporary solution given", color: "info" };
    case "Show next time":
      return { label: "Show next time", color: "default" };
    case "New requirement":
      return { label: "New requirement", color: "primary" };
    case "Ticket generated":
      return { label: "Ticket generated", color: "info" };
    case "They will call back":
      return { label: "They will call back", color: "default" };
    default:
      return { label: status, color: "default" };
  }
};


export const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return { label: "High", color: "error" };
    case "Medium":
      return { label: "Medium", color: "warning" };
    case "Low":
      return { label: "Low", color: "success" };
    default:
      return { label: priority, color: "default" };
  }
};

export const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Closed", label: "Closed" },
];

export const EstatusOptions = [
  { value: "Tracking", label: "Tracking" },
  { value: "Hold", label: "Hold" },
  { value: "Closed", label: "Closed" },
];
export const priorityOptions = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
];

export const departments = {
  Support: ["Training not provided", "Support team not providing proper answers", "Long response time", "Incorrect information provided", "Lack of follow-up"],
  Testing: ["Test cases not tested", "Issue tracking limitations", "Test environment unavailable", "Regression testing incomplete", "Test data inadequate"],
  Documentation: ["New requirement not documented", "Requirement not clear", "Documentation outdated", "Missing technical details", "Inconsistent documentation"],
  Developer: ["Special case SP not uploaded", "Code errors", "Missed deadlines", "Poor code quality", "Integration issues"],
  Management: ["Resource allocation issues", "Unclear priorities", "Communication gaps", "Project timeline unrealistic", "Budget constraints"],
};

export const satisfactionOptions = [
  { value: "very-dissatisfied", label: "Very Dissatisfied" },
  { value: "dissatisfied", label: "Dissatisfied" },
  { value: "neutral", label: "Neutral" },
  { value: "satisfied", label: "Satisfied" },
  { value: "very-satisfied", label: "Very Satisfied" },
];

export const receivedByOptions = ["Namrata", "Sonal", "Neha", "Nidhi", "Jenish", "Kuldeep", "Harsha", "Hiren"];
export const topicOptions = ["General", "CRM", "Accounting", "Management", "Support", "Sales", "Feedback", "Technical", "Consultation", "Billing", "Project Management", "Operations", "Product Inquiry", "Marketing"];

export const appBarHeight = 64;

export const TicketcompanyNames = [
  "OPTIGO",
  "ELVEE",
  "privaa",
  "vinayak",
  "tempcompany",
  "orail",
  "test",
  "jewelista",
  "pjc",
  "palak",
  "pj",
  "Arya",
  "dcj",
  "ljpl",
  "Mobile APP",
  "kayra",
  "gemsake",
  "gcd",
  "solanki",
  "vd16",
  "temp",
  "company",
  "vrj",
  "pd",
  "kmj",
  "sdj",
  "sdjpl",
  "PRV",
  "Optigo_C",
  "HDS18",
  "UDAYJEWELS",
  "naaz",
  "sparkle",
  "MNO",
  "PSJEWELS",
  "imaginarium",
  "GLITZ",
  "LWJ",
  "SJL",
  "bwol",
  "pxbjpl",
  "84884613",
  "testsonal",
  "hemratna",
  "ARNV",
  "saklecha",
  "PRJ1920",
  "hemratnajewels",
  "7662278",
  "Ekhi",
  "ElveePromise",
  "ojasvi",
  "mobileapp",
  "19648901",
  "fbangles",
  "SJMA",
  "SHINE",
  "RKGEMS",
  "MISC",
  "ssjewels",
  "tiffany",
  "Pruthvi",
  "D ORIGINALS",
  "ShreeYash",
  "Jdesign",
  "Sona2cash",
  "Tahijewels",
  "KHURANAJEW",
  "MJGPL",
  "Shakti",
  "ITASK",
  "DILIP",
  "promise",
  "ValentineG",
  "sdjc",
  "cleojewell",
  "diament",
  "DFINE",
  "SUMANGAL",
  "SILVERSEAL",
  "auzas",
  "poshdj",
  "GOLDG",
  "karwalj",
  "Arlinmart",
  "test52",
  "ezetta403",
  "QissaBySS",
  "Stamford",
  "DEGLINT",
  "test53",
  "Annulus",
  "optigosupport",
  "vidhishah",
  "rkbracelet",
  "9qube",
  "carat",
  "prism",
  "abjewels",
  "weblwj",
  "testwa",
  "DIAMONDHQ",
  "sgdpl",
  "rishab",
  "paraiso",
  "lovein",
  "maheswarij",
  "ONE080",
  "sriyaa",
  "sonani",
  "hearth",
  "jewelima",
  "TRIEXPORTS",
  "Divas",
  "shaktij",
  "dcluxist",
  "gjjewels",
  "ayaani",
  "testloc",
  "MYRAS",
  "testloc1",
  "icatdemo",
  "jeweldiam",
  "aayujewels",
  "shwenit",
  "golden",
  "Aravalij",
  "abcjewelry",
  "COLORINDIA",
  "Stellar",
  "Akshaya",
  "smgold",
  "Lakshmi",
  "dgsons",
  "krdiamond",
  "Ribbons",
  "sazjewels",
  "sgdesigns",
  "avira",
  "Akeed",
  "ssjeweller",
  "lotus",
  "Yamuna",
  "mpdiamond",
  "ratna",
  "kanysna",
  "DEWDMD",
  "gnpdia",
  "Vriddhi",
  "Tambi",
  "JBSVS",
  "Dimondtin",
  "Diamondtin",
  "kasjewel",
  "TEST68",
  "raseshwar",
  "Labh Jewels",
  "Carbon",
  "Thecartco",
  "thecaratco",
  "whiterock",
  "csixgd",
  "maiora",
  "manijewels",
  "nitara",
  "saraff",
  "adamantine",
  "saanvij",
  "mbjewels",
  "brgems",
  "aksaja",
  "rashi",
  "etches",
  "carftjewels",
  "satguru",
  "rivaazj",
  "arvindjwl",
  "akshatj",
  "divine",
  "eyana",
  "sultanj",
  "omjiyansh",
  "tdlgold",
  "foreveryd",
  "elior",
  "payal",
  "uscreation",
  "snjfactory",
  "Aryamond",
  "stardia",
  "avinaj",
  "aastraa",
  "scraft",
  "csixlgd",
  "ecarats",
  "oberon",
  "alpstar",
  "Diamond",
  "Ranawatgem",
  "nslatelier",
  "liaan",
  "alppl",
  "aastha",
  "Luxica",
  "aryamond1",
  "moriya",
  "Amantran",
  "nsefidubai",
];
export const companyOptions = [...TicketcompanyNames];

export const TicketuserNames = [
  "Namrata ",
  "Sonal ",
  "Neha ",
  "Nidhi ",
  "Jenish ",
  "Kuldeep ",
  "Harsha ",
  "Hiren ",
  "Shivam ",
  "Shubham ",
  "Siddhant ",
  "Sagar ",
  "Riya ",
  "Aarav Patel",
  "Diya Shah",
  "Vivaan Mehta",
  "Anaya Joshi",
  "Reyansh Desai",
  "Myra Iyer",
  "Ishaan Reddy",
  "Kiara Nair",
  "Aditya Menon",
  "Saanvi Rao",
  "Aryan Kapoor",
  "Avni Verma",
  "Kabir Bhatia",
  "Aadhya Agarwal",
  "Rudra Malhotra",
  "Tara Singh",
  "Shaurya Khan",
  "Meher Jain",
  "Atharv Mishra",
  "Inaaya Das",
  "Arjun Kulkarni",
  "Vanya Bhatt",
  "Yuvan Choudhary",
  "Amaira Ghosh",
  "Veer Saxena",
  "Pari Trivedi",
  "Kian Lamba",
  "Aarohi Pillai",
  "Neil Dutta",
  "Ira Fernandes",
  "Krish Joshi",
  "Rhea Sharma",
  "Darsh Nambiar",
  "Nisha Borkar",
  "Lakshya Solanki",
  "Naira Vora",
  "Advait Rawat",
  "Sitara Shetty",
  "Riyan Kapoor",
  "Aisha Sawant",
  "Siddharth Gupta",
  "Lavanya Sen",
  "Jay Thakur",
  "Tanvi Chopra",
  "Rehaan Mehra",
  "Divya Singh",
  "Om Pandey",
  "Anvi Parekh",
  "Dev Bhagat",
  "Aaradhya Jadhav",
  "Harshavardhan Sinha",
  "Sia Chatterjee",
  "Arham Talwar",
  "Prisha Khatri",
  "Zayan Bhalla",
  "Mishti Shah",
  "Hridaan Gandhi",
  "Ritika Rani",
  "Vivaan Bhati",
  "Kritika Das",
  "Dhruv Bansal",
  "Jia Anand",
  "Atharva Chauhan",
  "Sanjana Kapoor",
  "Manan Gaur",
  "Yashika Suri",
  "Aryan Dhingra",
  "Trisha Pathak",
  "Ayan Jain",
  "Naisha Rawal",
  "Vihaan Nayak",
  "Kashvi Rajput",
  "Avi Kapoor",
  "Neha Verma",
  "Tanay Raj",
  "Kavya Pillai",
  "Rayan Naik",
  "Sanika Bansode",
  "Kabir Kaul",
  "Esha Mukherjee",
  "Arav Kohli",
  "Ridhi Rana",
  "Pranav Arora",
  "Anjali Bhagat",
  "Ivaan Shah",
  "Khushi Bhalla",
  "Yug Seth",
  "Ria Nambiar",
  "Tanishq Bedi",
  "Simran Doshi",
  "Ritvik Lohia",
  "Nidhi Mehta",
  "Shivansh Nair",
  "Zara Sinha",
  "Ahaan Modi",
  "Kiran Mathur",
  "Ranveer Chauhan",
  "Anaya Bakshi",
  "Uday Malhotra",
  "Vritika Malani",
  "Ishaan Arya",
  "Palak Ahuja",
  "Nirvaan Chopra",
  "Sanya Vaid",
  "Arnav Rathi",
  "Megha Borkar",
  "Abeer Goyal",
  "Priya Vora",
  "Samarth Kedia",
  "Ritika Jhaveri",
  "Darshil Dholakia",
  "Alisha Merchant",
  "Reyansh Gandhi",
  "Manya Advani",
  "Shaurya Modi",
  "Tanisha Handa",
  "Krrish Gera",
  "Aanya Bagga",
  "Tejas Bedi",
  "Niyati Purohit",
  "Aarush Kanth",
  "Mahira Dhingra",
  "Rudransh Sachdev",
  "Navya Bafna",
  "Yash Khatri",
  "Suhani Barot",
  "Harshit Kumar",
  "Ishita Kakkar",
  "Samar Bhargava",
  "Anushka Tolani",
  "Arin Jain",
  "Pihu Nanda",
  "Shiven Puri",
  "Tanya Bhat",
  "Riaan Malhotra",
  "Ahana Kakkar",
  "Vihaan Dubey",
  "Avika Sheth",
  "Aaditya Malani",
  "Lavina Solanki",
  "Jivin Sharma",
  "Ruhani Bedi",
  "Aryaveer Goenka",
  "Mihika Sethi",
  "Nivaan Kapoor",
  "Anshika Khanna",
  "Tanish Kapoor",
  "Rupal Merchant",
  "Ayansh Suri",
  "Jiya Jindal",
  "Aadit Kothari",
  "Sanvi Parekh",
  "Reyansh Bafna",
  "Diya Lakhani",
  "Harshil Raheja",
  "Ayra Doshi",
];

export const TicketCategory = ["New Request", "Tech Support", "Training", "Change Request", "Professional Service", "Query"];

export const TicketStatusOptions = [
  "Approved",
  "New",
  "Feedback Received",
  "In-Review",
  "In-Progress",
  "In Development",
  "Feedback Pending",
  "Pending Customer Input",
  "In observation",
  "Solved",
  "Solved - Upcoming Release",
  "Upcoming Release",
  "Closed",
  "Pending Maintenance",
  "Training Pending",
  "Client Conversation Pending",
  "Pending Close",
  "upload pending",
  "In Planning",
];

export const RenderOptions = [
  { label: "STATUS", field: "Status", options: TicketStatusOptions },
  { label: "APPNAME", field: "appname", options: topicOptions },
  {
    label: "CATEGORY",
    field: "category",
    options: ["New Request", "Tech Support", "Training", "Change Request", "Professional Service", "Query"],
  },
  { label: "PRIORITY", field: "Priority", options: ["Medium", "High"] },
  { label: "FOLLOW UP", field: "FollowUp", options: ["Follow Up 1", "Follow Up 2"] },
  { label: "SEND EMAIL", field: "sendMail", options: ["Yes", "No"] },
];

export const dummyData = [
  {
    TicketNo: "TI20001",
    projectCode: "NOVA",
    userName: "Amit",
    category: "Bug",
    subject: "UI not loading",
    instruction: "The dashboard page is blank after login.",
    attachment: null,
    keywords: "",
    Status: "New",
    Priority: "High",
    star: false,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-15T09:00:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-15T08:45:00.000Z",
    Comments: [
      {
        time: "2025-04-15T08:46:00.000Z",
        message: "Page not rendering for multiple users.",
        name: "Amit",
        attachment: null,
        role: "customer",
      },
    ],
    sendMail: true,
    appname: "WebPortal",
    createdby: "Client",
  },
  {
    TicketNo: "TI20002",
    projectCode: "ASTRA",
    userName: "Priya",
    category: "New Request",
    subject: "Request for new report module",
    instruction: "Need a financial summary report by department.",
    attachment: null,
    keywords: "",
    Status: "Closed",
    Priority: "Medium",
    star: true,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-10T14:30:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-09T10:00:00.000Z",
    Comments: [
      {
        time: "2025-04-09T10:10:00.000Z",
        message: "Initial request submitted.",
        name: "Priya",
        attachment: null,
        role: "customer",
      },
      {
        time: "2025-04-10T14:30:00.000Z",
        message: "Module implemented and tested.",
        name: "Dev Team",
        attachment: null,
        role: "employee",
      },
    ],
    sendMail: true,
    appname: "ERP",
    createdby: "Client",
  },
  {
    TicketNo: "TI20003",
    projectCode: "ZENITH",
    userName: "Rajesh",
    category: "Query",
    subject: "Clarification on billing",
    instruction: "Invoice doesn't match contract terms.",
    attachment: null,
    keywords: "",
    Status: "New",
    Priority: "Low",
    star: false,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-15T07:15:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-15T07:00:00.000Z",
    Comments: [
      {
        time: "2025-04-15T07:10:00.000Z",
        message: "Need detailed breakdown of charges.",
        name: "Rajesh",
        attachment: null,
        role: "customer",
      },
    ],
    sendMail: true,
    appname: "Billing",
    createdby: "Client",
  },
  {
    TicketNo: "TI20004",
    projectCode: "ORBIT",
    userName: "Sneha",
    category: "Tech Support",
    subject: "Email notifications not working",
    instruction: "System is not sending any alerts.",
    attachment: null,
    keywords: "",
    Status: "Closed",
    Priority: "High",
    star: true,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-12T12:00:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-11T08:00:00.000Z",
    Comments: [
      {
        time: "2025-04-11T08:05:00.000Z",
        message: "No alerts since yesterday.",
        name: "Sneha",
        attachment: null,
        role: "customer",
      },
      {
        time: "2025-04-12T12:00:00.000Z",
        message: "Issue fixed. SMTP misconfiguration resolved.",
        name: "IT Support",
        attachment: null,
        role: "employee",
      },
    ],
    sendMail: true,
    appname: "Notification Center",
    createdby: "Client",
  },
];


export const DualdummyData = [
  {
    TicketNo: "TI20001",
    projectCode: "NOVA",
    userName: "Amit",
    category: "Bug",
    subject: "UI not loading",
    Mainsubject: "Login Dashboard Issue",
    instruction: "The dashboard page is blank after login.",
    attachment: null,
    keywords: "",
    Status: "New",
    Priority: "High",
    star: false,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-15T09:00:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-15T08:45:00.000Z",
    Comments: [
      {
        time: "2025-04-15T08:46:00.000Z",
        message: "Page not rendering for multiple users.",
        name: "Amit",
        attachment: null,
        role: "customer",
      },
    ],
    sendMail: true,
    appname: "WebPortal",
    createdby: "Client",
  },
  {
    TicketNo: "TI20002",
    projectCode: "ASTRA",
    userName: "Priya",
    category: "New Request",
    subject: "Request for new report module",
    Mainsubject: "Departmental Financial Report",
    instruction: "Need a financial summary report by department.",
    attachment: null,
    keywords: "",
    Status: "Closed",
    Priority: "Medium",
    star: true,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-10T14:30:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-09T10:00:00.000Z",
    Comments: [
      {
        time: "2025-04-09T10:10:00.000Z",
        message: "Initial request submitted.",
        name: "Priya",
        attachment: null,
        role: "customer",
      },
      {
        time: "2025-04-10T14:30:00.000Z",
        message: "Module implemented and tested.",
        name: "Dev Team",
        attachment: null,
        role: "employee",
      },
    ],
    sendMail: true,
    appname: "ERP",
    createdby: "Client",
  },
  {
    TicketNo: "TI20003",
    projectCode: "ZENITH",
    userName: "Rajesh",
    category: "Query",
    subject: "Clarification on billing",
    Mainsubject: "",
    instruction: "Invoice doesn't match contract terms.",
    attachment: null,
    keywords: "",
    Status: "New",
    Priority: "Low",
    star: false,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-15T07:15:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-15T07:00:00.000Z",
    Comments: [
      {
        time: "2025-04-15T07:10:00.000Z",
        message: "Need detailed breakdown of charges.",
        name: "Rajesh",
        attachment: null,
        role: "customer",
      },
    ],
    sendMail: true,
    appname: "Billing",
    createdby: "Client",
  },
  {
    TicketNo: "TI20004",
    projectCode: "ORBIT",
    userName: "Sneha",
    category: "Tech Support",
    subject: "Email notifications not working",
    Mainsubject: "SMTP Alert Failure",
    instruction: "System is not sending any alerts.",
    attachment: null,
    keywords: "",
    Status: "Closed",
    Priority: "High",
    star: true,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-12T12:00:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-11T08:00:00.000Z",
    Comments: [
      {
        time: "2025-04-11T08:05:00.000Z",
        message: "No alerts since yesterday.",
        name: "Sneha",
        attachment: null,
        role: "customer",
      },
      {
        time: "2025-04-12T12:00:00.000Z",
        message: "Issue fixed. SMTP misconfiguration resolved.",
        name: "IT Support",
        attachment: null,
        role: "employee",
      },
    ],
    sendMail: true,
    appname: "Notification Center",
    createdby: "Client",
  },
  {
    TicketNo: "TI20005",
    projectCode: "SOLARIX",
    userName: "Divya",
    category: "Feature Request",
    subject: "Add dark mode",
    Mainsubject: "Dark Theme Feature for Accessibility",
    instruction: "Users have requested a dark theme option for night use.",
    attachment: null,
    keywords: "dark mode, ui, feature",
    Status: "New",
    Priority: "Medium",
    star: false,
    FollowUp: "",
    Del: "",
    Age: "",
    PromiseDate: "",
    UpdatedAt: "2025-04-15T09:30:00.000Z",
    LastUpdatedBy: "",
    CreatedOn: "2025-04-15T09:00:00.000Z",
    Comments: [
      {
        time: "2025-04-15T09:01:00.000Z",
        message: "Team would love to have this feature.",
        name: "Divya",
        attachment: null,
        role: "customer",
      }
    ],
    sendMail: true,
    appname: "UXHub",
    createdby: "Client",
  }
];

// utils/chipUtils.js

export const DetailgetPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

export const DetailgetStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "conversation pending":
    case "training pending":
      return "warning";

    case "closed":
    case "solved":
    case "resolved":
      return "success";

    case "in progress":
    case "running":
    case "under tracking":
    case "tracking":
    case "support tracking":
    case "developer tracking":
    case "assign to testing":
      return "info";

    case "hold":
    case "waiting for developer":
      return "secondary";

    case "new":
    case "new request":
    case "new requirement":
    case "ticket generated":
    case "change request":
    case "they will call back":
    case "show next time":
      return "primary";

    case "maintenance done":
    case "permanant solution pending":
    case "temporary solution given":
      return "success";

    default:
      return "default";
  }
};


export const customerData = {
  companyName: "Elveester",
  signUp: "12:00 PM, 01-04-2000, Surat",
  flow: "running normal manufacturing flow: - casting to fg with departmental process - using hy-brid billing - taking labour differently for finding and multi metal",
  owner: "Kalpesh Vagashiya",
  businessType: "Manufacturing",
  subscription: {
    package: "Pro Package",
    subscriptionDate: "20-05-2026",
    lastUpgradation: "01-05-2025",
  },
  advancedFeatures: ["hy-brid", "e-invoice", "pro QC"],
  specialFlow: "using finding split: - doing finding split for multi labour - hy-brid for different GST voucher",
  integrations: ["e-invoice", "WhatsApp", "Website"],
};
export const truncateByWords = (text, maxWords) =>
  text.split(/\s+/).slice(0, maxWords).join(" ");

export const truncateByChars = (text, maxChars) =>
  text.length > maxChars ? text.slice(0, maxChars) + "..." : text;

export const renderIfPresent = (value) => value !== null && value !== undefined && value !== "";
