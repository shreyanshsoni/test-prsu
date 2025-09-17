'use client'; // Mark this as a Client Component

import React, { useState, useEffect } from 'react';
import { Program, ChecklistItem } from '../types/types';
import { AlertCircle, PlusCircle, Calendar, List, X, FileText, Mail, Trash } from 'lucide-react';
import { getStatusIcon } from '../lib/utils/iconUtils';
import { useTheme } from '../app/contexts/ThemeContext';
import toast from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';
import Tooltip from './ui/Tooltip';

interface ApplicationChecklistProps {
  programs: Program[];
  checklist: ChecklistItem[];
  onUpdateStatus: (itemId: string, status: ChecklistItem['status']) => void;
  onAddChecklist?: (item: Omit<ChecklistItem, 'id'>) => void;
}

export default function ApplicationChecklist({ 
  programs, 
  checklist, 
  onUpdateStatus,
  onAddChecklist 
}: ApplicationChecklistProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programTitle, setProgramTitle] = useState('');
  const [organization, setOrganization] = useState('');
  
  // New state for managing multiple checklist items
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [standardRequirements, setStandardRequirements] = useState<Array<{
    title: string;
    deadline: string;
  }>>([{ title: '', deadline: '' }]);
  const [programSpecificRequirements, setProgramSpecificRequirements] = useState<Array<{
    title: string;
    deadline: string;
  }>>([{ title: '', deadline: '' }]);
  
  // Add a new state for custom programs added via the modal
  const [customPrograms, setCustomPrograms] = useState<Program[]>([]);
  const [customChecklist, setCustomChecklist] = useState<ChecklistItem[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(true);

  // State for confirmation modal
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  
  // Fetch custom checklists from API
  useEffect(() => {
    const fetchCustomChecklists = async () => {
      try {
        setIsLoadingCustom(true);
        const response = await fetch('/api/user-checklists');
        if (!response.ok) {
          console.error('Failed to fetch custom checklists:', response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log('Fetched custom checklists:', data);
        
        if (data.programs && Array.isArray(data.programs)) {
          // Convert API format to our local format
          const apiPrograms = data.programs.map((p: any) => ({
            id: p.id,
            title: p.title,
            organization: p.organization,
            description: '',
            deadline: '',
            location: '',
            type: 'custom', // Mark as custom type
            imageUrl: '',
            eligibility: '',
          }));
          
          const apiItems = data.programs.flatMap((p: any) => 
            (p.items || []).map((item: any) => ({
              id: item.id,
              title: item.title,
              status: item.status,
              deadline: item.deadline || '',
              programId: item.program_id,
              type: item.type,
            }))
          );
          
          setCustomPrograms(apiPrograms);
          setCustomChecklist(apiItems);
        }
      } catch (error) {
        console.error('Error fetching custom checklists:', error);
      } finally {
        setIsLoadingCustom(false);
      }
    };
    
    fetchCustomChecklists();
  }, []);
  
  // Common checklist templates
  const standardTemplates = [
    'Submit Official Transcript',
    'Request Letters of Recommendation',
    'Complete Application Form',
    'Submit Financial Aid Application',
    'Send Test Scores'
  ];
  
  const programSpecificTemplates = [
    'Complete Application Essay',
    'Prepare Portfolio',
    'Schedule Interview',
    'Complete Program-Specific Assessment',
    'Submit Research Proposal'
  ];
  
  const getDaysUntilDeadline = (deadline: string) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    const days = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Combine saved programs and custom programs, and their checklist items
  const allPrograms = [...programs, ...customPrograms];
  const allChecklist = [...checklist, ...customChecklist];
  
  // Group checklist items by program
  const programGroups = allPrograms.map(program => ({
    program,
    items: allChecklist.filter(item => item.programId === program.id)
  }));
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setProgramTitle('');
    setOrganization('');
    setStandardRequirements([{ title: '', deadline: '' }]);
    setProgramSpecificRequirements([{ title: '', deadline: '' }]);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'programId') {
      const program = programs.find(p => p.id === value);
      setSelectedProgram(program || null);
    }
  };
  
  const handleTemplateSelect = (template: string, type: 'standard' | 'program_specific', index: number) => {
    if (type === 'standard') {
      const updatedRequirements = [...standardRequirements];
      updatedRequirements[index].title = template;
      setStandardRequirements(updatedRequirements);
    } else {
      const updatedRequirements = [...programSpecificRequirements];
      updatedRequirements[index].title = template;
      setProgramSpecificRequirements(updatedRequirements);
    }
  };
  
  const handleRequirementChange = (
    type: 'standard' | 'program_specific', 
    index: number, 
    field: 'title' | 'deadline', 
    value: string
  ) => {
    if (type === 'standard') {
      const updatedRequirements = [...standardRequirements];
      updatedRequirements[index][field] = value;
      setStandardRequirements(updatedRequirements);
    } else {
      const updatedRequirements = [...programSpecificRequirements];
      updatedRequirements[index][field] = value;
      setProgramSpecificRequirements(updatedRequirements);
    }
  };
  
  const addRequirement = (type: 'standard' | 'program_specific') => {
    if (type === 'standard') {
      setStandardRequirements([...standardRequirements, { title: '', deadline: '' }]);
    } else {
      setProgramSpecificRequirements([...programSpecificRequirements, { title: '', deadline: '' }]);
    }
  };
  
  const removeRequirement = (type: 'standard' | 'program_specific', index: number) => {
    if (type === 'standard' && standardRequirements.length > 1) {
      const updatedRequirements = [...standardRequirements];
      updatedRequirements.splice(index, 1);
      setStandardRequirements(updatedRequirements);
    } else if (type === 'program_specific' && programSpecificRequirements.length > 1) {
      const updatedRequirements = [...programSpecificRequirements];
      updatedRequirements.splice(index, 1);
      setProgramSpecificRequirements(updatedRequirements);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (programTitle.trim() === '' || organization.trim() === '') {
      // Show error or validation message
      toast.error("Program title and organization are required");
      return;
    }
    
    // Collect all valid requirements
    const validStandardRequirements = standardRequirements.filter(req => req.title.trim() !== '');
    const validProgramSpecificRequirements = programSpecificRequirements.filter(req => req.title.trim() !== '');
    
    if (validStandardRequirements.length === 0 && validProgramSpecificRequirements.length === 0) {
      toast.error("Add at least one requirement");
      return;
    }
    
    // Prepare API request format
    const items = [
      ...validStandardRequirements.map(req => ({
        title: req.title,
        status: 'not_started',
        deadline: req.deadline,
        type: 'standard'
      })),
      ...validProgramSpecificRequirements.map(req => ({
        title: req.title,
        status: 'not_started',
        deadline: req.deadline,
        type: 'program_specific'
      }))
    ];
    
    try {
      console.log("Saving custom checklist:", { title: programTitle, organization, items });
      
      // Send to API
      const response = await fetch('/api/user-checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: programTitle,
          organization,
          items
        }),
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Failed to save checklist: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API success result:", result);
      
      // Refetch to get updated list
      const refreshResponse = await fetch('/api/user-checklists');
      const refreshData = await refreshResponse.json();
      console.log("Refreshed checklist data:", refreshData);
      
      if (refreshData.programs && Array.isArray(refreshData.programs)) {
        // Convert API format to our local format
        const apiPrograms = refreshData.programs.map((p: any) => ({
          id: p.id,
          title: p.title,
          organization: p.organization,
          description: '',
          deadline: '',
          location: '',
          type: 'custom',
          imageUrl: '',
          eligibility: '',
        }));
        
        const apiItems = refreshData.programs.flatMap((p: any) => 
          (p.items || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            deadline: item.deadline || '',
            programId: item.program_id,
            type: item.type,
          }))
        );
        
        console.log("Setting custom programs:", apiPrograms);
        console.log("Setting custom checklist items:", apiItems);
        
        setCustomPrograms(apiPrograms);
        setCustomChecklist(apiItems);
      }
      
      toast.success('Checklist saved!', {
        position: 'bottom-right',
        duration: 3000,
      });
      
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving checklist:", error);
      toast.error(error.message || 'Error saving checklist');
    }
  };

  const handleRequestDeleteCustomProgram = (programId: string) => {
    setProgramToDelete(programId);
  };

  const handleConfirmDeleteCustomProgram = async () => {
    if (programToDelete) {
      try {
        const response = await fetch('/api/user-checklists', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            programId: programToDelete
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete checklist');
        }
        
        // Update local state to remove the deleted program and its items
        setCustomPrograms(prev => prev.filter(p => p.id !== programToDelete));
        setCustomChecklist(prev => prev.filter(item => item.programId !== programToDelete));
        
        toast.success('Checklist deleted!', {
          position: 'bottom-right',
          duration: 3000,
        });
      } catch (error: any) {
        console.error('Error deleting checklist:', error);
        toast.error(error.message || 'Failed to delete checklist');
      }
    }
    setProgramToDelete(null);
  };

  const handleCancelDeleteCustomProgram = () => {
    setProgramToDelete(null);
  };

  if (isLoadingCustom) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <section className="h-full overflow-hidden flex flex-col">
      {/* Header with title and Add Checklist button */}
      <header className="p-4 border-b border-light-border dark:border-dark-border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">My Checklists</h1>
            <Tooltip content="Stay organized with auto-generated and custom checklists." />
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-sm"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Checklist</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 bg-light-card dark:bg-dark-card">
        {allPrograms.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-medium text-light-text dark:text-dark-text mb-2">No Programs Saved</h2>
            <p className="text-light-muted dark:text-dark-muted">You can create custom checklists by clicking the "Add Checklist" button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programGroups.map(({ program, items }) => (
              <section key={program.id} className="border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card rounded-lg shadow dark:shadow-dark-border/30 p-6 relative">
                <header className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-light-text dark:text-dark-text">
                    {program?.title || "No Title Available"}
                  </h2>
                  <p className="text-light-muted dark:text-dark-muted">
                    {program?.organization || "Unknown Organization"}
                  </p>
                  {/* Show delete button only for custom programs */}
                  {customPrograms.some(p => p.id === program.id) && (
                    <button
                      type="button"
                      title="Delete this checklist"
                      onClick={() => handleRequestDeleteCustomProgram(program.id)}
                      className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full p-2 text-light-muted dark:text-dark-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-light-border/60 dark:hover:bg-dark-border/60 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  )}
                </header>

                <div className="space-y-6">
                  {/* Standard Requirements */}
                  <div>
                    <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Standard Requirements</h3>
                    <ul className="space-y-3">
                      {items
                        .filter((item) => item.type === 'standard')
                        .map((item) => (
                          <li key={item.id}>
                            <div className="flex items-center justify-between p-3 border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    const nextStatusMap: Record<ChecklistItem['status'], ChecklistItem['status']> = {
                                      not_started: 'in_progress',
                                      in_progress: 'completed',
                                      completed: 'not_started',
                                    };
                                    const nextStatus = nextStatusMap[item.status];
                                    onUpdateStatus(item.id, nextStatus);
                                  }}
                                  aria-label={`Update status of ${item.title}`}
                                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded-full"
                                >
                                  {getStatusIcon(item.status)}
                                </button>
                                <span className="text-light-text dark:text-dark-text">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                  <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                    {getDaysUntilDeadline(item.deadline)} days left
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Program-Specific Requirements */}
                  <div>
                    <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Program-Specific Requirements</h3>
                    <ul className="space-y-3">
                      {items
                        .filter((item) => item.type === 'program_specific')
                        .map((item) => {
                          const statusIcon = getStatusIcon(item.status);
                          return (
                            <li key={item.id}>
                              <div className="flex items-center justify-between p-3 border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => {
                                      const nextStatusMap: Record<ChecklistItem['status'], ChecklistItem['status']> = {
                                        not_started: 'in_progress',
                                        in_progress: 'completed',
                                        completed: 'not_started',
                                      };
                                      const nextStatus = nextStatusMap[item.status];
                                      onUpdateStatus(item.id, nextStatus);
                                    }}
                                    aria-label={`Update status of ${item.title}`}
                                    className="focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 rounded-full"
                                  >
                                    {statusIcon}
                                  </button>
                                  <span className="text-light-text dark:text-dark-text">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.deadline && getDaysUntilDeadline(item.deadline) <= 7 && (
                                    <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-sm">
                                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                                      {getDaysUntilDeadline(item.deadline)} days left
                                    </div>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}

                      {items.filter((item) => item.type === 'program_specific').length === 0 && (
                        <li className="text-light-muted dark:text-dark-muted text-sm italic">
                          No program-specific requirements found
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Application Progress Section */}
                  <div>
                    <h3 className="font-medium mb-4 text-light-text dark:text-dark-text">Application Progress</h3>
                    <div className="border border-light-border dark:border-dark-border bg-gray-100/80 dark:bg-gray-800/80 rounded-lg p-4">
                      {items.length > 0 ? (
                        <div>
                          <div className="h-2 w-full bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-500"
                              style={{ 
                                width: `${Math.round((items.filter(item => item.status === 'completed').length / items.length) * 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2 text-sm text-light-muted dark:text-dark-muted">
                            <span>
                              {items.filter(item => item.status === 'completed').length} of {items.length} completed
                            </span>
                            <span>
                              {Math.round((items.filter(item => item.status === 'completed').length / items.length) * 100)}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-light-muted dark:text-dark-muted text-sm italic">
                          No checklist items available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Checklist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-xl max-w-3xl w-full">
            <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text">Add Checklist Items</h3>
              <button 
                onClick={handleCloseModal} 
                className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Program Title and Organization Inputs */}
              <div className="mb-6 border-b border-light-border dark:border-dark-border pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="programTitle" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Program Title
                    </label>
                    <input
                      type="text"
                      id="programTitle"
                      value={programTitle}
                      onChange={e => setProgramTitle(e.target.value)}
                      placeholder="e.g. Summer Research Program"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      id="organization"
                      value={organization}
                      onChange={e => setOrganization(e.target.value)}
                      placeholder="e.g. Harvard University"
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Standard Requirements Section */}
              <div className="border border-light-border dark:border-dark-border rounded-lg p-4">
                <h4 className="font-medium mb-4 text-light-text dark:text-dark-text flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                  Standard Requirements
                </h4>
                {standardRequirements.map((req, index) => (
                  <div key={`standard-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mb-4 items-end">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`standard-title-${index}`} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id={`standard-title-${index}`}
                          value={req.title}
                          onChange={(e) => handleRequirementChange('standard', index, 'title', e.target.value)}
                          placeholder="e.g. Submit Official Transcript"
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      </div>
                      <div>
                        <label htmlFor={`standard-deadline-${index}`} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                          Deadline (optional)
                        </label>
                        <input
                          type="date"
                          id={`standard-deadline-${index}`}
                          value={req.deadline}
                          onChange={(e) => handleRequirementChange('standard', index, 'deadline', e.target.value)}
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      </div>
                    </div>
                    {standardRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement('standard', index)}
                        title="Remove this requirement"
                        className={`inline-flex items-center justify-center rounded-full p-2 transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-light-muted dark:text-dark-muted hover:text-primary-500 dark:hover:text-primary-400 hover:bg-light-border/60 dark:hover:bg-dark-border/60 transform hover:scale-110`}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => addRequirement('standard')}
                    className="flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md hover:bg-light-border/50 dark:hover:bg-dark-border/50"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Add Standard Requirement
                  </button>
                </div>
              </div>
              
              {/* Program-Specific Requirements Section */}
              <div className="border border-light-border dark:border-dark-border rounded-lg p-4 mt-6">
                <h4 className="font-medium mb-4 text-light-text dark:text-dark-text flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                  Program-Specific Requirements
                </h4>
                {programSpecificRequirements.map((req, index) => (
                  <div key={`program-specific-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 mb-4 items-end">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor={`program-specific-title-${index}`} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          id={`program-specific-title-${index}`}
                          value={req.title}
                          onChange={(e) => handleRequirementChange('program_specific', index, 'title', e.target.value)}
                          placeholder="e.g. Submit Research Proposal"
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      </div>
                      <div>
                        <label htmlFor={`program-specific-deadline-${index}`} className="block text-sm font-medium text-light-text dark:text-dark-text mb-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                          Deadline (optional)
                        </label>
                        <input
                          type="date"
                          id={`program-specific-deadline-${index}`}
                          value={req.deadline}
                          onChange={(e) => handleRequirementChange('program_specific', index, 'deadline', e.target.value)}
                          className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
                        />
                      </div>
                    </div>
                    {programSpecificRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement('program_specific', index)}
                        title="Remove this requirement"
                        className={`inline-flex items-center justify-center rounded-full p-2 transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-light-muted dark:text-dark-muted hover:text-primary-500 dark:hover:text-primary-400 hover:bg-light-border/60 dark:hover:bg-dark-border/60 transform hover:scale-110`}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => addRequirement('program_specific')}
                    className="flex items-center px-4 py-2 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text rounded-md hover:bg-light-border/50 dark:hover:bg-dark-border/50"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 text-primary-500 dark:text-primary-400" />
                    Add Program-Specific Requirement
                  </button>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-light-border dark:border-dark-border mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border transition-colors border border-light-border dark:border-dark-border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors rounded-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for deleting custom checklist */}
      <ConfirmationModal
        isOpen={!!programToDelete}
        title="Delete Checklist?"
        message="Are you sure you want to delete this checklist and all its requirements? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteCustomProgram}
        onCancel={handleCancelDeleteCustomProgram}
        isDanger
      />
    </section>
  );
}
