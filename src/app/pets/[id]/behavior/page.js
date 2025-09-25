'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Flex, Card, Button, Box, Heading, Text, Grid, Badge, Dialog, IconButton, Tabs, Select, Switch } from '@radix-ui/themes';
import { FiEdit2, FiTrash2, FiPlus, FiBarChart, FiTarget, FiShare2, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { getTrainingProgress, addTrainingProgress, updateTrainingProgress, deleteTrainingProgress, getTrainingProgressSummary, getFilteredTrainingProgress, getTrainingProgressCharts } from '../../../../services/trainingService';

// Simple Progress Chart Component
const ProgressChart = ({ chartData, selectedSkill, dateRange }) => {
  // Show loading state
  if (!chartData) {
    return (
      <Card>
        <Flex direction="column" align="center" gap="3" p="4">
          <Text>Loading chart data...</Text>
        </Flex>
      </Card>
    );
  }

  // Extract basic metrics with safe defaults
  const totalSessions = chartData.totalSessions || 0;
  const completedSessions = chartData.completedSessions || 0;
  const successRate = chartData.successRate || 0;

  return (
    <Card>
      <Flex direction="column" gap="4" p="4">
        <Heading size="4">
          {selectedSkill ? `${selectedSkill} Progress` : 'Training Progress'}
        </Heading>
        
        {/* Simple Statistics */}
        <Grid columns="3" gap="4">
          <Card variant="surface">
            <Flex direction="column" align="center" gap="2" p="3">
              <Text size="4" weight="bold" color="blue">{totalSessions}</Text>
              <Text size="2" color="gray">Total Sessions</Text>
            </Flex>
          </Card>
          
          <Card variant="surface">
            <Flex direction="column" align="center" gap="2" p="3">
              <Text size="4" weight="bold" color="green">{completedSessions}</Text>
              <Text size="2" color="gray">Completed</Text>
            </Flex>
          </Card>
          
          <Card variant="surface">
            <Flex direction="column" align="center" gap="2" p="3">
              <Text size="4" weight="bold" color="purple">{successRate}%</Text>
              <Text size="2" color="gray">Success Rate</Text>
            </Flex>
          </Card>
        </Grid>

        {/* Simple Progress Bar */}
        {totalSessions > 0 && (
          <Box>
            <Flex justify="between" mb="2">
              <Text size="2" weight="medium">Overall Progress</Text>
              <Text size="2" color="gray">{completedSessions}/{totalSessions}</Text>
            </Flex>
            <Box style={{ 
              width: '100%', 
              height: '20px', 
              backgroundColor: 'var(--gray-3)', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <Box style={{
                width: `${(completedSessions / totalSessions) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--green-9)',
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }} />
            </Box>
          </Box>
        )}

        {/* No data message */}
        {totalSessions === 0 && (
          <Flex direction="column" align="center" gap="3" py="4">
            <FiBarChart size={32} color="var(--gray-8)" />
            <Text>No training data available for this period.</Text>
            <Text size="2" color="gray">Add some training sessions to see progress charts!</Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

// Move TrainingForm outside to prevent re-creation
const TrainingForm = ({ formData, setFormData, onSubmit, isEdit, onCancel, commonSkills }) => (
  <form onSubmit={onSubmit}>
    <Flex direction="column" gap="3">
      <label>
        <Text size="2">Skill:</Text>
        {formData.skillName === 'custom' ? (
          <input
            type="text"
            placeholder="Enter custom skill name"
            value={formData.customSkillName || ''}
            onChange={(e) => setFormData({ ...formData, customSkillName: e.target.value })}
            className="rt-TextFieldInput"
            autoFocus
          />
        ) : (
          <Select.Root 
            value={formData.skillName || undefined} 
            onValueChange={(value) => {
              if (value === 'custom') {
                setFormData({ ...formData, skillName: value, customSkillName: '' });
              } else {
                setFormData({ ...formData, skillName: value, customSkillName: undefined });
              }
            }}
          >
            <Select.Trigger placeholder="Select or type a skill" />
            <Select.Content>
              {commonSkills.map(skill => (
                <Select.Item key={skill} value={skill}>{skill}</Select.Item>
              ))}
              <Select.Separator />
              <Select.Item value="custom">Custom...</Select.Item>
            </Select.Content>
          </Select.Root>
        )}
      </label>

      <label>
        <Text size="2">Status:</Text>
        <Select.Root 
          value={formData.status || 'NotStarted'} 
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Item value="NotStarted">Not Started</Select.Item>
            <Select.Item value="InProgress">In Progress</Select.Item>
            <Select.Item value="NeedsWork">Needs Work</Select.Item>
            <Select.Item value="Completed">Completed</Select.Item>
          </Select.Content>
        </Select.Root>
      </label>

        <Grid columns="2" gap="3">
          <label>
            <Text size="2">Proficiency Level (1-10):</Text>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.proficiencyLevel}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
                  setFormData({ ...formData, proficiencyLevel: value === '' ? '' : parseInt(value) });
                }
              }}
              placeholder="1-10"
              className="rt-TextFieldInput"
            />
          </label>

          <label>
            <Text size="2">Duration:</Text>
            <Flex gap="2" align="end">
              <Box style={{ flex: 1 }}>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || parseInt(value) >= 1) {
                      setFormData({ ...formData, duration: value === '' ? '' : parseInt(value) });
                    }
                  }}
                  placeholder={formData.durationType === 'minutes' ? 'Minutes' : 'Repetitions'}
                  className="rt-TextFieldInput"
                />
              </Box>
              <Select.Root 
                value={formData.durationType} 
                onValueChange={(value) => setFormData({ ...formData, durationType: value })}
              >
                <Select.Trigger style={{ minWidth: '110px' }} />
                <Select.Content>
                  <Select.Item value="minutes">Minutes</Select.Item>
                  <Select.Item value="repetitions">Repetitions</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
          </label>
        </Grid>      <label>
        <Text size="2">Training Date:</Text>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
          className="rt-TextFieldInput"
        />
      </label>

      <label>
        <Text size="2">Goal:</Text>
        <input
          type="text"
          placeholder="e.g., Sit on command for 30 seconds"
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          className="rt-TextFieldInput"
        />
      </label>

      <label>
        <Text size="2">Notes:</Text>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Training observations, challenges, achievements..."
          className="rt-TextFieldInput"
          rows="3"
        />
      </label>

      <Flex align="center" gap="2">
        <Switch
          checked={formData.isSharedWithTrainer}
          onCheckedChange={(checked) => setFormData({ ...formData, isSharedWithTrainer: checked })}
        />
        <Text size="2">Share with trainer</Text>
      </Flex>

      <Flex gap="3" mt="4" justify="end">
        <Button type="button" variant="soft" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update' : 'Add'} Training Record
        </Button>
      </Flex>
    </Flex>
  </form>
);

export default function BehaviorPage() {
  const params = useParams();
  const petId = params.id;

  const [trainingRecords, setTrainingRecords] = useState([]);
  const [progressSummary, setProgressSummary] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('sessions');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Chart controls
  const [selectedSkillForChart, setSelectedSkillForChart] = useState('');
  const [chartDateRange, setChartDateRange] = useState('30days');

  const [filters, setFilters] = useState({
    status: '',
    skillName: '',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    skillName: '',
    customSkillName: '',
    status: 'NotStarted',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    proficiencyLevel: 1,
    duration: 30,
    durationType: 'minutes', // 'minutes' or 'repetitions'
    goal: '',
    isSharedWithTrainer: false
  });

  // Common training skills for quick selection
  const commonSkills = useMemo(() => [
    'Sit', 'Stay', 'Down', 'Come', 'Heel', 'Leave It', 'Drop It', 
    'Roll Over', 'Shake', 'Fetch', 'Potty Training', 'Leash Walking',
    'Crate Training', 'No Barking', 'Socialization'
  ], []);

  // Memoized callbacks to prevent re-renders
  const handleFormDataChange = useCallback((newData) => {
    setFormData(newData);
  }, []);

  const handleAddCancel = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  useEffect(() => {
    fetchTrainingData();
  }, [petId, filters]);

  const fetchTrainingData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch filtered training records
      const hasActiveFilters = Object.values(filters).some(f => f !== '');
      const records = hasActiveFilters 
        ? await getFilteredTrainingProgress(petId, filters)
        : await getTrainingProgress(petId);
      
      setTrainingRecords(records);

      // Fetch progress summary
      try {
        const summary = await getTrainingProgressSummary(petId);
        console.log('Progress summary data:', summary); // Debug log
        
        // Ensure summary is an array
        const summaryArray = Array.isArray(summary) ? summary : [];
        setProgressSummary(summaryArray);
      } catch (summaryErr) {
        console.warn('Failed to fetch progress summary, using fallback:', summaryErr);
        // Generate basic summary from training records
        const skillsMap = new Map();
        records.forEach(record => {
          const skillName = record.skillName || 'Unknown Skill';
          if (!skillsMap.has(skillName)) {
            skillsMap.set(skillName, {
              sessions: [],
              totalProficiency: 0,
              sessionCount: 0
            });
          }
          const skill = skillsMap.get(skillName);
          skill.sessions.push(record);
          skill.totalProficiency += (record.proficiencyLevel || 0);
          skill.sessionCount += 1;
        });
        
        const fallbackSummary = Array.from(skillsMap.entries()).map(([skillName, data]) => ({
          skillName: skillName,
          SessionCount: data.sessionCount,
          AverageProficiency: data.sessionCount > 0 ? data.totalProficiency / data.sessionCount : 0
        }));
        
        setProgressSummary(fallbackSummary);
      }
    } catch (err) {
      console.error('Error fetching training data:', err);
      setError('Failed to load training data');
      // Set empty array as fallback
      setProgressSummary([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = useCallback(async () => {
    try {
      let startDate = null;
      let endDate = null;

      // Simple date range calculation
      const now = new Date();
      switch (chartDateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case '1year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
      }

      const data = await getTrainingProgressCharts(petId, selectedSkillForChart || '', startDate, endDate);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      // Set simple fallback data
      setChartData({
        totalSessions: 0,
        completedSessions: 0,
        successRate: 0
      });
    }
  }, [petId, selectedSkillForChart, chartDateRange]);

  useEffect(() => {
    if (activeTab === 'progress') {
      fetchChartData();
    }
  }, [fetchChartData, activeTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const skillName = formData.skillName === 'custom' ? formData.customSkillName : formData.skillName;
      
      if (!skillName || skillName.trim() === '') {
        setError('Skill name is required');
        return;
      }
      
      const submitData = {
        skillName: skillName.trim(),
        description: formData.notes?.trim() || 'Training session', // Ensure description is not empty
        status: formData.status,
        proficiencyLevel: formData.proficiencyLevel,
        startDate: formData.startDate,
        duration: formData.duration || null,
        durationType: formData.durationType || 'Minutes',
        notes: formData.notes?.trim() || 'No additional notes', // Ensure notes is not empty
        trainingGoal: formData.goal?.trim() || null, // Can be null
        isSharedWithTrainer: formData.isSharedWithTrainer
      };
      await addTrainingProgress(petId, submitData);
      setIsAddDialogOpen(false);
      resetForm();
      await fetchTrainingData();
      if (activeTab === 'progress') {
        await fetchChartData();
      }
      if (activeTab === 'progress') {
        await fetchChartData();
      }
    } catch (err) {
      console.error('Error adding training record:', err);
      setError('Failed to add training record');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const skillName = formData.skillName === 'custom' ? formData.customSkillName : formData.skillName;
      
      if (!skillName || skillName.trim() === '') {
        setError('Skill name is required');
        return;
      }
      
      const submitData = {
        skillName: skillName.trim(),
        description: formData.notes?.trim() || 'Training session', // Ensure description is not empty
        status: formData.status,
        proficiencyLevel: formData.proficiencyLevel,
        startDate: formData.startDate,
        duration: formData.duration || null,
        durationType: formData.durationType || 'Minutes',
        notes: formData.notes?.trim() || 'No additional notes', // Ensure notes is not empty
        trainingGoal: formData.goal?.trim() || null, // Can be null
        isSharedWithTrainer: formData.isSharedWithTrainer
      };
      await updateTrainingProgress(petId, selectedRecord.id, submitData);
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      await fetchTrainingData();
      if (activeTab === 'progress') {
        await fetchChartData();
      }
    } catch (err) {
      console.error('Error updating training record:', err);
      setError('Failed to update training record');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrainingProgress(petId, selectedRecord.id);
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      await fetchTrainingData();
    } catch (err) {
      console.error('Error deleting training record:', err);
      setError('Failed to delete training record');
    }
  };

  const resetForm = () => {
    setFormData({
      skillName: '',
      customSkillName: '',
      status: 'NotStarted',
      notes: '',
      startDate: new Date().toISOString().split('T')[0],
      proficiencyLevel: 1,
      duration: 30,
      durationType: 'minutes',
      goal: '',
      isSharedWithTrainer: false
    });
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    const isCustomSkill = !commonSkills.includes(record.skillName);
    setFormData({
      skillName: isCustomSkill ? 'custom' : record.skillName || '',
      customSkillName: isCustomSkill ? record.skillName : '',
      status: record.status || 'NotStarted',
      notes: record.notes || '',
      startDate: record.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      proficiencyLevel: record.proficiencyLevel || 1,
      duration: 30, // Default duration since it's not stored in API
      durationType: 'minutes', // Default to minutes
      goal: record.trainingGoal || '', // Map trainingGoal back to goal
      isSharedWithTrainer: record.isSharedWithTrainer || false
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleFilterChange = (key, value) => {
    // Convert 'all' back to empty string for the API
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      skillName: '',
      startDate: '',
      endDate: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'InProgress':
        return 'blue';
      case 'NeedsWork':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'InProgress':
        return 'In Progress';
      case 'NeedsWork':
        return 'Needs Work';
      case 'NotStarted':
        return 'Not Started';
      default:
        return status;
    }
  };

  const getProficiencyColor = (level) => {
    if (level >= 8) return 'green';
    if (level >= 6) return 'blue';
    if (level >= 4) return 'yellow';
    return 'red';
  };

  return (
    <Card>
      <Flex direction="column" gap="4" p="4">
        <Flex justify="between" align="center">
          <Heading size="4">Training Progress</Heading>
          <Button size="2" onClick={() => setIsAddDialogOpen(true)}>
            <Flex gap="2" align="center">
              <FiPlus />
              Add Training Session
            </Flex>
          </Button>
        </Flex>

        {error && (
          <Text color="red">{error}</Text>
        )}

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="sessions">Training Sessions</Tabs.Trigger>
            <Tabs.Trigger value="progress">Progress Charts</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="sessions">
              {/* Filters */}
              <Card mb="4">
                <Flex direction="column" gap="3" p="3">
                  <Flex justify="between" align="center">
                    <Text weight="bold">Filters</Text>
                    <Button variant="soft" size="1" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </Flex>
                  
                  <Grid columns="4" gap="3">
                    <Select.Root value={filters.status || undefined} onValueChange={(value) => handleFilterChange('status', value || '')}>
                      <Select.Trigger placeholder="Status" />
                      <Select.Content>
                        <Select.Item value="all">All Statuses</Select.Item>
                        <Select.Item value="NotStarted">Not Started</Select.Item>
                        <Select.Item value="InProgress">In Progress</Select.Item>
                        <Select.Item value="NeedsWork">Needs Work</Select.Item>
                        <Select.Item value="Completed">Completed</Select.Item>
                      </Select.Content>
                    </Select.Root>

                    <Select.Root value={filters.skillName || undefined} onValueChange={(value) => handleFilterChange('skillName', value || '')}>
                      <Select.Trigger placeholder="Skill" />
                      <Select.Content>
                        <Select.Item value="all">All Skills</Select.Item>
                        {[...new Set(trainingRecords.map(r => r.skillName))].map(skill => (
                          <Select.Item key={skill} value={skill}>{skill}</Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>

                    <input
                      type="date"
                      placeholder="Start Date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="rt-TextFieldInput"
                    />

                    <input
                      type="date"
                      placeholder="End Date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="rt-TextFieldInput"
                    />
                  </Grid>
                </Flex>
              </Card>

              {/* Training Sessions */}
              {isLoading ? (
                <Text>Loading training records...</Text>
              ) : trainingRecords.length === 0 ? (
                <Card>
                  <Flex direction="column" align="center" gap="3" p="6">
                    <FiTarget size={48} color="var(--gray-8)" />
                    <Text>No training sessions found. Start tracking your pet's progress!</Text>
                  </Flex>
                </Card>
              ) : (
                <Grid columns="1" gap="3">
                  {trainingRecords.map((record) => (
                    <Card key={record.id}>
                      <Flex justify="between" p="3">
                        <Box>
                          <Flex gap="2" align="center" mb="2">
                            <Text weight="bold">{record.skillName}</Text>
                            <Badge color={getStatusColor(record.status)}>
                              {getStatusDisplay(record.status)}
                            </Badge>
                            {record.isSharedWithTrainer && (
                              <Badge color="purple">
                                <Flex gap="1" align="center">
                                  <FiShare2 size={12} />
                                  Shared
                                </Flex>
                              </Badge>
                            )}
                          </Flex>
                          
                          <Flex gap="4" align="center" mb="2">
                            <Text size="1" color="gray">
                              {new Date(record.startDate).toLocaleDateString()}
                            </Text>
                            <Badge color={getProficiencyColor(record.proficiencyLevel)}>
                              Level {record.proficiencyLevel}/10
                            </Badge>
                            {record.duration && (
                              <Text size="1" color="gray">
                                {record.duration} {record.durationType || 'min'}
                              </Text>
                            )}
                          </Flex>
                          
                          {record.trainingGoal && (
                            <Text size="2" mb="2">
                              <strong>Goal:</strong> {record.trainingGoal}
                            </Text>
                          )}
                          
                          {record.notes && (
                            <Text size="2">
                              {record.notes}
                            </Text>
                          )}
                        </Box>
                        
                        <Flex gap="2" align="start">
                          <IconButton variant="soft" onClick={() => handleEditClick(record)}>
                            <FiEdit2 />
                          </IconButton>
                          <IconButton
                            variant="soft"
                            color="red"
                            onClick={() => handleDeleteClick(record)}
                          >
                            <FiTrash2 />
                          </IconButton>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Grid>
              )}
            </Tabs.Content>

            <Tabs.Content value="progress">
              <Flex direction="column" gap="4">
                {/* Simple Chart Controls */}
                <Card>
                  <Flex direction="column" gap="3" p="3">
                    <Text weight="medium">Chart Filters</Text>
                    
                    <Grid columns="2" gap="3">
                      {/* Skill Selection */}
                      <Box>
                        <Text size="2" mb="1">Skill:</Text>
                        <Select.Root 
                          value={selectedSkillForChart || "all"} 
                          onValueChange={(value) => setSelectedSkillForChart(value === "all" ? "" : value)}
                        >
                          <Select.Trigger placeholder="All Skills" />
                          <Select.Content>
                            <Select.Item value="all">All Skills</Select.Item>
                            {Array.from(new Set(trainingRecords.map(r => r.skillName))).map(skill => (
                              <Select.Item key={skill} value={skill}>{skill}</Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Box>

                      {/* Date Range Selection */}
                      <Box>
                        <Text size="2" mb="1">Time Period:</Text>
                        <Select.Root 
                          value={chartDateRange} 
                          onValueChange={setChartDateRange}
                        >
                          <Select.Trigger />
                          <Select.Content>
                            <Select.Item value="7days">Last 7 Days</Select.Item>
                            <Select.Item value="30days">Last 30 Days</Select.Item>
                            <Select.Item value="90days">Last 90 Days</Select.Item>
                            <Select.Item value="1year">Last Year</Select.Item>
                          </Select.Content>
                        </Select.Root>
                      </Box>
                    </Grid>
                  </Flex>
                </Card>

                {/* Progress Chart */}
                <ProgressChart 
                  chartData={chartData} 
                  selectedSkill={selectedSkillForChart} 
                  dateRange={chartDateRange}
                />

                {/* Skills Summary */}
                {progressSummary.length > 0 && (
                  <Card>
                    <Flex direction="column" gap="3" p="3">
                      <Text weight="medium">All Skills Summary</Text>
                      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="3">
                        {progressSummary.map((skill, index) => {
                          // Handle different possible property names and ensure we have valid numbers
                          const skillName = skill.SkillName || skill.skillName || skill.name || 'Unknown Skill';
                          const sessionCount = skill.SessionCount || skill.sessionCount || skill.sessions || 0;
                          const avgProficiency = skill.AverageProficiency || skill.averageProficiency || skill.proficiency || 0;
                          
                          // Ensure avgProficiency is a valid number
                          const proficiencyLevel = isNaN(avgProficiency) ? 0 : Number(avgProficiency);
                          const displayProficiency = Math.round(Math.max(0, Math.min(10, proficiencyLevel)));
                          
                          return (
                            <Card key={index} variant="surface">
                              <Flex direction="column" gap="2" p="3">
                                <Text size="2" weight="medium" style={{ minHeight: '20px' }}>
                                  {skillName}
                                </Text>
                                
                                <Flex justify="between" align="center">
                                  <Text size="1" color="gray">{sessionCount} sessions</Text>
                                  <Badge color="blue">{displayProficiency}/10</Badge>
                                </Flex>

                                <Box style={{ 
                                  width: '100%', 
                                  height: '6px', 
                                  backgroundColor: 'var(--gray-3)', 
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <Box style={{
                                    width: `${Math.min((displayProficiency / 10) * 100, 100)}%`,
                                    height: '100%',
                                    backgroundColor: 'var(--blue-9)'
                                  }} />
                                </Box>
                              </Flex>
                            </Card>
                          );
                        })}
                      </Grid>
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        {/* Add Training Dialog */}
        <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <Dialog.Content style={{ maxWidth: '500px' }}>
            <Dialog.Title>Add Training Session</Dialog.Title>
            <TrainingForm 
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={handleAdd}
              isEdit={false}
              onCancel={handleAddCancel}
              commonSkills={commonSkills}
            />
          </Dialog.Content>
        </Dialog.Root>

        {/* Edit Training Dialog */}
        <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <Dialog.Content style={{ maxWidth: '500px' }}>
            <Dialog.Title>Edit Training Session</Dialog.Title>
            <TrainingForm 
              formData={formData}
              setFormData={handleFormDataChange}
              onSubmit={handleEdit}
              isEdit={true}
              onCancel={handleEditCancel}
              commonSkills={commonSkills}
            />
          </Dialog.Content>
        </Dialog.Root>

        {/* Delete Confirmation Dialog */}
        <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <Dialog.Content>
            <Dialog.Title>Delete Training Session</Dialog.Title>
            <Dialog.Description size="2" mb="4">
              Are you sure you want to delete this training session? This action cannot be undone.
            </Dialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button variant="soft">Cancel</Button>
              </Dialog.Close>
              <Button color="red" onClick={handleDelete}>
                Delete
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Card>
  );
}