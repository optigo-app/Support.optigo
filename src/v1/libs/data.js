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

export const TicketCategory = ["New Request", "Tech Support", "Training", "Change Request", "Professional Service", "Query"];

export const TicketStatusOptions = ["Approved", "New", "Feedback Received", "In-Review", "In-Progress", "In Development", "Feedback Pending", "Pending Customer Input", "In observation", "Solved", "Solved - Upcoming Release", "Upcoming Release", "Closed", "Pending Maintenance", "Training Pending", "Client Conversation Pending", "Pending Close", "upload pending", "In Planning"];

export const RenderOptions = [
  { label: "STATUS", field: "Status", options: TicketStatusOptions },
  { label: "APPNAME", field: "appname", options: topicOptions },
  {
    label: "CATEGORY",
    field: "category",
    options: ["New Request", "Tech Support", "Training", "Change Request", "Professional Service", "Query"],
  },
  { label: "PRIORITY", field: "Priority", options: ["Medium", "High"] },
  {
    label: "FOLLOW UP",
    field: "FollowUp",
    options: ["Follow Up 1", "Follow Up 2"],
  },
  { label: "SEND EMAIL", field: "sendMail", options: ["Yes", "No"] },
];

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

export const truncateByWords = (text, maxWords) => text.split(/\s+/).slice(0, maxWords).join(" ");

export const truncateByChars = (text, maxChars) => (text.length > maxChars ? text.slice(0, maxChars) + "..." : text);

export const renderIfPresent = (value) => value !== null && value !== undefined && value !== "";
