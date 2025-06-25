import React from 'react';
import './SurveyPreview.css';

import Checkbox from '../../SurveyTemplateUser/QuestionTypes/CheckboxUser';
import DateTime from '../../SurveyTemplateUser/QuestionTypes/DateTimeUser';
import Dropdown from '../../SurveyTemplateUser/QuestionTypes/DropdownUser';
import LikertScale from '../../SurveyTemplateUser/QuestionTypes/LikertScaleUser';
import LinearScaleQuestion from '../../SurveyTemplateUser/QuestionTypes/LinearScaleUser';
import RadioQuestion from '../../SurveyTemplateUser/QuestionTypes/RadioUser';
import RatingQuestion from '../../SurveyTemplateUser/QuestionTypes/RatingUser';
import Text from '../../SurveyTemplateUser/QuestionTypes/TextUser';
import TickBoxGrid from '../../SurveyTemplateUser/QuestionTypes/TickBoxGridUser';

const SurveyPreview = ({
    title,
    sections,
    questions,
    image,
    description,
    language,
    getLabel,
}) => {

  const renderPreviewQuestion = (question) => {
    const interactiveProps = {
      question,
      language,
      getLabel,
      userResponse: [],
      setUserResponse: () => {},
    };
    console.log("Description in SurveyPreview:", description);

    switch (question.type) {
      case "checkbox": return <Checkbox {...interactiveProps} />;
      case "datetime": return <DateTime {...interactiveProps} />;
      case "dropdown": return <Dropdown {...interactiveProps} />;
      case "likert": return <LikertScale {...interactiveProps} />;
      case "linearScale": return <LinearScaleQuestion {...interactiveProps} />;
      case "radio": return <RadioQuestion {...interactiveProps} />;
      case "rating": return <RatingQuestion {...interactiveProps} />;
      case "text": return <Text {...interactiveProps} />;
      case "tickboxGrid": return <TickBoxGrid {...interactiveProps} />;
      default: return null;
    }
  };

  return (
    <div 
      className="survey-preview-container"
      style={{ pointerEvents: 'none', fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}
    >
      
      {image && <img src={image} alt="Survey Banner" style={{ width: '100%', height: 'auto', marginBottom: '20px', borderRadius: '8px' }} />}
      
      <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{title || (getLabel ? getLabel("Untitled Survey") : "Untitled Survey")}</h1>
      
      {description && (
        <p style={{ fontSize: '1.1em', color: '#555', marginTop: '15px', whiteSpace: 'pre-wrap' }}>
          {description}
        </p>
      )}

      {(sections || []).map((section) => (
        <div key={section.id} style={{ marginTop: '25px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.4em', color: '#333' }}>{section.title || (getLabel ? `${getLabel("Section")} ${section.id}`: `Section ${section.id}`)}</h2>
          
          <div style={{ marginTop: '15px' }}>
            {(questions || [])
              .filter((q) => q.section === section.id)
              .sort((a, b) => a.id - b.id)
              .map((question) => (
                <div key={question.id} style={{ marginBottom: '20px' }}>
                  {renderPreviewQuestion(question)}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurveyPreview;