import React from 'react';
import type { Certificate } from '../../services/certificatesService';
import { DocumentArrowDownIcon, AcademicCapIcon, StarIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface CertificateModalContentProps {
  certificate: Certificate | null;
}

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
  </div>
);

const CertificateModalContent: React.FC<CertificateModalContentProps> = ({ certificate }) => {
  if (!certificate) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {certificate.firstName} {certificate.lastName}
            </h2>
            <p className="text-md text-gray-600">{certificate.program}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DetailItem label="ID Attestation" value={certificate.id} />
        <DetailItem label="Date d'obtention" value={certificate.completionDate} />
        <DetailItem label="Note Finale" value={`${certificate.grade}/20`} />
        <DetailItem label="Niveau Atteint" value={certificate.level} />
      </div>

      {/* Skills & Techniques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center"><StarIcon className="h-5 w-5 mr-2 text-yellow-500"/>Compétences</h4>
          <div className="flex flex-wrap gap-2">
            {certificate.skills.map(skill => (
              <span key={skill} className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center"><WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-indigo-500"/>Techniques</h4>
          <div className="flex flex-wrap gap-2">
            {certificate.techniques.map(tech => (
              <span key={tech} className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">{tech}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Downloadable Documents */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-3">Documents à Télécharger</h4>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-sm hover:bg-blue-700 flex items-center justify-center text-center font-semibold">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Attestation de Réussite
          </a>
          <a href={certificate.recommendationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg shadow-sm hover:bg-gray-800 flex items-center justify-center text-center font-semibold">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Lettre de Recommandation
          </a>
          <a href={certificate.evaluationUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg shadow-sm hover:bg-gray-300 flex items-center justify-center text-center font-semibold">
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Fiche d'Évaluation
          </a>
        </div>
      </div>
    </div>
  );
};

export default CertificateModalContent;
