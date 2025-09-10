import React from "react";
import {
  isFreelancerAuthenticated,
  getFreelancerSession,
  clearFreelancerSession,
} from "../services/freelancerAuth";
import { mockFreelancerStats } from "../services/freelancerData";
// import FreelancerLoginModal from '../components/freelancer/FreelancerLoginModal';
// import JobOffersTab from '../components/freelancer/JobOffersTab';
// import ProjectsTab from '../components/freelancer/ProjectsTab';
// import MeetingsTab from '../components/freelancer/MeetingsTab';
// import MinimalDeliverablesTab from '../components/freelancer/MinimalDeliverablesTab';

const MinimalFreelancerPage: React.FC = () => {
  console.log("MinimalFreelancerPage: Rendering");
  console.log("Testing services:", {
    isFreelancerAuthenticated,
    getFreelancerSession,
    clearFreelancerSession,
    mockFreelancerStats,
  });

  return (
    <div className="min-h-screen bg-green-100 p-8">
      <h1 className="text-4xl font-bold text-green-800 mb-4">
        Minimal Freelancer Page
      </h1>
      <p className="text-green-600">
        This is a minimal version to test the freelancer page.
      </p>
    </div>
  );
};

export default MinimalFreelancerPage;
