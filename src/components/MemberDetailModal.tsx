import React from 'react';
import type { Member, Relationship } from '../types';
import { X, Calendar, BookOpen, Users, GitBranch, Heart, Image, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface MemberDetailModalProps {
  member: Member;
  allMembers: Member[];
  relationships: Relationship[];
  onClose: () => void;
  onSelectMember: (id: string) => void;
  onFocusBranch: (id: string) => void;
  isFocusedBranch: boolean;
  onClearFocusBranch: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  allMembers,
  relationships,
  onClose,
  onSelectMember,
  onFocusBranch,
  isFocusedBranch,
  onClearFocusBranch,
}) => {
  const { id, firstName, lastName, gender, dob, dod, photoUrl, bio, contactInfo, timeline = [], gallery = [] } = member;
  const [activeMediaIndex, setActiveMediaIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveMediaIndex(0);
  }, [id]);

  // Calculate life span years
  const birthYear = dob ? dob.split('-')[0] : '?';
  const deathYear = dod ? dod.split('-')[0] : 'Present';
  const lifespan = `${birthYear} – ${deathYear}`;

  // Find related members
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  const parents: Member[] = [];
  let spouse: Member | null = null;
  const children: Member[] = [];
  const siblings: Member[] = [];

  relationships.forEach((r) => {
    // Parent-Child
    if (r.parentId && r.childId) {
      if (r.childId === id && memberMap.has(r.parentId)) {
        parents.push(memberMap.get(r.parentId)!);
      }
      if (r.parentId === id && memberMap.has(r.childId)) {
        children.push(memberMap.get(r.childId)!);
      }
    }
    // Spouse
    if (r.spouseId1 && r.spouseId2) {
      if (r.spouseId1 === id && memberMap.has(r.spouseId2)) {
        spouse = memberMap.get(r.spouseId2)!;
      }
      if (r.spouseId2 === id && memberMap.has(r.spouseId1)) {
        spouse = memberMap.get(r.spouseId1)!;
      }
    }
  });

  // Calculate siblings (people who share at least one parent in common, excluding oneself)
  if (parents.length > 0) {
    const parentIds = parents.map((p) => p.id);
    const siblingSet = new Set<string>();

    relationships.forEach((r) => {
      if (r.parentId && r.childId && parentIds.includes(r.parentId) && r.childId !== id) {
        if (memberMap.has(r.childId)) {
          siblingSet.add(r.childId);
        }
      }
    });

    siblingSet.forEach((sibId) => siblings.push(memberMap.get(sibId)!));
  }

  // Generate initials for avatar fallback
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  let gradientColor = 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)';
  if (gender === 'Male') {
    gradientColor = 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)';
  } else if (gender === 'Female') {
    gradientColor = 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)';
  }

  // Generate fallback timeline if none specified
  const displayTimeline: { id: string; year: string; title: string; description: string }[] = [];
  if (timeline.length > 0) {
    displayTimeline.push(...[...timeline].sort((a, b) => parseInt(a.year) - parseInt(b.year)));
  } else {
    displayTimeline.push({ id: 'birth', year: birthYear, title: 'Born', description: `Born on ${dob}` });
    if (spouse) {
      displayTimeline.push({
        id: 'marriage',
        year: '–',
        title: 'Marriage',
        description: `Married to ${(spouse as Member).firstName} ${(spouse as Member).lastName}`,
      });
    }
    if (dod) {
      displayTimeline.push({ id: 'death', year: deathYear, title: 'Passed Away', description: `Passed away on ${dod}` });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Hero Header */}
        <div className="modal-header-hero">
          <div className="modal-avatar-wrapper">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="modal-avatar-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="avatar-fallback"
              style={{
                background: gradientColor,
                display: photoUrl ? 'none' : 'flex',
                height: '100%',
                width: '100%',
              }}
            >
              {initials}
            </div>
          </div>

          <div className="modal-header-details">
            <h2 className="modal-name">{firstName} {lastName}</h2>
            <div className="modal-dates">{lifespan}</div>

            <div className="modal-quick-actions">
              {isFocusedBranch ? (
                <button className="modal-btn" onClick={onClearFocusBranch}>
                  <GitBranch size={14} />
                  <span>Show Full Tree</span>
                </button>
              ) : (
                <button className="modal-btn" onClick={() => { onFocusBranch(id); onClose(); }}>
                  <GitBranch size={14} />
                  <span>Focus This Branch</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Biography */}
          <div className="modal-section">
            <h3 className="modal-section-title">
              <BookOpen size={16} />
              <span>Biography</span>
            </h3>
            <p className="modal-bio-text">
              {bio || `${firstName} is a valued member of the Pendragon family tree. Add details to their story in the Admin Dashboard.`}
            </p>
            {contactInfo && (
              <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
                <strong>Contact Info:</strong> {contactInfo}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="modal-section">
            <h3 className="modal-section-title">
              <Calendar size={16} />
              <span>Life Timeline</span>
            </h3>
            <div className="timeline-list">
              {displayTimeline.map((evt) => (
                <div className="timeline-item" key={evt.id}>
                  <div className="timeline-marker"></div>
                  <div className="timeline-year">{evt.year}</div>
                  <div className="timeline-event-title">{evt.title}</div>
                  <div className="timeline-desc">{evt.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Media Gallery */}
          {gallery && gallery.length > 0 && (
            <div className="modal-section">
              <h3 className="modal-section-title">
                <Image size={16} />
                <span>Media Gallery ({gallery.length})</span>
              </h3>
              <div className="gallery-carousel-wrapper">
                <div className="gallery-main-view glass">
                  {gallery[activeMediaIndex].type === 'video' ? (
                    <video
                      src={gallery[activeMediaIndex].url}
                      controls
                      className="gallery-main-video"
                    />
                  ) : (
                    <img
                      src={gallery[activeMediaIndex].url}
                      alt={gallery[activeMediaIndex].caption || 'Family Gallery'}
                      className="gallery-main-img"
                    />
                  )}
                  {gallery[activeMediaIndex].caption && (
                    <div className="gallery-caption-overlay">
                      {gallery[activeMediaIndex].caption}
                    </div>
                  )}

                  {gallery.length > 1 && (
                    <>
                      <button
                        className="carousel-control-btn prev"
                        onClick={() =>
                          setActiveMediaIndex((prev) =>
                            prev === 0 ? gallery.length - 1 : prev - 1
                          )
                        }
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        className="carousel-control-btn next"
                        onClick={() =>
                          setActiveMediaIndex((prev) =>
                            prev === gallery.length - 1 ? 0 : prev + 1
                          )
                        }
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {gallery.length > 1 && (
                  <div className="gallery-thumbnails">
                    {gallery.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`gallery-thumb ${idx === activeMediaIndex ? 'active' : ''}`}
                        onClick={() => setActiveMediaIndex(idx)}
                      >
                        {item.type === 'video' ? (
                          <div className="gallery-thumb-video-placeholder">
                            <Play size={14} fill="currentColor" />
                          </div>
                        ) : (
                          <img src={item.url} alt="" className="gallery-thumb-img" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Family Connections */}
          <div className="modal-section">
            <h3 className="modal-section-title">
              <Users size={16} />
              <span>Immediate Family</span>
            </h3>
            
            <div className="connections-grid">
              {/* Spouse */}
              {spouse && (
                <div className="relation-card glass" onClick={() => onSelectMember((spouse as Member).id)}>
                  <div className="relation-avatar">
                    <img src={(spouse as Member).photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="relation-meta">
                    <div className="relation-name">{(spouse as Member).firstName}</div>
                    <div className="relation-label">Spouse <Heart size={8} color="pink" fill="pink" style={{ display: 'inline', marginLeft: 2 }} /></div>
                  </div>
                </div>
              )}

              {/* Parents */}
              {parents.map((parent) => (
                <div className="relation-card glass" key={parent.id} onClick={() => onSelectMember(parent.id)}>
                  <div className="relation-avatar">
                    <img src={parent.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="relation-meta">
                    <div className="relation-name">{parent.firstName}</div>
                    <div className="relation-label">Parent</div>
                  </div>
                </div>
              ))}

              {/* Siblings */}
              {siblings.map((sib) => (
                <div className="relation-card glass" key={sib.id} onClick={() => onSelectMember(sib.id)}>
                  <div className="relation-avatar">
                    <img src={sib.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="relation-meta">
                    <div className="relation-name">{sib.firstName}</div>
                    <div className="relation-label">Sibling</div>
                  </div>
                </div>
              ))}

              {/* Children */}
              {children.map((child) => (
                <div className="relation-card glass" key={child.id} onClick={() => onSelectMember(child.id)}>
                  <div className="relation-avatar">
                    <img src={child.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div className="relation-meta">
                    <div className="relation-name">{child.firstName}</div>
                    <div className="relation-label">Child</div>
                  </div>
                </div>
              ))}

              {/* Empty state for connections */}
              {!spouse && parents.length === 0 && siblings.length === 0 && children.length === 0 && (
                <div style={{ gridColumn: 'span 2', fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>
                  No immediate family members registered.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
