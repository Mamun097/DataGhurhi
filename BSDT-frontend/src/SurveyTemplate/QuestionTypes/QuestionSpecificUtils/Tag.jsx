// src/components/Tag.js
import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import PremiumPackagesModal from "../../../ProfileManagement/PremiumFeatures/PremiumPackagesModal";
import axios from "axios";
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
          visibility: 'hidden',
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
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete tag">
      </button>
    </span>
  );
};

const TagManager = ({ questionId, questionText, questions, setQuestions, getLabel }) => {
  const [tags, setTags] = useState([]);
  const [showTagOptions, setShowTagOptions] = useState(false); // Show options menu
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [animatedTags, setAnimatedTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [allSystemTags, setAllSystemTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isFetchingTags, setIsFetchingTags] = useState(false);

  // Premium feature states
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [allValidPackages, setAllValidPackages] = useState([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionsRef = useRef(null);

  // Initialize tags from question meta
  useEffect(() => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.meta && question.meta.tags) {
      setTags(question.meta.tags);
    }
  }, [questionId, questions]);

  // Check user subscription on component mount
  useEffect(() => {
    checkUserSubscription();
  }, []);

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
      
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowTagOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check user subscription for tag generation
  const checkUserSubscription = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiClient.get("/api/get-user-packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const packages = response.data.packages;

      const packagesWithTags = packages.filter(pkg => {
        return pkg.tag && pkg.tag > 0;
      });

      const validPackages = packagesWithTags.filter(pkg => {
        const endDate = new Date(pkg.end_date);
        const today = new Date();
        return endDate > today;
      });

      setAllValidPackages(validPackages);

      const eligiblePackage = validPackages.length > 0 ?
        validPackages.reduce((prev, current) => {
          if (current.tag > prev.tag) return current;
          if (current.tag === prev.tag && new Date(current.end_date) > new Date(prev.end_date)) return current;
          return prev;
        }) : null;

      if (eligiblePackage) {
        setSubscriptionData(eligiblePackage);
        setIsEligible(true);
      } else {
        setIsEligible(false);
      }
    } catch (error) {
      setIsEligible(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Fetch all system tags from API
  const fetchAllSystemTags = async () => {
    setIsFetchingTags(true);
    try {
      const response = await apiClient.get("/api/all-tags");
      setAllSystemTags(response.data.tags || []);
    } catch (error) {
      console.error("Error fetching system tags:", error);
    } finally {
      setIsFetchingTags(false);
    }
  };

  // Handle showing the tag options menu
  const handleAddTagClick = () => {
    setShowTagOptions(!showTagOptions);
    setEditingTag(null);
  };

  // Handle manual tag addition
  const handleManualTagClick = () => {
    setShowTagOptions(false);
    setIsAddingTag(true);
    setTimeout(() => {
      if (tagInputRef.current) {
        tagInputRef.current.focus();
      }
    }, 0);
  };

  // Function to add a tag with animation
  const addTagWithAnimation = (tagToAdd) => {
    if (tags.includes(tagToAdd)) {
      return null;
    }

    setTags(prevTags => [tagToAdd, ...prevTags]);
    setAnimatedTags(prev => [...prev, tagToAdd]);

    setTimeout(() => {
      setAnimatedTags(prev => prev.filter(t => t !== tagToAdd));
    }, 600);

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

    if (!tags.includes(tagToAdd)) {
      addTagWithAnimation(tagToAdd);

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

  // Handle selection from tag dropdown
  const handleSelectTag = (selectedTag) => {
    setIsAddingTag(false);
    setNewTag("");
    setShowTagSuggestions(false);

    if (!tags.includes(selectedTag)) {
      addTagWithAnimation(selectedTag);

      setQuestions(prev =>
        prev.map(q =>
          q.id === questionId
            ? {
              ...q,
              meta: {
                ...q.meta,
                tags: [...(q.meta.tags || []), selectedTag],
              },
            }
            : q
        )
      );
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
    setIsAddingTag(false);
    setShowTagSuggestions(false);
    setShowTagOptions(false);
    setEditingTag(tagToEdit);
    setEditValue(tagToEdit);
  };

  // Confirm tag edit
  const handleConfirmTagEdit = () => {
    if (!editValue.trim() || editValue === editingTag) {
      setEditingTag(null);
      return;
    }

    const newTagValue = editValue.trim();

    if (tags.includes(newTagValue) && newTagValue !== editingTag) {
      setEditingTag(null);
      return;
    }

    setTags(prevTags =>
      prevTags.map(tag => tag === editingTag ? newTagValue : tag)
    );

    setAnimatedTags(prev => [...prev, newTagValue]);

    setTimeout(() => {
      setAnimatedTags(prev => prev.filter(t => t !== newTagValue));
    }, 600);

    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
            ...q,
            meta: {
              ...q.meta,
              tags: (q.meta.tags || []).map(tag =>
                tag === editingTag ? newTagValue : tag
              ),
            },
          }
          : q
      )
    );

    setEditingTag(null);
  };

  // Handle generate tags with LLM button click
  const handleGenerateTagsClick = () => {
    setShowTagOptions(false);
    if (!isEligible) {
      setShowUpgradeModal(true);
    } else {
      generateTagsWithLLM();
    }
  };

  // Handle generate tags with LLM
  const generateTagsWithLLM = async () => {
    setIsGeneratingTags(true);
    setShowTagSuggestions(false);
    try {
      const question = questions.find(q => q.id === questionId);
      let meta_data = {};
      if (question && question.meta) {
        meta_data = question.meta;
      }
      
      const response = await apiClient.post(`/api/generate-tags/`, {
        question_text: questionText,
        meta_data: meta_data
      });

      const generatedTags = response.data.tags;
      console.log("Generated tags:", generatedTags);

      if (generatedTags && generatedTags.length > 0) {
        const existingTagsSet = new Set(tags);
        const newTagsToAdd = generatedTags.filter(tag => !existingTagsSet.has(tag));

        console.log("New tags to add:", newTagsToAdd);

        if (newTagsToAdd.length > 0) {
          const currentMetaTags = question?.meta?.tags || [];
          const updatedTags = [...new Set([...currentMetaTags, ...newTagsToAdd])];

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

        newTagsToAdd.forEach((tag, index) => {
          setTimeout(() => {
            setTags(currentTags => {
              if (!currentTags.includes(tag)) {
                const newTags = [tag, ...currentTags];
                
                setAnimatedTags(prev => [...prev, tag]);
                
                setTimeout(() => {
                  setAnimatedTags(prev => prev.filter(t => t !== tag));
                }, 600);
                
                return newTags;
              }
              return currentTags;
            });
          }, index * 150);
        });
      }

      try {
        const tagCountResponse = await apiClient.get("/api/reduce-tag-count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        const tagCountData = tagCountResponse.data;
        
        if (tagCountData.success) {
          console.log("Tag count reduced successfully:", tagCountData);
          await checkUserSubscription();
        } else {
          console.error("Failed to reduce tag count:", tagCountData.message);
          alert(tagCountData.message || "Failed to reduce tag count.");
        }
      } catch (error) {
        console.error("Error calling tag count reduction API:", error);
        alert("An error occurred while reducing tag count.");
      }

    } catch (error) {
      console.error("Error generating tags:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.error || "Failed to generate tags");
    } finally {
      setIsGeneratingTags(false);
      setIsAddingTag(false);
    }
  };

  // Handle delete tag
  const handleDeleteTag = (tagToDelete) => {
    if (editingTag === tagToDelete) {
      setEditingTag(null);
    }

    const tagElement = document.querySelector(`[data-tag="${tagToDelete}"]`);
    if (tagElement) {
      tagElement.style.animation = 'tagFadeOut 0.3s forwards';

      setTimeout(() => {
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
      }, 300);
    } else {
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

  // Handle keyboard navigation in dropdown
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showTagSuggestions && filteredTags.length > 0) {
        handleSelectTag(filteredTags[0]);
      } else {
        handleTagSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
    } else if (e.key === 'ArrowDown' && showTagSuggestions) {
      const firstItem = dropdownRef.current?.querySelector('button');
      if (firstItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }
  };

  // Handle keyboard navigation within the dropdown items
  const handleDropdownKeyDown = (e, index, tag) => {
    if (e.key === 'Enter') {
      handleSelectTag(tag);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      tagInputRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextItem = dropdownRef.current?.querySelectorAll('button')[index + 1];
      if (nextItem) {
        nextItem.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) {
        tagInputRef.current?.focus();
      } else {
        const prevItem = dropdownRef.current?.querySelectorAll('button')[index - 1];
        if (prevItem) {
          prevItem.focus();
        }
      }
    }
  };

  // Format date for tooltip
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get tooltip content for auto generate button
  const getTooltipContent = () => {
    if (subscriptionLoading) return "Loading subscription details...";

    if (isEligible && allValidPackages.length > 0) {
      const totalTags = allValidPackages.reduce((sum, pkg) => sum + pkg.tag, 0);

      if (allValidPackages.length === 1) {
        const pkg = allValidPackages[0];
        return `${pkg.tag} Tag Auto Generation remaining.\nValid till: ${formatDate(pkg.end_date)}`;
      } else {
        let tooltip = `Total: ${totalTags} Tag Auto Generation remaining.\n\nBreakdown:\n`;
        allValidPackages
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
          .forEach((pkg, index) => {
            const packageName = pkg.package_name || `Package ${index + 1}`;
            tooltip += `• ${packageName}: ${pkg.tag} tags (expires ${formatDate(pkg.end_date)})\n`;
          });
        return tooltip.trim();
      }
    } else {
      return "Premium feature - Subscription required";
    }
  };

  // Handle upgrade modal actions
  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    setShowPremiumModal(true);
  };

  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  return (
    <>
      {/* Only render the container if there are tags, or if we're in adding/options mode */}
      {(tags.length > 0 || isAddingTag || showTagOptions || tags.length < 3) && (
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

            .tag-options-menu {
              min-width: 200px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border: 1px solid #e2e8f0;
            }

            .tag-option-item {
              padding: 10px 16px;
              font-size: 0.875rem;
              transition: all 0.2s ease;
              border: none;
              background: white;
              text-align: left;
              width: 100%;
              cursor: pointer;
              display: flex;
              align-items: center;
            }

            .tag-option-item:hover {
              background-color: #f8f9fa;
            }

            .tag-option-item svg {
              margin-right: 10px;
              flex-shrink: 0;
            }

            .tag-option-item.premium {
              color: #007bff;
            }

            .tag-option-item.premium:hover {
              background-color: #e7f1ff;
            }

            .lock-icon {
              margin-left: auto;
              flex-shrink: 0;
            }

            .tag-upgrade-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1050;
            }

            .tag-modal-backdrop-custom {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1040;
            }

            .tag-modal-content-custom {
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              max-width: 500px;
              width: 90%;
              margin: 0 auto;
              position: relative;
              z-index: 1060;
              overflow: hidden;
            }
          `}
        </style>

        {/* Display tags from right to left */}
        {tags.length > 0 && (
          <div className="tag-container d-flex flex-row-reverse">
            {tags.map((tag) => (
              <TagBadge
                key={tag}
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
        )}

        {/* Tag input section */}
        {isAddingTag && (
          <div className="position-relative me-2">
            <form onSubmit={handleTagSubmit} className="d-flex">
              <input
                ref={tagInputRef}
                type="text"
                value={newTag}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Enter tag..."
                className="form-control form-control-sm"
                style={{
                  fontSize: '0.75rem',
                  borderRadius: '16px',
                  padding: '6px 12px',
                  minWidth: '120px',
                  border: '1px solid #e2e8f0'
                }}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-sm btn-primary ms-1"
                style={{ fontSize: '0.75rem', borderRadius: '12px', padding: '6px 12px' }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleTagCancel}
                className="btn btn-sm btn-outline-secondary ms-1"
                style={{ fontSize: '0.75rem', borderRadius: '12px', padding: '6px 12px' }}
              >
                Cancel
              </button>
            </form>

            {/* Tag suggestions dropdown */}
            {showTagSuggestions && filteredTags.length > 0 && (
              <div
                ref={dropdownRef}
                className="position-absolute bg-white border rounded shadow-sm tag-dropdown"
                style={{
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  zIndex: 1050
                }}
              >
                {isFetchingTags ? (
                  <div className="p-2 text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Loading tags...
                  </div>
                ) : (
                  filteredTags.slice(0, 10).map((tag, index) => (
                    <button
                      key={tag}
                      className="btn btn-sm w-100 text-start tag-suggestion border-0 rounded-0"
                      onClick={() => handleSelectTag(tag)}
                      onKeyDown={(e) => handleDropdownKeyDown(e, index, tag)}
                      style={{ fontSize: '0.75rem', padding: '8px 12px' }}
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Add tag button - only show if less than 3 tags and not in other modes */}
        {!isAddingTag && !showTagOptions && tags.length < 3 && (
          <button
            onClick={handleAddTagClick}
            className="btn btn-sm btn-outline-primary"
            style={{
              fontSize: '0.75rem',
              borderRadius: '16px',
              padding: '6px 12px',
              transition: 'all 0.2s ease'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              className="me-1"
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Add Tag
          </button>
        )}

        {/* Tag options menu */}
        {showTagOptions && (
          <div className="position-relative" ref={optionsRef}>
            <div
              className="position-absolute bg-white rounded tag-options-menu"
              style={{
                top: '100%',
                right: 0,
                marginTop: '4px',
                zIndex: 1050
              }}
            >
              <button
                className="tag-option-item"
                onClick={handleManualTagClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                </svg>
                Add Manually
              </button>
              
              <button
                className={`tag-option-item ${isEligible ? 'premium' : ''}`}
                onClick={handleGenerateTagsClick}
                disabled={isGeneratingTags || subscriptionLoading}
              >
                {isGeneratingTags ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '14px', height: '14px' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z" />
                    </svg>
                    Generate with AI
                    {!isEligible && !subscriptionLoading && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        fill="currentColor"
                        className="lock-icon"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                      </svg>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <>
          <div className="tag-upgrade-modal">
            <div className="tag-modal-content-custom">
              <div className="modal-header p-4 border-bottom">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      fill="#007bff"
                      className="bi bi-gem"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.118a.5.5 0 0 1 .01-.644L3.1.7zm11.386 3.785-1.806-2.41-.776 2.413 2.582-.003zm-3.633.004.961-2.989H4.186l.963 2.995 5.704-.006zM5.47 5.495 8 13.366l2.532-7.876-5.062.005zm-1.371-.999-.78-2.422-1.818 2.425 2.598-.003zM1.499 5.5l5.113 6.817-2.192-6.82L1.5 5.5zm7.889 6.817 5.123-6.83-2.928.002L8.388 12.317z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">Premium Feature</h5>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUpgradeModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-3 text-muted">
                  Unlock AI-powered tag generation to automatically create relevant tags for your questions.
                </p>
                <div className="p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="#007bff"
                      className="me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z" />
                    </svg>
                    <strong className="text-primary">✨ AI-Powered Tag Generation</strong>
                  </div>
                  <small className="text-muted">
                    Intelligent tag suggestions based on question content and context
                  </small>
                </div>
              </div>
              <div className="modal-footer p-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Maybe Later
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpgradeClick}
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
          <div className="tag-modal-backdrop-custom" onClick={() => setShowUpgradeModal(false)}></div>
        </>
      )}

      {/* Premium Packages Modal */}
      {showPremiumModal && (
        <PremiumPackagesModal
          isOpen={showPremiumModal}
          onClose={handleClosePremiumModal}
          getLabel={getLabel}
        />
      )}
    </>
  );
}

export default TagManager;
// src/components/Tag.js
// import React, { useState, useRef, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import PremiumPackagesModal from "../../../ProfileManagement/PremiumFeatures/PremiumPackagesModal";
// import apiClient from "../../../api";

// const TagBadge = ({ tag, onDelete }) => (
//   <span
//     className="badge d-flex align-items-center me-1"
//     style={{
//       backgroundColor: '#f0faf0',
//       color: '#282b31ff',
//       border: '2px solid  #25856f;',
//       borderRadius: '16px',
//       padding: '6px 12px',
//       fontSize: '0.75rem',
//       fontWeight: 'normal',
//       boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//       cursor: 'default'
//     }}
//   >
//     {tag}
//     <button
//       className="btn-close ms-2"
//       style={{ fontSize: '0.5rem', opacity: 0.6, padding: '2px' }}
//       onClick={() => onDelete(tag)}
//       aria-label="Delete tag"
//     />
//   </span>
// );

// const TagManager = ({ questionId, questions, setQuestions, getLabel }) => {
//   const [tags, setTags] = useState([]);
//   const [showMenu, setShowMenu] = useState(false);
//   const [isGeneratingTags, setIsGeneratingTags] = useState(false);
//   const [showPremiumModal, setShowPremiumModal] = useState(false);
//   const [showUpgradeModal, setShowUpgradeModal] = useState(false);
//   const [isEligible, setIsEligible] = useState(false);

//   // dedicated ref for the Add Tag badge wrapper (position: relative)
//   const addTagWrapperRef = useRef(null);

//   // Initialize tags
//   useEffect(() => {
//     const question = questions.find(q => q.id === questionId);
//     if (question?.meta?.tags) setTags(question.meta.tags);
//   }, [questionId, questions]);

//   // Close popup when clicking outside or pressing Esc
//   useEffect(() => {
//     const handleOutside = (e) => {
//       if (showMenu && addTagWrapperRef.current && !addTagWrapperRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     const handleEsc = (e) => {
//       if (e.key === "Escape") setShowMenu(false);
//     };
//     document.addEventListener("mousedown", handleOutside);
//     document.addEventListener("keydown", handleEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleOutside);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, [showMenu]);

//   // Delete tag
//   const handleDeleteTag = (tagToDelete) => {
//     setTags(prev => prev.filter(t => t !== tagToDelete));
//     setQuestions(prev =>
//       prev.map(q =>
//         q.id === questionId
//           ? { ...q, meta: { ...q.meta, tags: (q.meta.tags || []).filter(t => t !== tagToDelete) } }
//           : q
//       )
//     );
//   };

//   // Add tag manually
//   const handleAddTagManually = () => {
//     const newTag = prompt("Enter new tag:");
//     if (newTag && newTag.trim()) {
//       if (!tags.includes(newTag.trim())) {
//         setTags(prev => [newTag.trim(), ...prev]);
//         setQuestions(prev =>
//           prev.map(q =>
//             q.id === questionId
//               ? { ...q, meta: { ...q.meta, tags: [...(q.meta.tags || []), newTag.trim()] } }
//               : q
//           )
//         );
//       }
//     }
//     setShowMenu(false);
//   };

//   // Auto-generate tags
//   const handleGenerateTags = async () => {
//     if (!isEligible) {
//       setShowUpgradeModal(true);
//       return;
//     }
//     setIsGeneratingTags(true);
//     try {
//       const question = questions.find(q => q.id === questionId);
//       const response = await apiClient.post(`/api/generate-tags/`, {
//         question_text: question?.text,
//         meta_data: question?.meta
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (data.tags) {
//           const newTags = data.tags.filter(tag => !tags.includes(tag));
//           setTags(prev => [...prev, ...newTags]);
//           setQuestions(prev =>
//             prev.map(q =>
//               q.id === questionId
//                 ? { ...q, meta: { ...q.meta, tags: [...(q.meta.tags || []), ...newTags] } }
//                 : q
//             )
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error generating tags", error);
//     } finally {
//       setIsGeneratingTags(false);
//       setShowMenu(false);
//     }
//   };
// const [showInput, setShowInput] = useState(false);
// const [manualTag, setManualTag] = useState("");

// const handleSaveManualTag = () => {
//   const newTag = manualTag.trim();
//   if (!newTag) return;
//   if (!tags.includes(newTag)) {
//     setTags((prev) => [newTag, ...prev]);
//     setQuestions((prev) =>
//       prev.map((q) =>
//         q.id === questionId
//           ? { ...q, meta: { ...q.meta, tags: [...(q.meta.tags || []), newTag] } }
//           : q
//       )
//     );
//   }
//   setManualTag("");
//   setShowInput(false);
//   setShowMenu(false);
// };

//   return (
//     <div className="d-flex align-items-center flex-wrap" style={{ gap: "6px" }}>
//       {/* existing tags */}
//       {tags.map(tag => (
//         <TagBadge key={tag} tag={tag} onDelete={handleDeleteTag} />
//       ))}

//       {/* Add Tag wrapper: position relative so popup is positioned against this */}
//       <div ref={addTagWrapperRef} style={{ position: "relative", display: "inline-block" }}>
//         <span
//           role="button"
//           tabIndex={0}
//           className="badge d-flex align-items-center"
//           style={{
//             backgroundColor: '#f0faf0',
//             color: '#282b31ff',
//             border: '2px solid  #25856f;',
//             borderRadius: '16px',
//             padding: '6px 12px',
//             fontSize: '0.75rem',
//             fontWeight: 'normal',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
//             cursor: 'default'
//           }}
//           onClick={() => setShowMenu(prev => !prev)}
//           onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowMenu(prev => !prev); }}
//           aria-expanded={showMenu}
//           aria-haspopup="true"
//         >
//           <i className="bi bi-plus-circle me-1" aria-hidden="true" ></i> {getLabel("Add Tag")}
//         </span>

//         {/* popup menu */}
//         {showMenu && (
//   <div
//     className="position-absolute bg-white border rounded shadow-sm p-2"
//     style={{
//       top: "calc(100% + 6px)",
//       right: 0,
//       minWidth: "200px",
//       zIndex: 1050,
//     }}
//     role="menu"
//   >
//     {/* Add Manually Section */}
//     {!showInput ? (
//       <button
//         className="dropdown-item d-flex align-items-center"
//         onClick={() => setShowInput(true)}
//         style={{
//           fontSize: "0.8rem",
//           fontWeight: 500,
//           color: "#333",
//           borderRadius: "6px",
//           transition: "background 0.2s",
//         }}
//       >
//         <i className="bi bi-pencil-square me-2 text-primary"></i>
//         {getLabel("Add Manually")}
//       </button>
//     ) : (
//       <div className="p-6 border-top">
//         <div className="input-group input-group-sm">
//           <input
//             type="text"
//             className="form-control"
//             placeholder={getLabel("Enter tag")}
//             value={manualTag}
//             onChange={(e) => setManualTag(e.target.value)}
//             autoFocus
//           />
//           <button
//             className="btn btn-primary"
//             type="button"
//             onClick={handleSaveManualTag}
//             disabled={!manualTag.trim()}
//           >
//             <i className="bi bi-check-lg"></i>
//           </button>
//           <button
//             className="btn btn-outline-secondary"
//             type="button"
//             onClick={() => {
//               setShowInput(false);
//               setManualTag("");
//             }}
//           >
//             <i className="bi bi-x-lg"></i>
//           </button>
//         </div>
//       </div>
//     )}

//     {/* Auto Generate Option */}
//     <button
//       className="dropdown-item d-flex align-items-center mt-1"
//       onClick={handleGenerateTags}
//       style={{
//         fontSize: "0.8rem",
//         color: "#333",
//         fontWeight: 500,
//         borderRadius: "6px",
//         transition: "background 0.2s",
//       }}
//       disabled={isGeneratingTags}
//     >
//       <i className="bi bi-magic me-2 text-success"></i>
//       {isGeneratingTags ? getLabel("Generating...") : getLabel("Auto Generate")}
//     </button>
//   </div>
// )}

//       </div>

//       {/* Premium & Upgrade Modals */}
//       {showPremiumModal && (
//         <PremiumPackagesModal
//           isOpen={showPremiumModal}
//           onClose={() => setShowPremiumModal(false)}
//           getLabel={getLabel}
//         />
//       )}

//       {showUpgradeModal && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
//           style={{ background: "rgba(0,0,0,0.5)", zIndex: 1060 }}
//         >
//           <div className="bg-white p-4 rounded shadow" style={{ maxWidth: "400px", width: "90%" }}>
//             <h5>Premium Feature</h5>
//             <p className="text-muted">You need a premium subscription to use auto-generate tags.</p>
//             <button
//               className="btn btn-primary me-2"
//               onClick={() => {
//                 setShowUpgradeModal(false);
//                 setShowPremiumModal(true);
//               }}
//             >
//               Upgrade
//             </button>
//             <button className="btn btn-secondary" onClick={() => setShowUpgradeModal(false)}>
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TagManager;