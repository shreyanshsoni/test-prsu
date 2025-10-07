import React, { useState } from 'react';
import { BookOpen, Award, Plus, X, Copy, Check, Save } from 'lucide-react';
import { StudentData } from '../../../types/student';
import { useTheme } from '../../../../../contexts/ThemeContext';

interface WhatIveDoneProps {
  data: Partial<StudentData>;
  onUpdate: (data: Partial<StudentData>) => void;
}

export const WhatIveDone: React.FC<WhatIveDoneProps> = ({ data, onUpdate }) => {
  const { theme } = useTheme();
  const [newTest, setNewTest] = useState({ type: '', score: '', date: '' });
  const [newClass, setNewClass] = useState({ type: '', subject: '', score: '' });
  const [newAward, setNewAward] = useState('');
  const [testErrors, setTestErrors] = useState<{ typeMissing: boolean; scoreMissing: boolean }>({ typeMissing: false, scoreMissing: false });
  const [testGeneralError, setTestGeneralError] = useState<string>('');
  const [classErrors, setClassErrors] = useState<{ typeMissing: boolean; subjectMissing: boolean }>({ typeMissing: false, subjectMissing: false });
  const [classGeneralError, setClassGeneralError] = useState<string>('');
  const [awardMissing, setAwardMissing] = useState<boolean>(false);
  const [awardGeneralError, setAwardGeneralError] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState({
    tests: false,
    classes: false,
    awards: false
  });

  const addTest = () => {
    const missingType = !newTest.type;
    const missingScore = !newTest.score;
    if (missingType || missingScore) {
      setTestErrors({ typeMissing: missingType, scoreMissing: missingScore });
      setTestGeneralError('Fill all required fields to continue');
      return;
    }
    setTestErrors({ typeMissing: false, scoreMissing: false });
    setTestGeneralError('');
    onUpdate({
      standardizedTests: [...(data.standardizedTests || []), newTest]
    });
    setNewTest({ type: '', score: '', date: '' });
  };

  const removeTest = (index: number) => {
    const tests = [...(data.standardizedTests || [])];
    tests.splice(index, 1);
    onUpdate({ standardizedTests: tests });
  };

  const addClass = () => {
    const missingType = !newClass.type;
    const missingSubject = !newClass.subject;
    if (missingType || missingSubject) {
      setClassErrors({ typeMissing: missingType, subjectMissing: missingSubject });
      setClassGeneralError('Fill all required fields to continue');
      return;
    }
    setClassErrors({ typeMissing: false, subjectMissing: false });
    setClassGeneralError('');
    onUpdate({
      advancedClasses: [...(data.advancedClasses || []), newClass]
    });
    setNewClass({ type: '', subject: '', score: '' });
  };

  const removeClass = (index: number) => {
    const classes = [...(data.advancedClasses || [])];
    classes.splice(index, 1);
    onUpdate({ advancedClasses: classes });
  };

  const addAward = () => {
    const value = newAward.trim();
    if (!value) {
      setAwardMissing(true);
      setAwardGeneralError('Fill all required fields to continue');
      return;
    }
    setAwardMissing(false);
    setAwardGeneralError('');
    onUpdate({
      academicAwards: [...(data.academicAwards || []), value]
    });
    setNewAward('');
  };

  const removeAward = (index: number) => {
    const awards = [...(data.academicAwards || [])];
    awards.splice(index, 1);
    onUpdate({ academicAwards: awards });
  };

  const copyToClipboard = (section: 'tests' | 'classes' | 'awards') => {
    let textToCopy = '';
    
    if (section === 'tests' && data.standardizedTests) {
      textToCopy = data.standardizedTests.map(test => 
        `${test.type}: ${test.score}${test.date ? ` (${test.date})` : ''}`
      ).join('\n');
    } else if (section === 'classes' && data.advancedClasses) {
      textToCopy = data.advancedClasses.map(cls => 
        `${cls.type} ${cls.subject}${cls.score ? ` (Score: ${cls.score})` : ''}`
      ).join('\n');
    } else if (section === 'awards' && data.academicAwards) {
      textToCopy = data.academicAwards.join('\n');
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopyStatus({ ...copyStatus, [section]: true });
        
        setTimeout(() => {
          setCopyStatus({ ...copyStatus, [section]: false });
        }, 2000);
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">What I've Done 📚</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Share your academic achievements and test scores</p>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 text-left">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            <strong>Your academic wins matter!</strong> Whether it's a test score you're proud of, 
            a challenging class you conquered, or recognition you received - these show your dedication 
            and growth. Don't be modest - this is your time to shine! ✨
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Standardized Tests */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📊 Standardized Tests</h3>
            <button 
              onClick={() => copyToClipboard('tests')}
              className="p-1.5 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy test scores"
            >
              {copyStatus.tests ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Include any tests you've taken - SAT, ACT, PSAT, AP exams, or others. 
            Even if you plan to retake them, your current scores show your progress!
          </p>
          
          {/* Existing Tests */}
          {data.standardizedTests?.map((test, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2">
              <div>
                <span className="font-medium dark:text-white">{test.type}</span>
                <span className="text-gray-600 dark:text-gray-300 ml-2">Score: {test.score}</span>
                {test.date && <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">({test.date})</span>}
              </div>
              <button
                onClick={() => removeTest(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Test */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={newTest.type}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewTest({ ...newTest, type: value });
                  if (value) {
                    const next = { ...testErrors, typeMissing: false };
                    setTestErrors(next);
                    if (!next.typeMissing && !next.scoreMissing) setTestGeneralError('');
                  }
                }}
                className={`p-2 border ${testErrors.typeMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
              >
                <option value="">Select Test</option>
                <option value="SAT">SAT</option>
                <option value="ACT">ACT</option>
                <option value="PSAT">PSAT</option>
                <option value="AP">AP Exam</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Score"
                value={newTest.score}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewTest({ ...newTest, score: value });
                  if (value) {
                    const next = { ...testErrors, scoreMissing: false };
                    setTestErrors(next);
                    if (!next.typeMissing && !next.scoreMissing) setTestGeneralError('');
                  }
                }}
                className={`p-2 border ${testErrors.scoreMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
              />
              <input
                type="text"
                placeholder="Date (optional)"
                value={newTest.date}
                onChange={(e) => setNewTest({ ...newTest, date: e.target.value })}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              />
            </div>
            {testGeneralError && (
              <p className="text-red-600 text-sm mt-2">{testGeneralError}</p>
            )}
          <button
            onClick={addTest}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-2 text-white" />
            Save
          </button>
          </div>
        </div>

        {/* Advanced Classes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">🎓 Advanced Classes</h3>
            <button 
              onClick={() => copyToClipboard('classes')}
              className="p-1.5 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy class information"
            >
              {copyStatus.classes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            AP, IB, Dual Enrollment, Honors - any challenging courses you've taken show your 
            willingness to push yourself. Include classes you're currently taking too!
          </p>
          
          {/* Existing Classes */}
          {data.advancedClasses?.map((cls, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2">
              <div>
                <span className="font-medium dark:text-white">{cls.type} {cls.subject}</span>
                {cls.score && <span className="text-gray-600 dark:text-gray-300 ml-2">Score: {cls.score}</span>}
              </div>
              <button
                onClick={() => removeClass(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Class */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <select
                value={newClass.type}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewClass({ ...newClass, type: value });
                  if (value) {
                    const next = { ...classErrors, typeMissing: false };
                    setClassErrors(next);
                    if (!next.typeMissing && !next.subjectMissing) setClassGeneralError('');
                  }
                }}
                className={`p-2 border ${classErrors.typeMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
              >
                <option value="">Class Type</option>
                <option value="AP">AP</option>
                <option value="IB">IB</option>
                <option value="Dual Enrollment">Dual Enrollment</option>
                <option value="Honors">Honors</option>
              </select>
              <input
                type="text"
                placeholder="Subject"
                value={newClass.subject}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewClass({ ...newClass, subject: value });
                  if (value) {
                    const next = { ...classErrors, subjectMissing: false };
                    setClassErrors(next);
                    if (!next.typeMissing && !next.subjectMissing) setClassGeneralError('');
                  }
                }}
                className={`p-2 border ${classErrors.subjectMissing ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-400'} bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2`}
              />
              <input
                type="text"
                placeholder="Score (optional)"
                value={newClass.score}
                onChange={(e) => setNewClass({ ...newClass, score: e.target.value })}
                className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
              />
            </div>
            {classGeneralError && (
              <p className="text-red-600 text-sm mt-2">{classGeneralError}</p>
            )}
            <button
              onClick={addClass}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4 mr-2 text-white" />
              Save
            </button>
          </div>
        </div>

        {/* Academic Awards */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            <Award className="inline w-5 h-5 mr-2" />
            Academic Awards & Recognition
          </h3>
            <button 
              onClick={() => copyToClipboard('awards')}
              className="p-1.5 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy awards"
            >
              {copyStatus.awards ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Honor roll, perfect attendance, subject awards, academic competitions - 
            any recognition counts! These show consistency and excellence in your studies.
          </p>
          
          {/* Existing Awards */}
          {data.academicAwards?.map((award, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2">
              <span className="font-medium dark:text-white">{award}</span>
              <button
                onClick={() => removeAward(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add New Award */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., Honor Roll, Math Competition Winner, Perfect Attendance"
                value={newAward}
                onChange={(e) => setNewAward(e.target.value)}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                onKeyPress={(e) => e.key === 'Enter' && addAward()}
              />
              <button
                onClick={addAward}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <Save className="w-4 h-4 mr-2 text-white" />
                Save
              </button>
            </div>
            {awardGeneralError && (
              <p className="text-red-600 text-sm mt-2">{awardGeneralError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};