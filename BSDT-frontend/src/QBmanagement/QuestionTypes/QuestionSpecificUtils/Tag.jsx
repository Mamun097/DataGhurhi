// src/components/Tag.js
import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import apiClient from "../../../api";

// Individual tag component with animation and edit functionality
const TagBadge = ({ tag, onDelete, onEdit, isAnimated, isEditing, editValue, setEditValue, onConfirmEdit }) => {
  const editInputRef = useRef(null);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // If in edit mode, show edit interface with absolute positioning
  if (isEditing) {
    return (
      <span 
        className="badge d-flex align-items-center me-1 position-relative"
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
          // Keep the same dimensions as original tag
          visibility: 'hidden', // Hide but keep space
        }}>
        {tag}
        <div className="btn-close ms-2" style={{ fontSize: '0.5rem', opacity: 0, padding: '2px' }}></div>
        
        {/* Overlay edit UI with absolute positioning */}
        <div 
          className="position-absolute top-0 start-0 d-flex align-items-center w-100 h-100"
          style={{
            borderRadius: '16px',
            backgroundColor: '#f0f4f8',
            padding: '0',
            visibility: 'visible'
          }}
        >
          <div className="d-flex align-items-center w-100 h-100 px-3">
            <input
              ref={editInputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirmEdit()}
              style={{
                width: '100%',
                height: '100%',
                fontSize: '0.75rem',
                padding: '0',
                margin: '0',
                border: 'none',
                background: 'transparent',
                outline: 'none'
              }}
            />
            <button
              className="ms-1 flex-shrink-0"
              style={{ 
                background: 'transparent',
                border: 'none',
                padding: '0',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={onConfirmEdit}
              aria-label="Confirm edit">
              <i className="bi bi-check-circle-fill" style={{ color: '#28a745', fontSize: '0.75rem' }}></i>
            </button>
          </div>
        </div>
      </span>
    );
  }

  // Regular tag display
  return (
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
        animation: isAnimated ? 'tagFadeIn 0.4s ease-out forwards' : 'none',
        cursor: 'pointer'
      }}
      onClick={onEdit}
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
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering tag edit
          onDelete();
        }}
        aria-label="Delete tag">
      </button>
    </span>
  );
};

