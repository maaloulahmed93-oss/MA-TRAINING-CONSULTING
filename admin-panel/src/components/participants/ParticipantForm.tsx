import React from 'react';
import { Participant } from '../../types/participant';
import ParticipantFormEnhanced from './ParticipantFormEnhanced';

interface ParticipantFormProps {
  onSubmit: (data: Partial<Participant>) => void;
  onCancel: () => void;
  initialData?: Participant | null;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  return (
    <ParticipantFormEnhanced
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialData={initialData}
    />
  );
};

export default ParticipantForm;
