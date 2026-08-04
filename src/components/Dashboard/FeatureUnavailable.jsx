import React from 'react';
import EnterpriseEmptyState from './UI/Enterprise/State/EnterpriseEmptyState';
import { Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureUnavailable = ({ featureName }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center">
      <EnterpriseEmptyState 
        icon={Hammer}
        title={`${featureName} Under Construction`}
        description="This feature is not currently available in this enterprise release. Our engineering team is actively working on it."
        actionLabel="Back to Dashboard"
        onAction={() => navigate('/admin/overview')}
      />
    </div>
  );
};

export default FeatureUnavailable;
