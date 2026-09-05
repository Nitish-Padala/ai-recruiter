import React, { useState, useEffect } from 'react';
import { Filter, X, Plus, MapPin, Briefcase, Award, Building, RefreshCw } from 'lucide-react';
import { SearchFilters } from '../types';

interface FiltersPanelProps {
  filters: SearchFilters;
  onUpdateFilters: (newFilters: SearchFilters) => void;
  isProcessing: boolean;
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onUpdateFilters,
  isProcessing,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
    setHasChanges(false);
  }, [filters]);

  const handleFieldChange = (field: keyof SearchFilters, value: any) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    setHasChanges(true);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skill = newSkillInput.trim();
    if (!skill) return;
    if (!localFilters.skills.map((s) => s.toLowerCase()).includes(skill.toLowerCase())) {
      const updated = {
        ...localFilters,
        skills: [...localFilters.skills, skill],
      };
      setLocalFilters(updated);
      setHasChanges(true);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = {
      ...localFilters,
      skills: localFilters.skills.filter((s) => s !== skillToRemove),
    };
    setLocalFilters(updated);
    setHasChanges(true);
  };

  const handleCompanyTypeToggle = (type: string) => {
    const currentTypes = localFilters.companyTypes || [];
    const exists = currentTypes.map((t) => t.toLowerCase()).includes(type.toLowerCase());
    const updatedTypes = exists
      ? currentTypes.filter((t) => t.toLowerCase() !== type.toLowerCase())
      : [...currentTypes, type];
    handleFieldChange('companyTypes', updatedTypes);
  };

  const handleApplyChanges = () => {
    onUpdateFilters(localFilters);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Objective Filters</h3>
            <p className="text-xs text-slate-500">Deterministic local filtering</p>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={handleApplyChanges}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Apply</span>
          </button>
        )}
      </div>

      <div className="space-y-4 text-xs flex-1">
        {/* Experience Range */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
            <Award className="w-3.5 h-3.5 text-slate-500" />
            <span>Experience (Years)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 text-[10px] block mb-0.5">Minimum</span>
              <input
                type="number"
                min={0}
                max={30}
                value={localFilters.minYearsExperience}
                onChange={(e) =>
                  handleFieldChange('minYearsExperience', parseInt(e.target.value) || 0)
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block mb-0.5">Maximum</span>
              <input
                type="number"
                min={localFilters.minYearsExperience}
                max={40}
                value={localFilters.maxYearsExperience}
                onChange={(e) =>
                  handleFieldChange('maxYearsExperience', parseInt(e.target.value) || 99)
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Location</span>
          </label>
          <input
            type="text"
            value={localFilters.location || ''}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            placeholder="e.g. Bangalore, Remote, Pune"
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Company Types */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Company Background</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {['startup', 'enterprise', 'product'].map((type) => {
              const active = (localFilters.companyTypes || [])
                .map((t) => t.toLowerCase())
                .includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleCompanyTypeToggle(type)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Required Skills ({localFilters.skills.length})</span>
          </label>

          {/* Skill tags */}
          <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-1 bg-slate-50/70 rounded-lg border border-slate-100">
            {localFilters.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs shadow-2xs"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <form onSubmit={handleAddSkill} className="flex gap-1.5">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add skill (e.g. AWS RDS)"
              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
            />
            <button
              type="submit"
              disabled={!newSkillInput.trim()}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {hasChanges && (
        <div className="pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={handleApplyChanges}
            disabled={isProcessing}
            className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Apply & Re-Score Candidates</span>
          </button>
        </div>
      )}
    </div>
  );
};
