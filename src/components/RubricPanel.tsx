import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { FitRubric, RubricCriterion } from '../types';

interface RubricPanelProps {
  rubric: FitRubric;
  onUpdateRubric: (newRubric: FitRubric) => void;
  isProcessing: boolean;
}

export const RubricPanel: React.FC<RubricPanelProps> = ({
  rubric,
  onUpdateRubric,
  isProcessing,
}) => {
  const [localRubric, setLocalRubric] = useState<FitRubric>(rubric);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(10);

  useEffect(() => {
    setLocalRubric(rubric);
    setHasChanges(false);
  }, [rubric]);

  const totalWeight = localRubric.criteria.reduce(
    (acc, crit) => acc + (Number(crit.weight) || 0),
    0
  );

  const handleCriterionWeightChange = (index: number, weight: number) => {
    const updated = [...localRubric.criteria];
    updated[index] = { ...updated[index], weight: Math.max(0, Math.min(100, weight)) };
    setLocalRubric({ criteria: updated });
    setHasChanges(true);
  };

  const handleCriterionDescChange = (index: number, desc: string) => {
    const updated = [...localRubric.criteria];
    updated[index] = { ...updated[index], description: desc };
    setLocalRubric({ criteria: updated });
    setHasChanges(true);
  };

  const handleRemoveCriterion = (index: number) => {
    if (localRubric.criteria.length <= 1) return;
    const updated = localRubric.criteria.filter((_, idx) => idx !== index);
    setLocalRubric({ criteria: updated });
    setHasChanges(true);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName.trim()) return;
    const newCrit: RubricCriterion = {
      name: newCritName.trim(),
      description: newCritDesc.trim() || 'Custom evaluation criterion',
      weight: newCritWeight,
    };
    setLocalRubric({ criteria: [...localRubric.criteria, newCrit] });
    setHasChanges(true);
    setNewCritName('');
    setNewCritDesc('');
    setIsAddingCriterion(false);
  };

  const handleNormalizeWeights = () => {
    if (localRubric.criteria.length === 0) return;
    const currentSum = localRubric.criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);
    if (currentSum === 0) return;

    let updated = localRubric.criteria.map((c) => ({
      ...c,
      weight: Math.round(((Number(c.weight) || 1) / currentSum) * 100),
    }));

    const newSum = updated.reduce((s, c) => s + c.weight, 0);
    if (newSum !== 100 && updated.length > 0) {
      updated[0].weight += 100 - newSum;
    }

    setLocalRubric({ criteria: updated });
    setHasChanges(true);
  };

  const handleApplyChanges = () => {
    if (totalWeight !== 100) {
      handleNormalizeWeights();
    }
    onUpdateRubric(localRubric);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Subjective Fit Rubric</h3>
            <p className="text-xs text-slate-500">Criteria for candidate scoring (total: 100%)</p>
          </div>
        </div>

        {/* Total weight check */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              totalWeight === 100
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {totalWeight === 100 ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>100% Total</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>{totalWeight}% (Need 100%)</span>
              </>
            )}
          </div>

          {totalWeight !== 100 && (
            <button
              onClick={handleNormalizeWeights}
              type="button"
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
            >
              Auto-Balance
            </button>
          )}
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {localRubric.criteria.map((criterion, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">
                    {criterion.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-indigo-700">
                      {criterion.weight}%
                    </span>
                    {localRubric.criteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-slate-400 hover:text-rose-500 p-0.5 ml-1 transition-colors cursor-pointer"
                        title="Delete criterion"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={criterion.description}
                  onChange={(e) => handleCriterionDescChange(idx, e.target.value)}
                  className="w-full text-[11px] text-slate-500 mt-1 bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-400 focus:outline-none"
                  placeholder="Criterion expectation..."
                />
              </div>
            </div>

            {/* Weight Slider */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={criterion.weight}
                onChange={(e) =>
                  handleCriterionWeightChange(idx, parseInt(e.target.value) || 0)
                }
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        ))}

        {/* Add criterion form */}
        {isAddingCriterion ? (
          <form
            onSubmit={handleAddCriterion}
            className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40 text-xs space-y-2"
          >
            <div className="font-semibold text-indigo-900">Add New Rubric Criterion</div>
            <input
              type="text"
              value={newCritName}
              onChange={(e) => setNewCritName(e.target.value)}
              placeholder="Criterion Name (e.g. Distributed Systems Architecture)"
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="text"
              value={newCritDesc}
              onChange={(e) => setNewCritDesc(e.target.value)}
              placeholder="Description of what makes a strong candidate..."
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between">
              <label className="text-slate-600">Weight %:</label>
              <input
                type="number"
                min={1}
                max={100}
                value={newCritWeight}
                onChange={(e) => setNewCritWeight(parseInt(e.target.value) || 5)}
                className="w-20 px-2 py-1 rounded-md border border-slate-200 bg-white text-slate-800 text-xs text-right"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingCriterion(false)}
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer"
              >
                Add Criterion
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCriterion(true)}
            className="w-full py-2 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Criterion</span>
          </button>
        )}
      </div>

      {hasChanges && (
        <div className="pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={handleApplyChanges}
            disabled={isProcessing}
            className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Apply & Re-Score Candidates</span>
          </button>
        </div>
      )}
    </div>
  );
};
