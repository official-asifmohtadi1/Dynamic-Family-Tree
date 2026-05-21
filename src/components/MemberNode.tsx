import React from 'react';
import type { Member } from '../types';
import { User } from 'lucide-react';

interface MemberNodeProps {
  member: Member;
  x: number;
  y: number;
  relationState: 'normal' | 'highlighted' | 'muted';
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

export const MemberNode = React.memo<MemberNodeProps>(({
  member,
  x,
  y,
  relationState,
  onHoverStart,
  onHoverEnd,
  onClick,
}) => {
  const { firstName, lastName, gender, dob, dod, photoUrl } = member;

  // Format lifespan
  const birthYear = dob ? dob.split('-')[0] : '?';
  const deathYear = dod ? dod.split('-')[0] : 'Present';
  const lifespan = `${birthYear} – ${deathYear}`;

  // Generate a premium gradient avatar fallback based on initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  // Calculate dynamic colors based on gender
  let genderClass = 'other';
  let gradientColor = 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'; // Purple for Other
  
  if (gender === 'Male') {
    genderClass = 'male';
    gradientColor = 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)';
  } else if (gender === 'Female') {
    genderClass = 'female';
    gradientColor = 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)';
  }

  return (
    <div
      className={`member-node glass ${genderClass} ${
        relationState === 'highlighted' ? 'highlighted' : ''
      } ${relationState === 'muted' ? 'muted' : ''}`}
      style={{
        left: x - 110, // width is 220px, so center it on x
        top: y,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      <div className="avatar-container">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="avatar-image"
            loading="lazy"
            onError={(e) => {
              // If image fails to load, clear it to trigger fallback initials
              e.currentTarget.style.display = 'none';
              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="avatar-fallback"
          style={{
            background: gradientColor,
            display: photoUrl ? 'none' : 'flex',
          }}
        >
          {initials || <User size={18} />}
        </div>
      </div>

      <div className="node-info">
        <div className="node-name" title={`${firstName} ${lastName}`}>
          {firstName} {lastName}
        </div>
        <div className="node-lifespan">{lifespan}</div>
        <span className="node-role-badge">
          {gender}
        </span>
      </div>
    </div>
  );
});