const TagManager = ({ questionId, questionText, updatedQuestion, setUpdatedQuestion}) => {
  const [tags, setTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [animatedTags, setAnimatedTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [allSystemTags, setAllSystemTags] = useState([]); // Store all system tags
  const [filteredTags, setFilteredTags] = useState([]); // Store filtered tags based on input
  const [showTagSuggestions, setShowTagSuggestions] = useState(false); // Control dropdown visibility
  const [isFetchingTags, setIsFetchingTags] = useState(false); // Loading state for tag fetch
  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize tags from question meta
  useEffect(() => {
    const question = updatedQuestion;
    if (question && question.meta_data && question.meta_data.tags) {
      setTags(question.meta_data.tags);
    }
  }, [updatedQuestion, questionId]);

  // Fetch all system tags when component mounts or when adding tag is clicked
  useEffect(() => {
    if (isAddingTag) {
      fetchAllSystemTags();
    }
  }, [isAddingTag]);

  // Filter tags when input changes
  useEffect(() => {
    if (newTag.trim() !== '') {
      const filtered = allSystemTags.filter(tag => 
        tag.toLowerCase().includes(newTag.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowTagSuggestions(false);
    }
  }, [newTag, allSystemTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          tagInputRef.current && !tagInputRef.current.contains(event.target)) {
        setShowTagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch all system tags from API
  const fetchAllSystemTags = async () => {
    setIsFetchingTags(true);
    try {
      const response = await apiClient.get('/api/all-tags');
      if (response.status === 200) {
        setAllSystemTags(response.data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching system tags:", error);
    } finally {
      setIsFetchingTags(false);
    }
  };

  // Handle showing the tag input
  const handleAddTagClick = () => {
    setIsAddingTag(true);
    // Cancel any ongoing tag editing
    setEditingTag(null);
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
    setShowTagSuggestions(false);

    // Add tag with animation, only if it doesn't already exist
    if (!tags.includes(tagToAdd)) {
      addTagWithAnimation(tagToAdd);

      // Save tag to updatedQuestion meta
      setUpdatedQuestion(prev => ({
        ...prev,
        meta_data: {
          ...prev.meta_data,
          tags: (prev.meta_data?.tags || []).filter(tag => tag !== tagToDelete),
        },
      }));
    }

    setIsAddingTag(false);
  };

  // Handle selection from tag dropdown
  const handleSelectTag = (selectedTag) => {
    setIsAddingTag(false);
    setNewTag("");
    setShowTagSuggestions(false);
    
    // Add tag with animation, only if it doesn't already exist
    if (!tags.includes(selectedTag)) {
      addTagWithAnimation(selectedTag);

      // Save tag to question meta
      
        setUpdatedQuestion(prev => ({
          ...prev,
          meta_data: {
            ...prev.meta_data,
            tags: (prev.meta_data?.tags || []).filter(tag => tag !== tagToDelete),
          },
        }));
    }
  };

  // Handle tag input cancel
  const handleTagCancel = () => {
    setNewTag("");
    setIsAddingTag(false);
    setShowTagSuggestions(false);
  };

  // Handle tag input change with dropdown control
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setNewTag(value);
    if (value.trim() !== '') {
      const filtered = allSystemTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowTagSuggestions(false);
    }
  };

  // Start editing a tag
  const handleEditTag = (tagToEdit) => {
    // Cancel any ongoing tag addition
    setIsAddingTag(false);
    setShowTagSuggestions(false);
    setEditingTag(tagToEdit);
    setEditValue(tagToEdit);
  };

  // Confirm tag edit
  const handleConfirmTagEdit = () => {
    if (!editValue.trim() || editValue === editingTag) {
      // If empty or unchanged, just cancel the edit
      setEditingTag(null);
      return;
    }

    const newTagValue = editValue.trim();
    
    // Check if tag already exists
    if (tags.includes(newTagValue) && newTagValue !== editingTag) {
      // If tag already exists, just cancel the edit
      setEditingTag(null);
      return;
    }

    // Update tag in UI with animation effect
    setTags(prevTags => 
      prevTags.map(tag => tag === editingTag ? newTagValue : tag)
    );
    
    // Add new tag to animated list for effect
    setAnimatedTags(prev => [...prev, newTagValue]);
    
    // Remove from animated tags after animation completes
    setTimeout(() => {
      setAnimatedTags(prev => prev.filter(t => t !== newTagValue));
    }, 600);

    // Update tag in question meta
    setUpdatedQuestion(prev => ({
        ...prev,
        meta_data: {
          ...prev.meta_data,
          tags: (prev.meta_data?.tags || []).filter(tag => tag !== tagToDelete),
        },
      }));

    // Exit edit mode
    setEditingTag(null);
  };

  // Handle generate tags with LLM
  const generateTagsWithLLM = async () => {
    setIsGeneratingTags(true);
    setShowTagSuggestions(false);
    try {
      // API call to generate tags with LLM
      const question = updatedQuestion;
      let meta_data = {};
      if (question && question.meta_data) {
        meta_data = question.meta_data;
      }
      const response = await apiClient.post('/api/generate-tags/', {
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
            
            // Update question meta
           setUpdatedQuestion(prev => ({
              ...prev,
              meta_data: {
                ...prev.meta_data,
                tags: updatedTags,
              },
            }));
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
    // Cancel editing if deleting the tag being edited
    if (editingTag === tagToDelete) {
      setEditingTag(null);
    }
    
    // Apply deletion animation (fade out)
    const tagElement = document.querySelector(`[data-tag="${tagToDelete}"]`);
    if (tagElement) {
      tagElement.style.animation = 'tagFadeOut 0.3s forwards';
      
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        // Remove tag from UI
        setTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));

        // Remove tag from question meta
        setUpdatedQuestion(prev => ({
          ...prev,
          meta_data: {
            ...prev.meta_data,
            tags: (prev.meta_data?.tags || []).filter(tag => tag !== tagToDelete),
          },
        }));

      }, 300);
    } else {
      // Fallback if element not found
      setTags(prevTags => prevTags.filter(tag => tag !== tagToDelete));
      
      setUpdatedQuestion(prev => ({
            ...prev,
            meta_data: {
              ...prev.meta_data,
              tags: (prev.meta_data?.tags || []).filter(tag => tag !== tagToDelete),
            },
          }));
              }
  };

  // Handle keyboard navigation in dropdown
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showTagSuggestions && filteredTags.length > 0) {
        // If dropdown is open, select the first tag
        handleSelectTag(filteredTags[0]);
      } else {
        // Otherwise submit the typed tag
        handleTagSubmit();
      }
    } else if (e.key === 'Escape') {
      // Close dropdown
      setShowTagSuggestions(false);
    } else if (e.key === 'ArrowDown' && showTagSuggestions) {
      // Focus the first dropdown item
      const firstItem = dropdownRef.current?.querySelector('button');
      if (firstItem) {
        e.preventDefault(); // Prevent cursor movement in input
        firstItem.focus();
      }
    }
  };

  // Handle keyboard navigation within the dropdown items
  const handleDropdownKeyDown = (e, index, tag) => {
    if (e.key === 'Enter') {
      // Select the current tag
      handleSelectTag(tag);
    } else if (e.key === 'Escape') {
      // Close dropdown and focus input
      setShowTagSuggestions(false);
      tagInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      // Focus next item
      e.preventDefault();
      const nextItem = dropdownRef.current?.querySelectorAll('button')[index + 1];
      if (nextItem) {
        nextItem.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        // If first item, focus back to input
        tagInputRef.current?.focus();
      } else {
        // Focus previous item
        const prevItem = dropdownRef.current?.querySelectorAll('button')[index - 1];
        if (prevItem) {
          prevItem.focus();
        }
      }
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
          
          .tag-suggestion {
            transition: background-color 0.15s ease;
          }
          
          .tag-suggestion:hover, .tag-suggestion:focus {
            background-color: #e9ecef;
          }
          
          .tag-dropdown {
            max-height: 200px;
            overflow-y: auto;
            z-index: 1050;
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
            onEdit={() => handleEditTag(tag)}
            isAnimated={animatedTags.includes(tag)}
            isEditing={editingTag === tag}
            editValue={editValue}
            setEditValue={setEditValue}
            onConfirmEdit={handleConfirmTagEdit}
          />
        ))}
      </div>

      {/* Add Tag UI */}
      {isAddingTag ? (
        <div className="d-flex align-items-center position-relative" style={{ height: '28px' }}>

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

          <div style={{ height: '28px' }} className="position-relative">
            <div className="input-group input-group-sm" style={{ height: '100%' }}>
              <input
                ref={tagInputRef}
                type="text"
                className="form-control form-control-sm"
                value={newTag}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onClick={() => {
                  if (newTag.trim() !== '' && filteredTags.length > 0) {
                    setShowTagSuggestions(true);
                  }
                }}
                style={{
                  width: '120px',
                  height: '100%',
                  fontSize: '0.75rem',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  boxShadow: '0 0 2px rgba(0, 0, 255, 0.50)',
                  outline: 'none'
                }}
                placeholder={isFetchingTags ? "Loading tags..." : "Add Tag Manually"}
                disabled={isFetchingTags}
              />
            </div>
            
            {/* Tag Suggestions Dropdown */}
            {showTagSuggestions && filteredTags.length > 0 && (
              <div 
                ref={dropdownRef}
                className="position-absolute mt-1 w-100 shadow-sm border rounded bg-white tag-dropdown"
                style={{ minWidth: '120px' }}
              >
                {filteredTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    className="btn btn-sm text-start w-100 border-0 rounded-0 py-1 px-2 tag-suggestion"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleSelectTag(tag)}
                    onKeyDown={(e) => handleDropdownKeyDown(e, index, tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          className="btn btn-sm btn-outline-secondary"
          style={{ 
            fontSize: '0.75rem', 
            padding: '2px 8px', 
            height: '28px', 
            boxShadow: 'none',
            transition: 'background-color 0.2s, border-color 0.2s, color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#007bff';
            e.currentTarget.style.borderColor = '#007bff';
            e.currentTarget.style.color = 'white';
            e.currentTarget.querySelector('i').style.color = '#ffffff'; // Bootstrap green
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.borderColor = '';
            e.currentTarget.style.color = '';
            e.currentTarget.querySelector('i').style.color = '#007bff';
          }}
          onClick={handleAddTagClick}
        >
          <i className="bi bi-tag-fill" 
             style={{ 
               fontSize: '0.75rem', 
               boxShadow: 'none',
               color: '#007bff',
               transition: 'color 0.2s'
             }}></i> Add Tag
        </button>
      )}
    </div>
  );
};

export default TagManager;