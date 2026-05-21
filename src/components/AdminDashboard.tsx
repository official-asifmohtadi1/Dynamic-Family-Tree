import React, { useState } from 'react';
import type { Member, Relationship, TimelineEvent, GalleryItem } from '../types';
import { validateRelationship } from '../utils/validation';
import { UserPlus, Save, Trash2, Link, Heart, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import type { ToastType } from './Toast';

interface AdminDashboardProps {
  members: Member[];
  relationships: Relationship[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onAddRelationship: (relation: Relationship) => void;
  onDeleteRelationship: (id: string) => void;
  showToast: (message: string, type: ToastType) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  members,
  relationships,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onAddRelationship,
  onDeleteRelationship,
  showToast,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [dod, setDod] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Relationship creation states
  const [newRelationType, setNewRelationType] = useState<'Spouse' | 'Parent-Child'>('Spouse');
  const [relatedMemberId, setRelatedMemberId] = useState('');

  // Filtering members based on search query
  const filteredMembers = members.filter((m) =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMember = members.find((m) => m.id === selectedMemberId) || null;

  // Set form values when selecting a member
  const handleSelectMember = (member: Member) => {
    setSelectedMemberId(member.id);
    setIsCreatingNew(false);
    setIsEditing(true);

    setFirstName(member.firstName);
    setLastName(member.lastName);
    setGender(member.gender);
    setDob(member.dob || '');
    setDod(member.dod || '');
    setPhotoUrl(member.photoUrl || '');
    setBio(member.bio || '');
    setContactInfo(member.contactInfo || '');
    setTimeline(member.timeline ? [...member.timeline] : []);
    setGallery(member.gallery ? [...member.gallery] : []);
    setRelatedMemberId('');
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setSelectedMemberId(null);

    setFirstName('');
    setLastName('');
    setGender('Male');
    setDob('');
    setDod('');
    setPhotoUrl('');
    setBio('');
    setContactInfo('');
    setTimeline([]);
    setGallery([]);
  };

  // Submit Member Form
  const handleSubmitMember = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !dob) {
      showToast('First Name, Last Name, and Date of Birth are required.', 'error');
      return;
    }

    const memberData: Member = {
      id: isCreatingNew ? `m_${Date.now()}` : selectedMemberId!,
      firstName,
      lastName,
      gender,
      dob,
      dod: dod || null,
      photoUrl,
      bio,
      contactInfo,
      timeline,
      gallery,
    };

    if (isCreatingNew) {
      onAddMember(memberData);
      showToast('Family member added successfully!', 'success');
      handleSelectMember(memberData);
    } else {
      onUpdateMember(memberData);
      showToast('Member profile updated successfully!', 'success');
    }
  };

  // Timeline Event handlers
  const handleAddTimelineEvent = () => {
    const newEvent: TimelineEvent = {
      id: `t_${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: '',
      description: '',
    };
    setTimeline([...timeline, newEvent]);
  };

  const handleUpdateTimelineEvent = (index: number, field: keyof TimelineEvent, value: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };

  const handleRemoveTimelineEvent = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  // Gallery Item handlers
  const handleAddGalleryItem = () => {
    const newItem: GalleryItem = {
      id: `g_${Date.now()}`,
      type: 'image',
      url: '',
      caption: '',
    };
    setGallery([...gallery, newItem]);
  };

  const handleUpdateGalleryItem = (index: number, field: keyof GalleryItem, value: string) => {
    const updated = [...gallery];
    updated[index] = { ...updated[index], [field]: value } as GalleryItem;
    setGallery(updated);
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  // Relationship actions
  const handleAddRelationshipClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMemberId || !relatedMemberId) {
      showToast('Please select a member to connect.', 'error');
      return;
    }

    // Determine direction of relation parameters:
    // If Parent-Child, selectedMember is Parent, relatedMember is Child
    const validationError = validateRelationship(
      {
        type: newRelationType,
        p1: selectedMemberId,
        p2: relatedMemberId,
      },
      relationships,
      members
    );

    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    const newRelation: Relationship = {
      id: `r_${Date.now()}`,
      ...(newRelationType === 'Spouse'
        ? { spouseId1: selectedMemberId, spouseId2: relatedMemberId }
        : { parentId: selectedMemberId, childId: relatedMemberId }),
    };

    onAddRelationship(newRelation);
    showToast('Relationship connected successfully!', 'success');
    setRelatedMemberId('');
  };

  // Find existing relations for selected member
  const activeRelations = relationships.filter(
    (r) =>
      selectedMemberId &&
      (r.spouseId1 === selectedMemberId ||
        r.spouseId2 === selectedMemberId ||
        r.parentId === selectedMemberId ||
        r.childId === selectedMemberId)
  );

  return (
    <div className="admin-workspace">
      {/* Left Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Manage Members</h3>
          <input
            type="text"
            className="form-input"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-member-btn" onClick={handleStartCreate}>
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        </div>

        <div className="members-list-container">
          <div className="members-list">
            {filteredMembers.map((m) => {
              const birthYear = m.dob ? m.dob.split('-')[0] : '?';
              const deathYear = m.dod ? m.dod.split('-')[0] : 'Present';
              
              let borderStyle = {};
              if (m.gender === 'Male') borderStyle = { borderLeft: '3px solid hsl(var(--color-male))' };
              else if (m.gender === 'Female') borderStyle = { borderLeft: '3px solid hsl(var(--color-female))' };
              else borderStyle = { borderLeft: '3px solid hsl(var(--color-other))' };

              return (
                <div
                  key={m.id}
                  className={`member-list-item glass ${selectedMemberId === m.id ? 'selected' : ''}`}
                  onClick={() => handleSelectMember(m)}
                  style={borderStyle}
                >
                  <div className="member-item-info">
                    <div className="member-item-avatar">
                      <img
                        src={m.photoUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div className="member-item-name">
                        {m.firstName} {m.lastName}
                      </div>
                      <div className="member-item-dates">
                        {birthYear} – {deathYear}
                      </div>
                    </div>
                  </div>
                  <button
                    className="delete-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${m.firstName} ${m.lastName} and all their relationships?`)) {
                        onDeleteMember(m.id);
                        if (selectedMemberId === m.id) {
                          setSelectedMemberId(null);
                          setIsEditing(false);
                        }
                        showToast('Member removed from records.', 'success');
                      }
                    }}
                    title="Delete member"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {filteredMembers.length === 0 && (
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No members found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="admin-details-area">
        {(!isEditing && !isCreatingNew) ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'hsl(var(--text-muted))',
              gap: '1rem',
            }}
          >
            <UserCheck size={48} strokeWidth={1} />
            <p>Select a family member from the sidebar or add a new record to begin editing.</p>
          </div>
        ) : (
          <>
            {/* Member Profile Editor */}
            <div className="admin-card glass">
              <h3 className="admin-card-title">
                <Calendar size={18} />
                <span>{isCreatingNew ? 'Create New Member Profile' : 'Edit Member Profile'}</span>
              </h3>

              <form onSubmit={handleSubmitMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="first-name">First Name *</label>
                    <input
                      id="first-name"
                      type="text"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="last-name">Last Name *</label>
                    <input
                      id="last-name"
                      type="text"
                      className="form-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gender-select">Gender *</label>
                    <select
                      id="gender-select"
                      className="form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="photo-url">Avatar Photo URL</label>
                    <input
                      id="photo-url"
                      type="text"
                      className="form-input"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="dob-input">Date of Birth *</label>
                    <input
                      id="dob-input"
                      type="date"
                      className="form-input"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="dod-input">Date of Death (Leave blank if alive)</label>
                    <input
                      id="dod-input"
                      type="date"
                      className="form-input"
                      value={dod}
                      onChange={(e) => setDod(e.target.value)}
                    />
                  </div>

                  <div className="form-group form-full-width">
                    <label className="form-label" htmlFor="contact-info">Contact Info (Optional)</label>
                    <input
                      id="contact-info"
                      type="text"
                      className="form-input"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="email@example.com or Phone number"
                    />
                  </div>

                  <div className="form-group form-full-width">
                    <label className="form-label" htmlFor="bio-textarea">Biography</label>
                    <textarea
                      id="bio-textarea"
                      className="form-textarea"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief life story..."
                    />
                  </div>
                </div>

                {/* Timeline Events Builder */}
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Timeline Events</label>
                  <div className="timeline-editor-list">
                    {timeline.map((evt, idx) => (
                      <div className="timeline-editor-row" key={evt.id}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Year"
                          value={evt.year}
                          onChange={(e) => handleUpdateTimelineEvent(idx, 'year', e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Event Title"
                          value={evt.title}
                          onChange={(e) => handleUpdateTimelineEvent(idx, 'title', e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Description"
                          value={evt.description}
                          onChange={(e) => handleUpdateTimelineEvent(idx, 'description', e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <button
                          type="button"
                          className="delete-action-btn"
                          onClick={() => handleRemoveTimelineEvent(idx)}
                          style={{ alignSelf: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="add-event-btn" onClick={handleAddTimelineEvent}>
                      <span>+ Add Timeline Event</span>
                    </button>
                  </div>
                </div>

                {/* Multi-media Gallery Editor */}
                <div style={{ marginTop: '1.5rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Media Gallery</label>
                  <div className="timeline-editor-list">
                    {gallery.map((item, idx) => (
                      <div className="timeline-editor-row" key={item.id} style={{ gridTemplateColumns: '100px 1fr 180px auto' }}>
                        <select
                          className="form-select"
                          value={item.type}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'type', e.target.value)}
                          style={{ width: '100%', padding: '0.4rem' }}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Media URL (e.g. https://...)"
                          value={item.url}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'url', e.target.value)}
                          style={{ width: '100%' }}
                          required
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Caption (Optional)"
                          value={item.caption || ''}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'caption', e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <button
                          type="button"
                          className="delete-action-btn"
                          onClick={() => handleRemoveGalleryItem(idx)}
                          style={{ alignSelf: 'center' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="add-event-btn" onClick={handleAddGalleryItem}>
                      <span>+ Add Gallery Media</span>
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    <Save size={16} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} />
                    <span>Save Profile</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Relationship Editor Panel */}
            {!isCreatingNew && selectedMember && (
              <div className="admin-card glass">
                <h3 className="admin-card-title">
                  <Link size={18} />
                  <span>Relationship Mapping</span>
                </h3>

                <div className="relations-manager">
                  {/* Create Relationship Panel */}
                  <form onSubmit={handleAddRelationshipClick} className="relationship-creator-panel">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Establish Connection</label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 650 }}>
                          {selectedMember.firstName} {selectedMember.lastName}
                        </span>
                        <select
                          className="form-select"
                          value={newRelationType}
                          onChange={(e) => setNewRelationType(e.target.value as any)}
                          style={{ padding: '0.5rem' }}
                        >
                          <option value="Spouse">is Spouse of</option>
                          <option value="Parent-Child">is Parent of</option>
                        </select>
                        <select
                          className="form-select"
                          value={relatedMemberId}
                          onChange={(e) => setRelatedMemberId(e.target.value)}
                          style={{ padding: '0.5rem', flex: 1 }}
                          required
                        >
                          <option value="">-- Choose Member --</option>
                          {members
                            .filter((m) => m.id !== selectedMemberId)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.firstName} {m.lastName} ({m.gender})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="submit-btn" style={{ padding: '0.6rem 1rem' }}>
                      Add Connection
                    </button>
                  </form>

                  {/* List Existing Relationships */}
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                      Current Connections
                    </label>
                    <div className="existing-relations-grid">
                      {activeRelations.map((r) => {
                        const isSpouseType = !!(r.spouseId1 && r.spouseId2);
                        
                        let member1: Member | undefined;
                        let member2: Member | undefined;

                        if (isSpouseType) {
                          member1 = members.find((m) => m.id === r.spouseId1);
                          member2 = members.find((m) => m.id === r.spouseId2);
                          if (!member1 || !member2) return null;
                        } else {
                          member1 = members.find((m) => m.id === r.parentId);
                          member2 = members.find((m) => m.id === r.childId);
                          if (!member1 || !member2) return null;
                        }

                        return (
                          <div className="relation-editor-card" key={r.id}>
                            <div className="relation-flow-desc">
                              {isSpouseType ? (
                                <>
                                  <span>{member1.firstName}</span>
                                  <Heart size={12} color="hsl(var(--color-female))" fill="hsl(var(--color-female))" />
                                  <span>{member2.firstName}</span>
                                </>
                              ) : (
                                <>
                                  <span>{member1.firstName}</span>
                                  <ArrowRight size={12} className="arrow-indicator" />
                                  <span>{member2.firstName}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>(Child)</span>
                                </>
                              )}
                            </div>
                            <button
                              className="delete-action-btn"
                              onClick={() => {
                                if (confirm(`Remove this connection between ${member1?.firstName} and ${member2?.firstName}?`)) {
                                  onDeleteRelationship(r.id);
                                  showToast('Relationship disconnected.', 'success');
                                }
                              }}
                              title="Delete connection"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                      {activeRelations.length === 0 && (
                        <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem', gridColumn: 'span 2', fontStyle: 'italic' }}>
                          No relationships mapped for this member.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
