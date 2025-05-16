// src/components/Tag.js
import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Individual tag component with animation
const TagBadge = ({ tag, onDelete, isAnimated }) => (
  <span 
    className={`badge d-flex align-items-center me-1 ${isAnimated ? 'tag-animated' : ''}`}
    style={{ 
      backgroundColor: '#f0f4f8', 
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '16px', 
      padding: '4px 12px', 
      fontSize: '0.75rem',
      fontWeight: 'normal',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      opacity: isAnimated ? 0 : 1,
      animation: isAnimated ? 'tagFadeIn 0.4s ease-out forwards' : 'none'
    }}
    data-tag={tag}>
    {tag}
    <button
      className="btn-close ms-2"
      style={{ 
        fontSize: '0.5rem', 
        opacity: 0.6,
        padding: '2px',
        transition: 'opacity 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.opacity = 1}
      onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
      onClick={onDelete}
      aria-label="Delete tag">
    </button>
  </span>
);

const TagManager = ({ questionId, questionText, questions, setQuestions }) => {
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [animatedTags, setAnimatedTags] = useState([]);
  const tagInputRef = useRef(null);

  // Initialize tags from question meta
  useEffect(() => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.meta && question.meta.tags) {
      setTags(question.meta.tags);
    }
  }, [questionId, questions]);

  // Handle showing the tag input
  const handleAddTagClick = () => {
    setIsAddingTag(true);
    // Focus input after rendering
    setTimeout(() => {
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }, 0);
  };

  // Function to add a tag with animation
  const addTagWithAnimation = (tagToAdd) => {
    // Check if tag already exists - if so, don't add it
    if (tags.includes(tagToAdd)) {
      return null;
    }
    
    // Add tag to UI and mark as animated
    setTags(prevTags => [tagToAdd, ...prevTags]);
    setAnimatedTags(prev => [...prev, tagToAdd]);
    
    // Remove from animated tags after animation completes
    setTimeout(() => {
      setAnimatedTags(prev => prev.filter(t => t !== tagToAdd));
    }, 600);

    // Return the tag for further processing
    return tagToAdd;
  };

  // Handle tag input submission
  const handleTagSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!newTag.trim()) {
      setIsAddingTag(false);
      return;
    }

    const tagToAdd = newTag.trim();
    setNewTag("");

    // Add tag with animation, only if it doesn't already exist
    if (!tags.includes(tagToAdd)) {
      addTagWithAnimation(tagToAdd);

      // Save tag to question meta
      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? {
              ...q,
              meta: {
                ...q.meta,
                tags: [...(q.meta.tags || []), tagToAdd],
              },
            }
            : q
        )
      );
    }

    setIsAddingTag(false);
  };

  // Handle tag input cancel
  const handleTagCancel = () => {
    setNewTag("");
    setIsAddingTag(false);
  };

  // Handle generate tags with LLM
  const generateTagsWithLLM = async () => {
    setIsGeneratingTags(true);
    try {
      // API call to generate tags with LLM
      const question = questions.find(q => q.id === questionId);
      let meta_data = {};
      if (question && question.meta) {
        meta_data = question.meta;
      }
      const response = await fetch(`http://localhost:2000/api/generate-tags/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question_text: questionText,
          meta_data: meta_data
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If we have tags, add them with staggered animation
        if (data.tags && data.tags.length > 0) {
          // Create a copy of existing tags to prevent duplicates
          const existingTagsSet = new Set(tags);
          const newTagsToAdd = data.tags.filter(tag => !existingTagsSet.has(tag));
          
          // Add tags with staggered animation
          let delay = 0;
          const allAddedTags = [];
          
          newTagsToAdd.forEach((tag) => {
            setTimeout(() => {
              // Only add if not already in the list (double-check to prevent race conditions)
              if (!tags.includes(tag) && !allAddedTags.includes(tag)) {
                addTagWithAnimation(tag);
                allAddedTags.push(tag);
              }
            }, delay);
            delay += 150; // Stagger effect
            allAddedTags.push(tag);
          });
          
          // Update question meta with all new tags (but only once)
          if (allAddedTags.length > 0) {
            // Get current tags from question meta
            const currentMetaTags = question?.meta?.tags || [];
            // Combine new tags with existing tags without duplicates
            const updatedTags = [...new Set([...allAddedTags, ...currentMetaTags])];
            
            setQuestions(prev =>
              prev.map(q =>
                q.id === questionId
                  ? {
                    ...q,
                    meta: {
                      ...q.meta,
                      tags: updatedTags,
                    },
                  }
                  : q
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Error generating tags:", error);
    } finally {
      setIsGeneratingTags(false);
      setIsAddingTag(false); // Close the tag input after generating tags
    }
  };

  // Handle delete tag
  const handleDeleteTag = (tagToDelete) => {
    // Apply deletion animation (fade out)
    const tagElement = document.querySelector(`[data-tag="${tagToDelete}"]`);
    if (tagElement) {
      tagElement.style.animation = 'tagFadeOut 0.3s forwards';
      
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        // Remove tag from UI
        setTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));

        // Remove tag from question meta
        setQuestions(prev =>
          prev.map(q =>
            q.id === questionId
              ? {
                ...q,
                meta: {
                  ...q.meta,
                  tags: (q.meta.tags || []).filter(tag => tag !== tagToDelete),
                },
              }
              : q
          )
        );
      }, 300);
    } else {
      // Fallback if element not found
      setTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
      
      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? {
              ...q,
              meta: {
                ...q.meta,
                tags: (q.meta.tags || []).filter(tag => tag !== tagToDelete),
              },
            }
            : q
        )
      );
    }
  };

  return (
    <div className="d-flex align-items-center">
      {/* Animation Styles */}
      <style>
        {`
          @keyframes tagFadeIn {
            0% {
              opacity: 0;
              transform: translateX(-10px) translateY(5px) scale(0.9);
            }
            70% {
              opacity: 1;
              transform: translateX(2px) translateY(0) scale(1.03);
            }
            100% {
              opacity: 1;
              transform: translateX(0) translateY(0) scale(1);
            }
          }
          
          @keyframes tagFadeOut {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.9);
            }
          }
          
          .tag-container {
            display: flex;
            flex-direction: row-reverse;
            flex-wrap: wrap;
          }
        `}
      </style>
      
      {/* Display tags from right to left */}
      <div className="tag-container d-flex flex-row-reverse">
        {tags.map((tag, index) => (
          <TagBadge 
            key={tag + '-' + index} 
            tag={tag} 
            onDelete={() => handleDeleteTag(tag)} 
            isAnimated={animatedTags.includes(tag)}
          />
        ))}
      </div>

      {/* Add Tag UI */}
      {isAddingTag ? (
        <div className="d-flex align-items-center" style={{ height: '28px' }}>

          {!isGeneratingTags && (<button
            type="button"
            className="btn btn-sm btn-outline-secondary me-1"
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={handleTagCancel}
          >
            Cancel
          </button>)}

          <button
            type="button"
            className="btn btn-sm btn-outline-primary me-1"
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={generateTagsWithLLM}
            disabled={isGeneratingTags}
          >
            {isGeneratingTags ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  style={{ width: '0.5rem', height: '0.5rem' }}
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating Tag!
              </>
            ) : (
              'Auto Generate'
            )}
          </button>

          <div style={{ height: '28px' }}>
            <input
              ref={tagInputRef}
              type="text"
              className="form-control form-control-sm"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTagSubmit()}
              style={{
                width: '120px',
                height: '100%',
                fontSize: '0.75rem',
                paddingTop: '2px',
                paddingBottom: '2px',
                boxShadow: '0 0 2px rgba(0, 0, 255, 0.50)',
                outline: 'none'
              }}
              placeholder="Add Tag Manually"
            />
          </div>
        </div>
      ) : (
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ fontSize: '0.75rem', padding: '2px 8px', height: '28px', boxShadow: 'none' }}
          onClick={handleAddTagClick}
        >
          <i className="bi bi-tag-fill" 
             style={{ 
               fontSize: '0.75rem', 
               boxShadow: 'none',
               color: '#007bff' // Using Bootstrap's green color to match Auto Generate hover
             }}></i> Add Tag
        </button>
      )}
    </div>
  );
};

export default TagManager;