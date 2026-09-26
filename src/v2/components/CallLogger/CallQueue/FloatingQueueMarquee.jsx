import Marquee from "react-fast-marquee";
import {
    Avatar,
    Box,
    Chip,
    Stack,
    Typography,
    Paper,
} from "@mui/material";

import CallRoundedIcon from "@mui/icons-material/CallRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneCallbackRoundedIcon from "@mui/icons-material/PhoneCallbackRounded";
import { CallQueueUI } from "../CallRecorderScreen";

const queueData = [
    {
        id: 1,
        customer: "Rohit Sharma",
        queueNo: "Q-1021",
        status: "Waiting",
        time: "02:14 PM",
        avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
        id: 2,
        customer: "Neha Patel",
        queueNo: "Q-1022",
        status: "On Call",
        time: "02:18 PM",
        avatar: "https://i.pravatar.cc/150?img=32",
    },
    {
        id: 3,
        customer: "Mayur Jain",
        queueNo: "Q-1023",
        status: "Assigned",
        time: "02:24 PM",
        avatar: "https://i.pravatar.cc/150?img=22",
    },
    {
        id: 4,
        customer: "Karan Mehta",
        queueNo: "Q-1024",
        status: "Priority",
        time: "02:28 PM",
        avatar: "https://i.pravatar.cc/150?img=15",
    },
];

const FloatingQueueMarquee = ({ onEditCall }) => {
    return (
        <Box
            sx={{
                width: "100%",
                overflow: "hidden",
                minHeight: '64px'
            }}
        >

            <CallQueueUI
                onEditCall={onEditCall}

            />
        </Box>
    );
};

export default FloatingQueueMarquee;




//  {queueData.map((item) => (
//                         <Paper
//                             key={item.id}
//                             elevation={0}
//                             sx={{
//                                 minWidth: 320,
//                                 borderRadius: 8,
//                                 px: 1.5,
//                                 py: 1,
//                                 border: "1px solid",
//                                 borderColor: "divider",
//                                 background:
//                                     "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
//                                 backdropFilter: "blur(10px)",
//                                 transition: "0.3s",
//                                 mr: 2,
//                             }}
//                         >
//                             <Stack
//                                 direction="row"
//                                 justifyContent="space-between"
//                                 alignItems="center"
//                             >
//                                 {/* Left */}
//                                 <Stack
//                                     direction="row"
//                                     spacing={1.5}
//                                     alignItems="center"
//                                 >
//                                     <Avatar
//                                         src={item.avatar}
//                                         sx={{
//                                             width: 50,
//                                             height: 50,
//                                         }}
//                                     />

//                                     <Box>
//                                         <Typography
//                                             fontWeight={700}
//                                             fontSize={14}
//                                         >
//                                             {item.customer}
//                                         </Typography>

//                                         <Stack
//                                             direction="row"
//                                             spacing={0.5}
//                                             alignItems="center"
//                                         >
//                                             <PersonRoundedIcon
//                                                 sx={{
//                                                     fontSize: 14,
//                                                     color: "text.secondary",
//                                                 }}
//                                             />

//                                             <Typography
//                                                 variant="caption"
//                                                 color="text.secondary"
//                                             >
//                                                 {item.queueNo}
//                                             </Typography>
//                                         </Stack>
//                                     </Box>
//                                 </Stack>

//                                 {/* Status */}
//                                 <Chip
//                                     size="small"
//                                     icon={<CallRoundedIcon
//                                         sx={{
//                                             fontSize: 16,
//                                             color: "success.main",
//                                         }}
//                                     />}
//                                     label={item.status}
//                                     color={"success"}
//                                 />
//                             </Stack>
//                         </Paper>
//                     ))}