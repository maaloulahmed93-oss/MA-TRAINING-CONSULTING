import React from 'react';
import { Participant } from '../../types/participant';
import ParticipantDetailsEnhanced from './ParticipantDetailsEnhanced';

interface ParticipantDetailsProps {
  participant: Participant;
}

const ParticipantDetails: React.FC<ParticipantDetailsProps> = ({ participant }) => {
  return <ParticipantDetailsEnhanced participant={participant} />;
};

export default ParticipantDetails;
