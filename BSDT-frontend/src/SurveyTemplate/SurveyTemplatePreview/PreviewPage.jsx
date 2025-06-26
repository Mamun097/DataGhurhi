import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import SurveyPreview from './SurveyPreview';
import NavbarAcholder from '../../ProfileManagement/navbarAccountholder';

const PreviewPage = () => {
  const location = useLocation();

  if (!location.state) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No Preview Available</h2>
        <p>Preview data can only be shown by navigating from the survey editor.</p>
        <Link to="/dashboard">Return to Dashboard</Link>
      </div>
    );
  }

  const { title, sections, questions, image, description, language } = location.state;
  
  const getLabel = (text) => text; 

  return (
    <>  
      <NavbarAcholder />
      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '10px' }}>
        <SurveyPreview
          title={title}
          sections={sections}
          questions={questions}
          image={image}
          description={description}
          language={language}
          getLabel={getLabel}
        />
      </div>
    </>
  );
};

export default PreviewPage;