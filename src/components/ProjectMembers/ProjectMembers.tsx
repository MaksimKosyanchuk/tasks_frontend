import type { ProjectMember } from '../../api/projects.api';

import "./ProjectMembers.css";

type ProjectMembersProps = {
    members: ProjectMember[];
    onAddMember: () => void;
    onRoleChange: (userId: string, role: 'OWNER' | 'MEMBER') => void;
    onRemoveMember: (userId: string) => void;
};

function ProjectMembers({ members, onAddMember, onRoleChange, onRemoveMember }: ProjectMembersProps) {
    return (
        <aside className="project-members">
            <div className="project-members-header">
                <div>
                    <h2>Members</h2>
                    <span className="project-members-count">{members.length}</span>
                </div>
                <button type="button" className="add-member-button" onClick={onAddMember} aria-label="Add member">
                    +
                </button>
            </div>

            <div className="project-members-list">
                {members.length === 0 ? (
                    <p className="no-project-members">No members yet</p>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className="project-member">
                            <div className="project-member-info">
                                <strong>{member.user.nickName}</strong>
                                <span>{member.user.email}</span>
                            </div>

                            <select value={member.role} onChange={(e) => onRoleChange(member.user.id, e.target.value as 'OWNER' | 'MEMBER')}>
                                <option value="OWNER">Owner</option>
                                <option value="MEMBER">Member</option>
                            </select>

                            <button type="button" className="delete-member-button" onClick={() => onRemoveMember(member.user.id)}>
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

export default ProjectMembers;