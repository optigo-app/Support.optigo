export const validateForm = (form) => {
    const requiredFields = ["subject", "projectCode", "userName", "category","instruction" ,"appname"];
    return requiredFields.reduce((acc, field) => {
      if (!form[field]) {
        acc[field] = true;
      }
      return acc;
    }, {});
  };
  

  export const ClientvalidateForm = (form) => {
    const requiredFields = ["subject", "category","instruction" ];
    return requiredFields.reduce((acc, field) => {
      if (!form[field]) {
        acc[field] = true;
      }
      return acc;
    }, {});
  };
  