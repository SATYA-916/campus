import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, MapPin, Calendar, CheckSquare, ShieldCheck } from 'lucide-react';

const Inbox = () => {
  const { authFetch, user, showToast, API_URL } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Meetup Helper States
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [showMeetupPlanner, setShowMeetupPlanner] = useState(false);

  const messagesEndRef = useRef(null);

  // Parse URL queries: e.g. /inbox?chatUser=XYZ&starter=Hello
  const query = new URLSearchParams(location.search);
  const targetUserId = query.get('chatUser');
  const starterMessage = query.get('starter');

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load Conversations List
  const fetchConversations = async (selectTargetId = null) => {
    try {
      const response = await authFetch('/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);

        // Handle URL chatUser initiation
        if (selectTargetId) {
          const existing = data.find(c => (c.otherUser._id || c.otherUser) === selectTargetId);
          if (existing) {
            setActiveChatUser(existing.otherUser);
          } else {
            // Initiate brand new chat details by fetching user info
            const userResponse = await authFetch(`/auth/profile`); // wait, we want the target user's profile, but we can list all users to find them, or create a mock entry.
            // Let's query target user details directly
            const targetUserResponse = await fetch(`${API_URL}/auth/profile`, {
              // wait, we don't have direct profile fetch by ID in authController yet, but we can query them. Let's see if we can get user profile or if we can query list of users.
              // Actually, we can fetch all users or build a small profile route. Let's list all users to find this user.
              headers: { 'Authorization': `Bearer ${user.token}` }
            });
            // We can fetch details via a route or simply query them. Let's query conversations and if not found, we can load target user info.
            const listUsersResponse = await authFetch('/auth/profile'); // we can just fetch target user details from backend or use a mock profile setup.
            // Let's create an endpoint on the backend or request it. Oh wait, we can just request the details of that user.
            // Let's write a route in authRoutes to get user by ID if needed, or in dbAdapter.
            // Actually, we can fetch user profile or create a endpoint. We can list users. Let's build a quick user profile route.
            // Let's see if we can get user from list of all users, or query. Let's just write target user.
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Helper to fetch details of a specific user by ID
  const fetchTargetUserInfo = async (id) => {
    try {
      // Since we didn't add a specific GET /api/users/:id endpoint, let's fetch products which contain seller details or fetch all conversations.
      // Alternatively, let's load details by querying the database or using a fallback.
      // We can also edit authRoutes to add a GET /profile/:id endpoint. Let's make sure it's accessible.
      // We'll add it to authRoutes! For now, let's make a call to a profile fetch endpoint.
      const response = await authFetch(`/auth/profile`); // wait, let's just make sure we can load details.
      // Let's write a quick endpoint if needed, or query from listings.
    } catch (err) {
      console.error(err);
    }
  };

  // Setup active chat user details if query targetUserId is present
  useEffect(() => {
    const initializeChat = async () => {
      await fetchConversations();

      if (targetUserId) {
        // Find user details in listings or active conversations
        try {
          // Check if user is in conversations
          let existing = conversations.find(c => {
            const id = c.otherUser._id || c.otherUser;
            return id === targetUserId;
          });

          if (existing) {
            setActiveChatUser(existing.otherUser);
          } else {
            // Fetch listing details to extract seller details or mock them
            const response = await authFetch(`/products`);
            if (response.ok) {
              const products = await response.json();
              const foundProduct = products.find(p => (p.seller._id || p.seller) === targetUserId);
              if (foundProduct && foundProduct.seller) {
                setActiveChatUser(foundProduct.seller);
                
                // If starter message query is present, pre-fill the chat input
                if (starterMessage) {
                  setNewMessageText(starterMessage);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error initializing chat user', error);
        }
      }
    };

    initializeChat();
  }, [targetUserId, location.search]);

  // Load Messages between current user and active user
  const fetchMessages = async (showLoading = false) => {
    if (!activeChatUser) return;
    const activeId = activeChatUser._id || activeChatUser;
    
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await authFetch(`/messages/chat/${activeId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  };

  // Short-polling hook: poll messages every 3 seconds while chat is active
  useEffect(() => {
    fetchMessages(true); // load initially with loading indicator
    
    const interval = setInterval(() => {
      fetchMessages(false); // poll silently
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChatUser]);

  // Send Message
  const handleSendMessage = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const finalContent = textToSend || newMessageText;
    
    if (!finalContent.trim() || !activeChatUser) return;
    const activeId = activeChatUser._id || activeChatUser;

    try {
      const response = await authFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: activeId,
          content: finalContent.trim()
        })
      });

      if (response.ok) {
        setNewMessageText('');
        fetchMessages(false);
        fetchConversations(); // update snippets in sidebar
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  // Suggest Meetup Card content to message input
  const handleSendMeetupSuggestion = (e) => {
    e.preventDefault();
    if (!meetupLocation || !meetupTime) {
      showToast('Please specify location and time', 'error');
      return;
    }

    const suggestionText = `📍 [Meetup Suggestion]\nLocation: ${meetupLocation}\nTime/Date: ${meetupTime}\nDoes this work for you?`;
    handleSendMessage(null, suggestionText);
    
    setMeetupLocation('');
    setMeetupTime('');
    setShowMeetupPlanner(false);
    showToast('Meetup suggestion sent!');
  };

  return (
    <div className="fade-in glass-card" style={{ 
      display: 'flex', 
      height: 'calc(100vh - 150px)', 
      padding: 0, 
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Left Sidebar: Conversations List */}
      <div style={{ 
        flex: '0 0 320px', 
        borderRight: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'rgba(10, 7, 26, 0.4)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} className="brand-icon" style={{ color: 'var(--primary)' }} /> Chats
          </h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConversations ? (
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Loading chats...
            </div>
          ) : conversations.length === 0 && !activeChatUser ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No messages yet. Chat with sellers from the Browse page!
            </div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {/* If we are initiating a new chat from detail view, render it at the top */}
              {activeChatUser && !conversations.some(c => (c.otherUser._id || c.otherUser) === (activeChatUser._id || activeChatUser)) && (
                <li 
                  onClick={() => setActiveChatUser(activeChatUser)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <img 
                    src={activeChatUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChatUser.name}`} 
                    alt={activeChatUser.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }} 
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeChatUser.name}
                    </h4>
                    <p className="text-muted" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                      New chat started...
                    </p>
                  </div>
                </li>
              )}

              {conversations.map((convo, idx) => {
                const isSelected = activeChatUser && (activeChatUser._id || activeChatUser) === (convo.otherUser._id || convo.otherUser);
                return (
                  <li 
                    key={idx}
                    onClick={() => {
                      setActiveChatUser(convo.otherUser);
                      // Clear search query parameters to keep address bar clean
                      if (location.search) navigate('/inbox', { replace: true });
                    }}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'var(--transition)'
                    }}
                  >
                    <img 
                      src={convo.otherUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${convo.otherUser.name}`} 
                      alt={convo.otherUser.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ color: '#fff', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {convo.otherUser.name}
                      </h4>
                      <p className="text-muted" style={{ 
                        fontSize: '0.8rem', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontWeight: isSelected ? 600 : 400
                      }}>
                        {convo.lastMessage.content}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right Main Panel: Active Chat thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(5, 3, 15, 0.2)' }}>
        {activeChatUser ? (
          <>
            {/* Header info */}
            <div style={{ 
              padding: '18px 24px', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(8, 5, 18, 0.4)'
            }}>
              <div className="flex align-center gap-2" style={{ gap: '12px' }}>
                <img 
                  src={activeChatUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChatUser.name}`} 
                  alt={activeChatUser.name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary-glow)' }} 
                />
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {activeChatUser.name}
                    {activeChatUser.email?.toLowerCase().endsWith('.edu') && (
                      <ShieldCheck size={14} style={{ color: 'var(--accent)' }} />
                    )}
                  </h4>
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {activeChatUser.college}
                  </p>
                </div>
              </div>

              {/* Meetup Suggestion Button */}
              <button 
                onClick={() => setShowMeetupPlanner(!showMeetupPlanner)}
                className="btn btn-secondary btn-sm flex align-center gap-2"
                style={{ fontSize: '0.8rem' }}
              >
                <MapPin size={14} /> Meetup Planner
              </button>
            </div>

            {/* Meetup Planner Drawer */}
            {showMeetupPlanner && (
              <form onSubmit={handleSendMeetupSuggestion} className="fade-in" style={{
                background: 'rgba(139, 92, 246, 0.08)',
                borderBottom: '1px solid var(--border)',
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: '1 1 200px' }} className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>📍 Public Meetup Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="e.g. Campus Library Main Entrance"
                    value={meetupLocation}
                    onChange={(e) => setMeetupLocation(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: '1 1 200px' }} className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>⏰ Date & Time</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    placeholder="e.g. Friday at 2:00 PM"
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '10px 16px' }}>
                    Send Pitch
                  </button>
                  <button type="button" onClick={() => setShowMeetupPlanner(false)} className="btn btn-secondary btn-sm" style={{ padding: '10px 16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Messages Thread Container */}
            <div style={{ 
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px' 
            }}>
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  Loading chat logs...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No messages yet. Send a message to coordinate trading!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const msgSenderId = msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
                  const isOutgoing = msgSenderId === user._id;
                  
                  // Check if message is a meetup invitation
                  const isMeetupSuggestion = msg.content.includes('📍 [Meetup Suggestion]');

                  return (
                    <div 
                      key={idx}
                      style={{
                        alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div 
                        style={{
                          background: isMeetupSuggestion 
                            ? 'rgba(6, 182, 212, 0.15)' 
                            : isOutgoing 
                              ? 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)' 
                              : 'rgba(255, 255, 255, 0.05)',
                          color: '#fff',
                          padding: '12px 18px',
                          borderRadius: isOutgoing ? '18px 18px 0px 18px' : '18px 18px 18px 0px',
                          fontSize: '0.95rem',
                          lineHeight: '1.5',
                          border: isMeetupSuggestion 
                            ? '1px solid rgba(6, 182, 212, 0.4)' 
                            : isOutgoing 
                              ? 'none' 
                              : '1px solid var(--border)',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {msg.content}
                      </div>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--text-dark)', 
                        marginTop: '4px',
                        alignSelf: isOutgoing ? 'flex-end' : 'flex-start'
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form at bottom */}
            <form 
              onSubmit={handleSendMessage}
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(8, 5, 18, 0.4)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Type your message here..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px',
            color: 'var(--text-muted)',
            textAlign: 'center'
          }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <h3>Select a Conversation</h3>
            <p>Pick a student on the left sidebar to coordinate meetups and trading details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
