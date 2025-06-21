import { IconButton } from '@mui/material'
import { BadgeX } from 'lucide-react'
import React, { useState } from 'react'
import ReusableConfirmModal from './../../shared/ui/ReuseableModal';
import { useTraining } from '../../../context/TrainingProvider';

const DeleteTrainingAction = ({ params, showNotification }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { deleteTraining } = useTraining()

    const handleDelete = () => {
        const sessionId = params.row.SessionID;
        deleteTraining(sessionId);
        showNotification("Training deleted successfully!", "success")
        setShowDeleteModal(false);
    };

    return (
        <>
            <IconButton
                size="small"
                color="error"
                sx={{ textTransform: 'none' }}
                title="Delete Training Session"
                onClick={() => setShowDeleteModal(true)}
            >
                <BadgeX />
            </IconButton>
            <ReusableConfirmModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                type="delete"
            />
        </>
    )
}

export default DeleteTrainingAction