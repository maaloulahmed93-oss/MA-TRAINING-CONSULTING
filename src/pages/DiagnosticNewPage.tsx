import React from 'react';
import { useNavigate } from 'react-router-dom';
import FreeCourseModal from '../components/FreeCourseModal';

const DiagnosticWonderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <FreeCourseModal isOpen={true} onClose={() => navigate(-1)} />
    </div>
  );
};

export default DiagnosticWonderPage;
