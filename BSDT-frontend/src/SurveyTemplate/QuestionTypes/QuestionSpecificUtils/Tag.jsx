// src/components/Tag.js
import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import PremiumPackagesModal from "../../../ProfileManagement/PremiumFeatures/PremiumPackagesModal";
import axios from "axios";

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

const TagManager = ({ questionId, questionText, questions, setQuestions, getLabel }) => {
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

  // Premium feature states
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [allValidPackages, setAllValidPackages] = useState([]); // Store all valid packages
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);

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
      //console.log("Fetching user packages for tag generation..."); // Debug log

      const response = await axios.get("http://localhost:2000/api/get-user-packages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const packages = response.data.packages;
      //console.log("All packages:", packages); // Debug log

      // Find packages that have tag generation capability
      // Filter packages that have the 'tag' column > 0 (regardless of question count)
      const packagesWithTags = packages.filter(pkg => {
        //console.log(`Package: ${JSON.stringify(pkg)}`); // Debug each package
        return pkg.tag && pkg.tag > 0; // Has remaining tags
      });

      //console.log("Packages with tags:", packagesWithTags); // Debug log

      // Filter valid (non-expired) packages
      const validPackages = packagesWithTags.filter(pkg => {
        const endDate = new Date(pkg.end_date);
        const today = new Date();
        //console.log(`Package ID: ${pkg.subscription_id}, Tag count: ${pkg.tag}, End date: ${endDate}, Today: ${today}, Valid: ${endDate > today}`); // Debug log
        return endDate > today;
      });

      //console.log("Valid packages with tags:", validPackages); // Debug log

      // Store all valid packages for tooltip display
      setAllValidPackages(validPackages);

      // Get the package with the most tags or the latest end_date
      const eligiblePackage = validPackages.length > 0 ?
        validPackages.reduce((prev, current) => {
          // Prefer package with more tags, or if equal, the one with later end_date
          if (current.tag > prev.tag) return current;
          if (current.tag === prev.tag && new Date(current.end_date) > new Date(prev.end_date)) return current;
          return prev;
        }) : null;

      //console.log("Selected eligible package for tags:", eligiblePackage); // Debug log

      if (eligiblePackage) {
        setSubscriptionData(eligiblePackage);
        setIsEligible(true);
        //console.log("User is eligible for tag generation"); // Debug log
      } else {
        setIsEligible(false);
        //console.log("User is not eligible for tag generation"); // Debug log

        // Additional debugging
        if (packagesWithTags.length > 0) {
          //console.log("Packages with tags exist but all expired");
        } else {
          //console.log("No packages with remaining tags found");
        }
      }
    } catch (error) {
      //console.error("Error fetching user packages for tags:", error);
      //console.error("Error details:", error.response?.data); // More detailed error logging
      setIsEligible(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Fetch all system tags from API
  const fetchAllSystemTags = async () => {
    setIsFetchingTags(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:2000/api/all-tags');
      if (response.ok) {
        const data = await response.json();
        setAllSystemTags(data.tags || []);
      }
    } catch (error) {
      //console.error("Error fetching system tags:", error);
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

  // Handle selection from tag dropdown
  const handleSelectTag = (selectedTag) => {
    setIsAddingTag(false);
    setNewTag("");
    setShowTagSuggestions(false);

    // Add tag with animation, only if it doesn't already exist
    if (!tags.includes(selectedTag)) {
      addTagWithAnimation(selectedTag);

      // Save tag to question meta
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

    // Exit edit mode
    setEditingTag(null);
  };

  // Handle generate tags with LLM button click
  const handleGenerateTagsClick = () => {
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

        // Wait for tag count reduction to complete before refreshing subscription
        try {
          const tagCountResponse = await fetch("http://localhost:2000/api/reduce-tag-count", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });

          if (!tagCountResponse.ok) {
            throw new Error(`HTTP error! status: ${tagCountResponse.status}`);
          }

          const tagCountData = await tagCountResponse.json();
          
          if (tagCountData.success) {
            //console.log("Tag count reduced successfully:", tagCountData);
            
            // Now refresh subscription data after successful tag count reduction
            await checkUserSubscription();
            
          } else {
            //console.error("Failed to reduce tag count:", tagCountData.message);
            alert(tagCountData.message || "Failed to reduce tag count.");
          }
        } catch (error) {
          //console.error("Error calling tag count reduction API:", error);
          alert("An error occurred while reducing tag count.");
        }

        // Add a timeout to simulate delay
        setTimeout(() => {
          //console.log("Tags generated successfully:", data.tags);
        }, 1000);

      }
    } catch (error) {
      //console.error("Error generating tags:", error);
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
        // Multiple packages - show detailed breakdown
        let tooltip = `Total: ${totalTags} Tag Auto Generation remaining.\n\nBreakdown:\n`;
        allValidPackages
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date)) // Sort by end date (latest first)
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

            /* Premium button styles */
            .tag-autogen-btn.eligible {
              background-color: #007bff;
              border-color: #007bff;
              color: white;
            }

            .tag-autogen-btn.eligible:hover:not(:disabled) {
              background-color: #1d8b37;
              border-color: #007bff;
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
            }

            .tag-autogen-btn.not-eligible {
              background-color: #6c757d;
              border-color: #6c757d;
              color: white;
            }

            .tag-autogen-btn.not-eligible:hover:not(:disabled) {
              background-color: #6c757d;
              border-color: #6c757d;
              color: white;
              transform: translateY(-1px);
              box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
            }

            .lock-icon {
              margin-left: 4px;
              flex-shrink: 0;
            }

            /* Enhanced tooltip styles */
            .tag-autogen-btn[title]:hover::after {
              content: attr(title);
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 500;
              white-space: pre-line;
              z-index: 1000;
              margin-bottom: 8px;
              min-width: 250px;
              max-width: 350px;
              text-align: left;
              line-height: 1.4;
              box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.1);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .tag-autogen-btn[title]:hover::before {
              content: '';
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 6px solid transparent;
              border-top-color: #2c3e50;
              margin-bottom: 2px;
              z-index: 1000;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            }

            .tag-autogen-btn.eligible[title]:hover::after {
              background: linear-gradient(135deg, #0056b3 0%, #007bff 100%);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .tag-autogen-btn.eligible[title]:hover::before {
              border-top-color: #0056b3;
            }

            /* Modal styles */
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

          {/* 2. Add the premium auto-generate button after the existing tag input section */}
          {/* Auto-generate tags button */}
          <button
            className={`btn btn-sm ms-2 d-flex align-items-center tag-autogen-btn ${isEligible ? 'eligible' : 'not-eligible'}`}
            onClick={handleGenerateTagsClick}
            disabled={isGeneratingTags || subscriptionLoading}
            title={getTooltipContent()}
            style={{
              fontSize: '0.75rem',
              padding: '6px 12px',
              borderRadius: '16px',
              transition: 'all 0.2s ease',
              position: 'relative',
              fontWeight: '500',
              border: '1px solid',
              cursor: subscriptionLoading ? 'wait' : 'pointer'
            }}
          >
            {isGeneratingTags ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ width: '12px', height: '12px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                Generating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  className="me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z" />
                </svg>
                {subscriptionLoading ? 'Loading...' : 'Auto Generate'}
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

          {/* 3. Add the upgrade modal after the main tag display section */}
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
                          fill="#6c757d"
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
                      You've reached your limit for AI-powered tag generation. Upgrade your plan to continue using this premium feature.
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
                          <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                          <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                        </svg>
                        <strong className="text-primary">✨ AI-Powered Tag Generation</strong>
                      </div>
                      <small className="text-muted">
                        Let our AI automatically generate relevant tags for your survey questions based on content analysis
                      </small>
                    </div>
                  </div>
                  <div className="modal-footer p-4 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setShowUpgradeModal(false)}
                    >
                      Maybe Later
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleUpgradeClick}
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
              <div className="tag-modal-backdrop-custom" onClick={() => setShowUpgradeModal(false)}></div>
            </>
          )}

          {/* 4. Add the Premium Packages Modal */}
          {showPremiumModal && (
            <PremiumPackagesModal
              isOpen={showPremiumModal}
              onClose={handleClosePremiumModal}
              getLabel={getLabel}
            />
          )}

          {/* 5. Complete the closing tags and add the dropdown section */}
        </div>

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
                style={{ fontSize: '0.75rem', borderRadius: '12px' }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleTagCancel}
                className="btn btn-sm btn-outline-secondary ms-1"
                style={{ fontSize: '0.75rem', borderRadius: '12px' }}
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

        {/* Add tag button */}
        {!isAddingTag && (
          <button
            onClick={handleAddTagClick}
            className="btn btn-sm btn-outline-primary me-2"
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
      </div>

    </>
  );
}

export default TagManager;