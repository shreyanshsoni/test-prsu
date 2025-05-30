'use client';

import { useState, useEffect, useCallback } from 'react';
import { AcademicRoadmapModel } from '../types/types';
import { fetchUserRoadmaps, createRoadmap, deleteRoadmap as apiDeleteRoadmap } from '../services/roadmapService';

// Create a singleton store for application-wide state
type StoreSubscriber = () => void;
type RoadmapStore = {
  roadmaps: AcademicRoadmapModel[];
  isLoading: boolean;
  lastUpdated: number;
  subscribers: Set<StoreSubscriber>;
  initialized: boolean;
};

// Initialize the store
const store: RoadmapStore = {
  roadmaps: [],
  isLoading: false,
  lastUpdated: 0,
  subscribers: new Set(),
  initialized: false
};

// Function to notify all subscribers of state changes
const notifySubscribers = () => {
  store.subscribers.forEach(subscriber => subscriber());
};

/**
 * Hook for accessing and managing roadmaps across components
 */
export function useRoadmapStore() {
  // Local state to force re-renders when the store updates
  const [, setUpdateTrigger] = useState(0);

  // Subscribe to store updates
  useEffect(() => {
    const updateComponent = () => {
      setUpdateTrigger(Date.now());
    };
    
    // Register this component as a subscriber
    store.subscribers.add(updateComponent);
    
    // Initialize the store if it hasn't been already
    if (!store.initialized && !store.isLoading) {
      loadRoadmaps(true);
    }
    
    // Clean up subscription when component unmounts
    return () => {
      store.subscribers.delete(updateComponent);
    };
  }, []);

  // Function to load roadmaps into the store
  const loadRoadmaps = useCallback(async (silent = false) => {
    if (store.isLoading) return;
    
    if (!silent) {
      store.isLoading = true;
      notifySubscribers();
    }
    
    try {
      const roadmaps = await fetchUserRoadmaps(true);
      store.roadmaps = roadmaps;
      store.lastUpdated = Date.now();
      store.initialized = true;
    } catch (error) {
      console.error('Error loading roadmaps into store:', error);
    } finally {
      store.isLoading = false;
      notifySubscribers();
    }
  }, []);

  // Function to create a roadmap and immediately update the store
  const createRoadmapAndUpdate = useCallback(async (name: string) => {
    try {
      const newRoadmap = await createRoadmap({ name });
      
      if (newRoadmap) {
        // Add the new roadmap to our store immediately without waiting for a server fetch
        store.roadmaps = [...store.roadmaps, newRoadmap];
        store.lastUpdated = Date.now();
        notifySubscribers();
        
        return newRoadmap;
      }
      return null;
    } catch (error) {
      console.error('Error creating roadmap:', error);
      return null;
    }
  }, []);

  // Function to delete a roadmap with instant UI updates
  const deleteRoadmapAndUpdate = useCallback(async (roadmapId: string) => {
    // First, optimistically update local state for instant UI reaction
    const previousRoadmaps = [...store.roadmaps];
    store.roadmaps = store.roadmaps.filter(roadmap => roadmap.id !== roadmapId);
    store.lastUpdated = Date.now();
    
    // Notify subscribers immediately for instant UI update
    notifySubscribers();
    
    // Then perform the actual API call in the background
    try {
      const success = await apiDeleteRoadmap(roadmapId);
      
      if (!success) {
        // If deletion failed, revert to previous state
        console.warn('Roadmap deletion failed, reverting UI');
        store.roadmaps = previousRoadmaps;
        store.lastUpdated = Date.now();
        notifySubscribers();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      
      // Revert UI on error
      store.roadmaps = previousRoadmaps;
      store.lastUpdated = Date.now();
      notifySubscribers();
      return false;
    }
  }, []);

  // Return store values and functions
  return {
    roadmaps: store.roadmaps,
    isLoading: store.isLoading,
    lastUpdated: store.lastUpdated,
    loadRoadmaps,
    createRoadmap: createRoadmapAndUpdate,
    deleteRoadmap: deleteRoadmapAndUpdate
  };
} 