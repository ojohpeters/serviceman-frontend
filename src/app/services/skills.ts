// ============================================
// Skills Service
// Handles all skill-related API operations
// ============================================

import api from './api';
import {
  Skill,
  CreateSkillData,
  UpdateSkillData,
  ServicemanSkillsResponse,
  AddSkillsData,
  RemoveSkillsData,
  SkillsOperationResponse,
  SkillCategory
} from '../types/api';

export const skillsService = {
  /**
   * List all skills
   * @param category - Optional filter by skill category
   */
  getSkills: async (category?: SkillCategory): Promise<Skill[]> => {
    const url = category ? `/users/skills/?category=${category}` : '/users/skills/';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get skill details by ID
   * @param skillId - The skill ID
   */
  getSkillById: async (skillId: number): Promise<Skill> => {
    const response = await api.get(`/users/skills/${skillId}/`);
    return response.data;
  },

  /**
   * Create new skill (Admin only)
   * @param skillData - Skill data
   */
  createSkill: async (skillData: CreateSkillData): Promise<Skill> => {
    const response = await api.post('/users/skills/create/', skillData);
    return response.data;
  },

  /**
   * Update existing skill (Admin only)
   * @param skillId - The skill ID
   * @param skillData - Updated skill data
   */
  updateSkill: async (skillId: number, skillData: UpdateSkillData): Promise<Skill> => {
    const response = await api.patch(`/users/skills/${skillId}/update/`, skillData);
    return response.data;
  },

  /**
   * Delete skill (Admin only - soft delete)
   * @param skillId - The skill ID
   */
  deleteSkill: async (skillId: number): Promise<void> => {
    await api.delete(`/users/skills/${skillId}/delete/`);
  },

  /**
   * Get serviceman's skills
   * @param servicemanId - The serviceman user ID
   */
  getServicemanSkills: async (servicemanId: number): Promise<ServicemanSkillsResponse> => {
    const response = await api.get(`/users/servicemen/${servicemanId}/skills/`);
    return response.data;
  },

  /**
   * Add skills to serviceman
   * @param servicemanId - The serviceman user ID
   * @param skillIds - Array of skill IDs to add
   */
  addSkillsToServiceman: async (
    servicemanId: number,
    skillIds: number[]
  ): Promise<SkillsOperationResponse> => {
    const response = await api.post(`/users/servicemen/${servicemanId}/skills/`, {
      skill_ids: skillIds
    });
    return response.data;
  },

  /**
   * Remove skills from serviceman
   * @param servicemanId - The serviceman user ID
   * @param skillIds - Array of skill IDs to remove
   */
  removeSkillsFromServiceman: async (
    servicemanId: number,
    skillIds: number[]
  ): Promise<SkillsOperationResponse> => {
    const response = await api.delete(`/users/servicemen/${servicemanId}/skills/`, {
      data: { skill_ids: skillIds }
    });
    return response.data;
  },
};

export default skillsService;

