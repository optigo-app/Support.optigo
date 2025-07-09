import React from "react";
import Preview from "./Preview";

const index = ({ attachments = [], open = false, setOpen = () => {} }) => {
	return <Preview attachments={attachments} open={open} setOpen={setOpen} />;
};

export default index;
