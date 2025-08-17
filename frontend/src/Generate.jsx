import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './axios';
import './Generate.css';

const Generate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    travelling: '',
    healthGoals: '',
    additionalRemarks: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedConversation, setGeneratedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [timeDifferences, setTimeDifferences] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const parseConversationData = (conversationText) => {
    const lines = conversationText.split('\n').filter(line => line.trim() && line.includes('|'));
    const parsedMessages = [];
    
    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length >= 7) {
        const [timestamp, sender, role, message, type, category] = parts;
        
        const messageObj = {
          id: index + 1,
          timestamp: new Date(timestamp.trim()),
          sender: sender.trim(),
          role: role.trim(),
          message: message.trim(),
          type: type.trim(),
          category: category.trim()
        };
        
        parsedMessages.push(messageObj);
      }
    });
    
    return parsedMessages;
  };

  const calculateTimeDifferences = (messages) => {
    const differences = {};
    
    for (let i = 1; i < messages.length; i++) {
      const currentTime = messages[i].timestamp;
      const previousTime = messages[i - 1].timestamp;
      const diffMs = currentTime - previousTime;
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeDifference;
      
      if (diffDays > 0) {
        timeDifference = `${diffDays} day${diffDays > 1 ? 's' : ''} later`;
      } else if (diffHours > 0) {
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes > 0) {
          timeDifference = `${diffHours}h ${remainingMinutes}m later`;
        } else {
          timeDifference = `${diffHours} hour${diffHours > 1 ? 's' : ''} later`;
        }
      } else if (diffMinutes > 0) {
        timeDifference = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} later`;
      } else {
        timeDifference = 'Just now';
      }
      
      differences[messages[i].id] = timeDifference;
    }
    
    return differences;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      query: '#8B5CF6',
      response: '#06B6D4', 
      update: '#10B981',
      intervention: '#F59E0B',
      report: '#EF4444'
    };
    return colors[type] || '#6B7280';
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#3B82F6',
      nutrition: '#10B981',
      autonomic: '#8B5CF6',
      structural: '#F59E0B',
      sleep: '#06B6D4',
      stress: '#EF4444'
    };
    return colors[category] || '#6B7280';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.age || !formData.gender || !formData.occupation || !formData.healthGoals) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `You are an AI expert in simulating realistic, long-term human-computer interactions for a premium health service called Elyx. Your task is to generate an 8-month series of conversations between a new client, defined by the profile below, and the Elyx team.

INSTRUCTIONS

Generate Month 1 first. Wait for the user's command before proceeding to the next month.

Strictly Adhere to the Client Profile. All interactions must be personalized and relevant to this individual.

Follow the Chat Format Exactly. Every single message must conform to this structure without deviation:
[TIMESTAMP]|[SENDER_NAME]|[ROLE]|[MESSAGE_CONTENT]|[MESSAGE_TYPE]|[PILLAR]|[HAS_ATTACHMENT]|[ATTACHMENT_TYPE]

Embody the Narrative Arc. The client's tone must evolve from skeptical and formal in Month 1 to trusting and conversational by Month 8.

Ensure Realism. Incorporate realistic delays, follow-ups, missed adherence (~50%), and context-specific adjustments for the client's monthly travel schedule.

Meet Interaction Volume. Generate 100-150 messages per month, following a fluctuating weekly pattern (e.g., Week 1: 25, Week 2: 30, Week 3: 20, Week 4: 40).

Use LaTeX for all mathematical and scientific notations, enclosed in $ or $$.

CLIENT PROFILE (from form data)

Name: ${formData.name}

Age: ${formData.age}

Gender: ${formData.gender}

Occupation: ${formData.occupation}

Location & Travel: ${formData.locationAndTravel}

Health Goals: ${formData.healthGoals}

Challenges: ${formData.challenges}

Current Tech: ${formData.tech}

Time Commitment: ${formData.commitment}

Adherence Level: ${formData.adherence}

Health Conditions: ${formData.healthConditions}

ELYX TEAM PERSONAS

Ruby (Concierge): Empathetic, organized, proactive. Primary point of contact.

Dr. Warren (Medical): Authoritative, precise, clear explainer.

Advik (Performance Scientist): Analytical, data-driven, curious. Focuses on wearables and metrics.

Carla (Nutritionist): Practical, educational, habit-focused.

Rachel (PT): Direct, encouraging, function-focused.

Neel (Relationship Manager): Strategic, reassuring, handles big-picture concerns and escalations.

8-MONTH TIMELINE & NARRATIVE STRUCTURE

Month 1 (Start Date: January 2025): Onboarding & Discovery.

Focus: Initial consultations, history gathering, baseline diagnostics (blood panel, autonomic testing), first simple interventions.

Client Tone: Formal, skeptical, testing the system's responsiveness.

Key Events: Schedule initial tests. The client asks pointed questions about the process. A new health finding is discovered in Week 4.

Month 2: Results & First Plan.

Focus: Reviewing baseline results, explaining findings, and co-creating the initial 6-week health plan.

Client Tone: Warmer, more thoughtful and engaged, starting to see the value.

Months 3-8: Implementation, Refinement & Travel.

Focus: Ongoing execution of the plan, problem-solving for travel, quarterly re-testing (Month 4, Month 7), and refining interventions based on progress and data.

Client Tone: Conversational, trusting, professional partnership.

Key Events: At least one week of travel per month requiring plan adjustments. Quarterly reviews with Dr. Warren and the team.`;

      const response = await api.post('/api/generate', {
        prompt: prompt
      });

      const conversationText = response.data.response;
      setGeneratedConversation(conversationText);
      
      // Parse and display the conversation
      const parsedMessages = parseConversationData(conversationText);
      const timeDiffs = calculateTimeDifferences(parsedMessages);
      
      setMessages(parsedMessages);
      setTimeDifferences(timeDiffs);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        occupation: '',
        travelling: '',
        healthGoals: '',
        additionalRemarks: ''
      });

    } catch (error) {
      console.error('Error generating conversation:', error);
      setError(error.response?.data?.error || 'Failed to generate conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setGeneratedConversation(null);
    setMessages([]);
    setTimeDifferences({});
    setError('');
  };

  if (generatedConversation && messages.length > 0) {
    return (
      <div className="conversation-container">
        <div className="conversation-header">
          <button 
            className="back-button"
            onClick={handleGenerateNew}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Generate New
          </button>
          <div className="header-content">
            <div className="header-info">
              <h1>Generated Healthcare Timeline</h1>
              <p>Personalized conversation for {formData.name || 'your profile'}</p>
            </div>
            <div className="team-avatars">
              <div className="avatar" title="Ruby - Concierge">R</div>
              <div className="avatar" title="Dr. Warren - Medical">W</div>
              <div className="avatar" title="Advik - Lifestyle">A</div>
              <div className="avatar" title="Carla - Nutrition">C</div>
              <div className="avatar" title="Rachel - PT">Ra</div>
              <div className="avatar" title="Neel - Lead">N</div>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => {
            const isCustomer = message.role === 'Client';
            
            return (
              <div key={message.id}>
                {timeDifferences[message.id] && (
                  <div className="time-gap">
                    <span>{timeDifferences[message.id]}</span>
                  </div>
                )}
                
                <div className={`message-bubble ${isCustomer ? 'customer' : 'team'}`}>
                  <div className="message-header">
                    <div className="header-row">
                      <div className="sender-info">
                        <span className="sender-name">{message.sender}</span>
                        <span className="sender-role">{message.role}</span>
                      </div>
                      <span className="message-time">
                        {formatTime(message.timestamp)} • {formatDate(message.timestamp)}
                      </span>
                    </div>
                    
                    <div className={isCustomer ? "customer-message-tags" : "message-tags"}>
                      <span 
                        className="message-type-tag"
                        style={{ backgroundColor: getMessageTypeColor(message.type) }}
                      >
                        {message.type}
                      </span>
                      <span 
                        className="message-category-tag"
                        style={{ backgroundColor: getCategoryColor(message.category) }}
                      >
                        {message.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="message-content">
                    {message.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="generate-container">
      <div className="generate-header">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>
      </div>

      <div className="generate-content">
        <form onSubmit={handleSubmit} className="generate-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="18"
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="occupation">Occupation *</label>
              <input
                type="text"
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer, Doctor, Teacher"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="travelling">Travel Frequency</label>
              <select
                id="travelling"
                name="travelling"
                value={formData.travelling}
                onChange={handleInputChange}
              >
                <option value="">Select frequency</option>
                <option value="Never">Never</option>
                <option value="Rarely (1-2 times per year)">Rarely (1-2 times per year)</option>
                <option value="Occasionally (3-5 times per year)">Occasionally (3-5 times per year)</option>
                <option value="Frequently (6-10 times per year)">Frequently (6-10 times per year)</option>
                <option value="Very frequently (10+ times per year)">Very frequently (10+ times per year)</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="healthGoals">Health Goals *</label>
              <textarea
                id="healthGoals"
                name="healthGoals"
                value={formData.healthGoals}
                onChange={handleInputChange}
                placeholder="Describe your health and wellness goals"
                rows="3"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="additionalRemarks">Additional Remarks</label>
              <textarea
                id="additionalRemarks"
                name="additionalRemarks"
                value={formData.additionalRemarks}
                onChange={handleInputChange}
                placeholder="Any additional information"
                rows="2"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="generate-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating Timeline...
                </>
              ) : (
                'Generate Healthcare Timeline'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Generate;